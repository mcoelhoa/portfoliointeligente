import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useWebSocket, WebSocketMessage } from '@/hooks/use-websocket';

// Contexto para o WebSocket
interface WebSocketContextType {
  // Estado da conexão
  status: 'connecting' | 'open' | 'closing' | 'closed' | 'error';
  // Última mensagem recebida
  lastMessage: WebSocketMessage | null;
  // Função para enviar mensagem
  sendMessage: (message: WebSocketMessage) => void;
  // Conectar à um agente específico
  connectToAgent: (agentId: number) => void;
  // Desconectar
  disconnect: () => void;
  // ID do agente atual
  currentAgentId: number | null;
  // Estado de ativação do websocket
  isActive: boolean;
  // Ativar/desativar o websocket
  setActive: (active: boolean) => void;
}

// Valor padrão do contexto
const defaultContext: WebSocketContextType = {
  status: 'closed',
  lastMessage: null,
  sendMessage: () => {},
  connectToAgent: () => {},
  disconnect: () => {},
  currentAgentId: null,
  isActive: false,
  setActive: () => {}
};

// Criar o contexto
const WebSocketContext = createContext<WebSocketContextType>(defaultContext);

// Hook personalizado para acessar o contexto
export const useWebSocketContext = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

// Componente provider que gerencia a conexão WebSocket
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  // Estado para ativar/desativar o WebSocket
  const [isActive, setIsActive] = useState(false);
  
  // Estado para armazenar o ID do agente atual
  const [currentAgentId, setCurrentAgentId] = useState<number | null>(null);
  
  // Estado para as mensagens recebidas, separadas por agente
  const [messages, setMessages] = useState<Record<number, WebSocketMessage[]>>({});
  
  // Configurar o WebSocket usando o hook personalizado
  const {
    status,
    lastMessage,
    sendMessage: sendWebSocketMessage,
    connect,
    disconnect
  } = useWebSocket(
    currentAgentId || undefined,
    {
      onMessage: (message) => {
        console.log('[WebSocketProvider] Mensagem recebida:', message);
        
        if (message.agentId && message.agentId > 0) {
          // Adiciona mensagem ao histórico do agente específico
          setMessages(prev => {
            const agentMessages = prev[message.agentId!] || [];
            return {
              ...prev,
              [message.agentId!]: [...agentMessages, message]
            };
          });
        }
      },
      onOpen: () => {
        console.log('[WebSocketProvider] Conexão WebSocket estabelecida');
        
        // Ao abrir, se tiver um agentId, já envia uma inscrição
        if (currentAgentId && currentAgentId > 0) {
          sendWebSocketMessage({
            type: 'subscribe',
            agentId: currentAgentId
          });
          console.log('[WebSocketProvider] Enviada inscrição para agente:', currentAgentId);
        }
      },
      onClose: () => {
        console.log('[WebSocketProvider] Conexão WebSocket fechada');
      },
      onError: (error) => {
        console.error('[WebSocketProvider] Erro na conexão WebSocket:', error);
      },
      // Configurações de reconexão
      reconnectAttempts: 3,
      reconnectInterval: 5000,
      heartbeatInterval: 30000
    }
  );
  
  // Wrapper para sendMessage que só envia se o WebSocket estiver ativo
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (isActive) {
      console.log('[WebSocketProvider] Enviando mensagem:', message);
      return sendWebSocketMessage(message);
    } else {
      console.log('[WebSocketProvider] WebSocket não está ativo, mensagem não enviada:', message);
      return false;
    }
  }, [isActive, sendWebSocketMessage]);
  
  // Função para conectar à um agente específico
  const connectToAgent = useCallback((agentId: number) => {
    console.log('[WebSocketProvider] Conectando ao agente:', agentId);
    
    if (!isActive) {
      console.log('[WebSocketProvider] Ativando WebSocket para conectar ao agente');
      setIsActive(true);
    }
    
    if (currentAgentId !== agentId) {
      setCurrentAgentId(agentId);
      
      // Se já estiver conectado, enviar mensagem de inscrição
      if (status === 'open') {
        sendWebSocketMessage({
          type: 'subscribe',
          agentId
        });
        console.log('[WebSocketProvider] Enviada inscrição para agente (conexão existente):', agentId);
      } else {
        // Senão, reconectar com o novo agentId
        console.log('[WebSocketProvider] Iniciando nova conexão para agente:', agentId);
        connect();
      }
    }
  }, [currentAgentId, status, isActive, connect, sendWebSocketMessage]);
  
  // Função para ativar/desativar o WebSocket
  const setActive = useCallback((active: boolean) => {
    console.log('[WebSocketProvider] ' + (active ? 'Ativando' : 'Desativando') + ' WebSocket');
    setIsActive(active);
    
    if (active && status === 'closed') {
      console.log('[WebSocketProvider] Iniciando conexão WebSocket ao ativar');
      connect();
    } else if (!active && status !== 'closed') {
      console.log('[WebSocketProvider] Fechando conexão WebSocket ao desativar');
      disconnect();
    }
  }, [status, connect, disconnect]);
  
  // Efeito para conectar/desconectar quando o estado ativo muda
  useEffect(() => {
    if (isActive) {
      if (status === 'closed') {
        console.log('[WebSocketProvider] Iniciando conexão WebSocket (isActive mudou para true)');
        connect();
      }
    } else {
      if (status !== 'closed') {
        console.log('[WebSocketProvider] Fechando conexão WebSocket (isActive mudou para false)');
        disconnect();
      }
    }
  }, [isActive, status, connect, disconnect]);
  
  return (
    <WebSocketContext.Provider
      value={{
        status,
        lastMessage,
        sendMessage,
        connectToAgent,
        disconnect,
        currentAgentId,
        isActive,
        setActive
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;