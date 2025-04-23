import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebhookProxy } from "./webhook-proxy";
import { WebSocketServer } from 'ws';

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Health check endpoint para monitoramento
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Configura o proxy do webhook
  setupWebhookProxy(app);

  const httpServer = createServer(app);

  // Configurar WebSocket
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      console.log('received: %s', message);
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
