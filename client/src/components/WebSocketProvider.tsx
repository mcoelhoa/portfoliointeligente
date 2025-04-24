import React, { createContext, useContext, useEffect, useState } from 'react';
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
}

// Valor padrão do contexto
const defaultContext: WebSocketContextType = {
  status: 'closed',
  lastMessage: null,
  sendMessage: () => {},
  connectToAgent: () => {},
  disconnect: () => {},
  currentAgentId: null
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
  // Estado para armazenar o ID do agente atual
  const [currentAgentId, setCurrentAgentId] = useState<number | null>(null);
  
  // Estado para as mensagens recebidas, separadas por agente
  const [messages, setMessages] = useState<Record<number, WebSocketMessage[]>>({});
  
  // Configurar o WebSocket usando o hook personalizado
  const {
    status,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  } = useWebSocket(
    currentAgentId || undefined,
    {
      onMessage: (message) => {
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
        if (currentAgentId) {
          sendMessage({
            type: 'subscribe',
            agentId: currentAgentId
          });
        }
      },
      onClose: () => {
        console.log('[WebSocketProvider] Conexão WebSocket fechada');
      },
      onError: () => {
        console.error('[WebSocketProvider] Erro na conexão WebSocket');
      },
      // Configurações de reconexão
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      heartbeatInterval: 30000
    }
  );
  
  // Função para conectar à um agente específico
  const connectToAgent = (agentId: number) => {
    if (currentAgentId !== agentId) {
      setCurrentAgentId(agentId);
      
      // Se já estiver conectado, enviar mensagem de inscrição
      if (status === 'open') {
        sendMessage({
          type: 'subscribe',
          agentId
        });
      } else {
        // Senão, reconectar com o novo agentId
        connect();
      }
    }
  };
  
  return (
    <WebSocketContext.Provider
      value={{
        status,
        lastMessage,
        sendMessage,
        connectToAgent,
        disconnect,
        currentAgentId
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;