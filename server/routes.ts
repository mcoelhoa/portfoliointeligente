import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebhookProxy } from "./webhook-proxy";
import { WebSocketServer, WebSocket } from 'ws';

// Interfaces para mensagens do WebSocket
interface WebSocketMessage {
  type: string;
  agentId?: number;
  message?: string;
  data?: any;
}

// Mapa para armazenar conexões de clientes por agentId
const clientConnections = new Map<number, Set<WebSocket>>();

/**
 * Broadcast para todos os clientes conectados a um agente específico
 */
function broadcastToAgentClients(agentId: number, message: WebSocketMessage) {
  const clients = clientConnections.get(agentId);
  if (clients) {
    const messageString = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
    console.log(`[WebSocket] Mensagem enviada para ${clients.size} cliente(s) do agente ${agentId}`);
  } else {
    console.log(`[WebSocket] Nenhum cliente conectado ao agente ${agentId}`);
  }
}

/**
 * Envia uma mensagem para todas as conexões ativas
 */
function broadcastToAll(message: WebSocketMessage) {
  const messageString = JSON.stringify(message);
  let clientCount = 0;
  
  // Para cada conjunto de clientes de cada agente
  clientConnections.forEach((clients) => {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
        clientCount++;
      }
    });
  });
  
  console.log(`[WebSocket] Mensagem broadcast enviada para ${clientCount} cliente(s)`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Health check endpoint para monitoramento
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      websocket: {
        totalAgents: clientConnections.size,
        totalConnections: Array.from(clientConnections.values())
          .reduce((acc, clients) => acc + clients.size, 0)
      }
    });
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Configura o proxy do webhook
  setupWebhookProxy(app);

  // Endpoint para notificar todos os clientes conectados a um agente específico
  app.post('/api/notify-agent/:agentId', (req, res) => {
    const agentId = parseInt(req.params.agentId, 10);
    
    if (isNaN(agentId)) {
      return res.status(400).json({ error: 'ID do agente inválido' });
    }
    
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mensagem não fornecida' });
    }
    
    const wsMessage: WebSocketMessage = {
      type: 'notification',
      agentId,
      message
    };
    
    broadcastToAgentClients(agentId, wsMessage);
    
    return res.status(200).json({
      success: true,
      clientCount: (clientConnections.get(agentId) || new Set()).size
    });
  });

  const httpServer = createServer(app);

  // Configurar WebSocket
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    console.log('[WebSocket] Cliente conectado');
    
    // Parse URL parameters
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const agentId = parseInt(url.searchParams.get('agentId') || '0', 10);
    
    if (agentId > 0) {
      // Registra a conexão para o agente específico
      if (!clientConnections.has(agentId)) {
        clientConnections.set(agentId, new Set());
      }
      
      const agentClients = clientConnections.get(agentId)!;
      agentClients.add(ws);
      
      console.log(`[WebSocket] Cliente registrado para o agente ${agentId}. Total: ${agentClients.size}`);
      
      // Envia confirmação de conexão
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        agentId,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.log('[WebSocket] Cliente conectado sem ID de agente específico');
    }
    
    ws.on('message', (messageData) => {
      try {
        console.log(`[WebSocket] Mensagem recebida: ${messageData}`);
        
        // Parse da mensagem recebida
        const message = JSON.parse(messageData.toString()) as WebSocketMessage;
        
        // Processa diferentes tipos de mensagens
        switch (message.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
            
          case 'subscribe':
            // Cliente quer se inscrever para atualizações de um agente
            if (message.agentId && message.agentId > 0) {
              if (!clientConnections.has(message.agentId)) {
                clientConnections.set(message.agentId, new Set());
              }
              clientConnections.get(message.agentId)!.add(ws);
              
              console.log(`[WebSocket] Cliente inscrito no agente ${message.agentId}`);
              ws.send(JSON.stringify({
                type: 'subscription',
                status: 'subscribed',
                agentId: message.agentId
              }));
            }
            break;
            
          case 'message':
            // Cliente enviou uma mensagem para um agente
            if (message.agentId && message.message) {
              console.log(`[WebSocket] Mensagem para agente ${message.agentId}: ${message.message}`);
              
              // Aqui você poderia processar a mensagem ou encaminhá-la
              // Por exemplo, enviando para um webhook ou processando no servidor
              
              // Responde ao cliente
              ws.send(JSON.stringify({
                type: 'confirmation',
                status: 'received',
                agentId: message.agentId,
                timestamp: new Date().toISOString()
              }));
            }
            break;
            
          default:
            console.log(`[WebSocket] Tipo de mensagem desconhecido: ${message.type}`);
        }
      } catch (error) {
        console.error('[WebSocket] Erro ao processar mensagem:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Formato de mensagem inválido'
        }));
      }
    });
    
    // Detectar desconexão
    ws.on('close', () => {
      console.log('[WebSocket] Cliente desconectado');
      
      // Remove o cliente de todos os agentes aos quais estava conectado
      if (agentId > 0 && clientConnections.has(agentId)) {
        const agentClients = clientConnections.get(agentId)!;
        agentClients.delete(ws);
        
        // Se não houver mais clientes para este agente, remove o registro
        if (agentClients.size === 0) {
          clientConnections.delete(agentId);
          console.log(`[WebSocket] Último cliente do agente ${agentId} desconectado. Registro removido.`);
        } else {
          console.log(`[WebSocket] Cliente desconectado do agente ${agentId}. Restantes: ${agentClients.size}`);
        }
      } else {
        // Para clientes sem agentId específico ou em caso de reconexão,
        // precisamos verificar todos os conjuntos
        clientConnections.forEach((clients, id) => {
          if (clients.has(ws)) {
            clients.delete(ws);
            console.log(`[WebSocket] Cliente removido do agente ${id}`);
            
            if (clients.size === 0) {
              clientConnections.delete(id);
              console.log(`[WebSocket] Registro do agente ${id} removido`);
            }
          }
        });
      }
    });
  });

  return httpServer;
}
