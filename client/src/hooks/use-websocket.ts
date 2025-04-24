import { useState, useEffect, useRef, useCallback } from 'react';

export type WebSocketMessage = {
  type: string;
  agentId?: number;
  message?: string;
  data?: any;
  status?: string;
  timestamp?: string;
};

type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'error';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

interface UseWebSocketResult {
  sendMessage: (message: WebSocketMessage) => void;
  status: WebSocketStatus;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook personalizado para gerenciar conexões WebSocket com funcionalidades como
 * reconexão automática, heartbeat e tratamento de mensagens
 */
export function useWebSocket(
  agentId?: number,
  options: UseWebSocketOptions = {}
): UseWebSocketResult {
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000
  } = options;
  
  // Função para criar o WebSocket
  const createWebSocket = useCallback(() => {
    // Limpar os temporizadores existentes
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    
    // Fechar o socket existente se houver
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {
        // Ignora erros ao fechar
      }
    }
    
    // Construir a URL do WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Adicionar o agentId como parâmetro de consulta se fornecido
    if (agentId && agentId > 0) {
      wsUrl += `?agentId=${agentId}`;
    }
    
    try {
      // Criar nova conexão
      setStatus('connecting');
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('[WebSocket] Conexão estabelecida');
        setStatus('open');
        reconnectAttemptsRef.current = 0; // Reset contador de tentativas
        
        // Configurar o heartbeat para manter a conexão ativa
        heartbeatTimerRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, heartbeatInterval);
        
        // Se o agentId for fornecido, enviar uma mensagem de inscrição
        if (agentId && agentId > 0) {
          socket.send(JSON.stringify({
            type: 'subscribe',
            agentId
          }));
        }
        
        // Chamar o callback onOpen se fornecido
        if (onOpen) onOpen();
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
          
          // Se o tipo for 'pong', é apenas uma resposta de heartbeat
          if (message.type !== 'pong') {
            console.log('[WebSocket] Mensagem recebida:', message);
          }
          
          // Chamar o callback onMessage se fornecido
          if (onMessage) onMessage(message);
        } catch (error) {
          console.error('[WebSocket] Erro ao processar mensagem recebida:', error);
        }
      };
      
      socket.onclose = (event) => {
        console.log(`[WebSocket] Conexão fechada (${event.code}): ${event.reason}`);
        setStatus('closed');
        
        // Limpar o intervalo de heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        
        // Tentar reconectar se a conexão não foi fechada intencionalmente
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          console.log(`[WebSocket] Tentando reconectar em ${reconnectInterval}ms (tentativa ${reconnectAttemptsRef.current + 1}/${reconnectAttempts})`);
          
          reconnectTimerRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            createWebSocket();
          }, reconnectInterval);
        } else {
          console.log('[WebSocket] Número máximo de reconexões atingido');
        }
        
        // Chamar o callback onClose se fornecido
        if (onClose) onClose();
      };
      
      socket.onerror = (event) => {
        console.error('[WebSocket] Erro na conexão');
        setStatus('error');
        
        // Chamar o callback onError se fornecido
        if (onError) onError(event);
      };
    } catch (error) {
      console.error('[WebSocket] Erro ao criar conexão:', error);
      setStatus('error');
    }
  }, [
    agentId,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts,
    reconnectInterval,
    heartbeatInterval
  ]);
  
  // Função para enviar mensagens
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('[WebSocket] Tentativa de enviar mensagem com socket não conectado');
      return false;
    }
  }, []);
  
  // Função para conectar manualmente
  const connect = useCallback(() => {
    if (status !== 'connecting' && status !== 'open') {
      createWebSocket();
    }
  }, [status, createWebSocket]);
  
  // Função para desconectar manualmente
  const disconnect = useCallback(() => {
    // Limpar temporizadores
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    
    // Resetar contadores
    reconnectAttemptsRef.current = reconnectAttempts; // Impede reconexão automática
    
    // Fechar o socket se existir
    if (socketRef.current) {
      try {
        socketRef.current.close();
        socketRef.current = null;
        setStatus('closed');
      } catch (error) {
        console.error('[WebSocket] Erro ao fechar conexão:', error);
        setStatus('error');
      }
    }
  }, [reconnectAttempts]);
  
  // Conectar automaticamente ao montar o componente, apenas se autoConnect for true
  useEffect(() => {
    // Verificar se a página está em primeiro plano para evitar conexões desnecessárias
    if (document.visibilityState === 'visible') {
      createWebSocket();
      
      console.log('[WebSocket Hook] Iniciando conexão WebSocket...');
      
      // Evento para reconectar quando a visibilidade da página mudar
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && 
            (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)) {
          console.log('[WebSocket Hook] Página visível novamente, reconectando...');
          createWebSocket();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Limpar na desmontagem
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        disconnect();
        console.log('[WebSocket Hook] Conexão WebSocket encerrada na desmontagem');
      };
    } else {
      console.log('[WebSocket Hook] Página não está visível, adiando conexão WebSocket');
      
      // Se a página não estiver visível, adiar a conexão
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('[WebSocket Hook] Página visível agora, iniciando conexão WebSocket...');
          createWebSocket();
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        disconnect();
      };
    }
  }, [createWebSocket, disconnect]);
  
  return {
    sendMessage,
    status,
    lastMessage,
    connect,
    disconnect
  };
}