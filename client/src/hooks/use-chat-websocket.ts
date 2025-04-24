import { useEffect, useCallback, useState } from 'react';
import { useWebSocketContext } from '@/components/WebSocketProvider';
import type { Agent } from '@/data/agents';

export interface ChatMessage {
  id: number;
  content: string;
  type: 'text' | 'audio' | 'image' | 'document' | 'video';
  sender: 'user' | 'agent';
  timestamp: Date;
  duration?: number;
}

interface UseChatWebSocketOptions {
  isOpen: boolean;
  agent: Agent;
  onMessageReceived?: (message: ChatMessage) => void;
}

/**
 * Hook personalizado para integrar WebSocket ao chat
 */
export function useChatWebSocket({
  isOpen,
  agent,
  onMessageReceived
}: UseChatWebSocketOptions) {
  const { 
    status, 
    connectToAgent, 
    setActive, 
    lastMessage,
    sendMessage
  } = useWebSocketContext();

  const [isConnected, setIsConnected] = useState(false);

  // Efeito para conectar ao WebSocket quando o chat for aberto
  useEffect(() => {
    if (isOpen && agent?.id) {
      console.log('[ChatWebSocket] Chat aberto, conectando ao WebSocket para o agente:', agent.id);
      setActive(true);
      connectToAgent(agent.id);
      setIsConnected(true);
    } else if (!isOpen && isConnected) {
      console.log('[ChatWebSocket] Chat fechado, desconectando do WebSocket');
      setActive(false);
      setIsConnected(false);
    }
    
    // Limpeza ao desmontar
    return () => {
      if (isConnected) {
        console.log('[ChatWebSocket] Componente desmontado, desconectando do WebSocket');
        setActive(false);
        setIsConnected(false);
      }
    };
  }, [isOpen, agent, connectToAgent, setActive, isConnected]);

  // Processar mensagens recebidas do WebSocket
  useEffect(() => {
    if (lastMessage && isConnected && onMessageReceived) {
      console.log('[ChatWebSocket] Mensagem recebida do WebSocket:', lastMessage);
      
      // Verificar se é uma mensagem destinada ao agente atual
      if (
        lastMessage.agentId === agent.id && 
        lastMessage.type === 'message' && 
        lastMessage.message
      ) {
        const chatMessage: ChatMessage = {
          id: Date.now(),
          content: lastMessage.message,
          type: 'text',
          sender: 'agent',
          timestamp: new Date()
        };
        
        onMessageReceived(chatMessage);
      }
    }
  }, [lastMessage, isConnected, agent.id, onMessageReceived]);

  // Função para enviar mensagem através do WebSocket
  const sendWebSocketMessage = useCallback((content: string, type: 'text' | 'audio' = 'text') => {
    if (isConnected && agent?.id) {
      console.log(`[ChatWebSocket] Enviando mensagem para o agente ${agent.id}:`, content);
      
      sendMessage({
        type: 'message',
        agentId: agent.id,
        message: content
      });
      
      return true;
    }
    
    console.log('[ChatWebSocket] Não foi possível enviar mensagem, WebSocket não conectado');
    return false;
  }, [isConnected, agent, sendMessage]);

  return {
    isConnected,
    connectionStatus: status,
    sendWebSocketMessage
  };
}