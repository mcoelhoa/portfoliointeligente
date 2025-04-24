import { useState, useEffect } from 'react';
import { Agent } from '@/data/agents';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

interface Message {
  id: number;
  content: string;
  type: 'text' | 'audio' | 'image' | 'document' | 'video';
  sender: 'user' | 'agent';
  timestamp: Date;
  duration?: number; // Duração em segundos para áudios
}

export default function ChatModal({ isOpen, onClose, agent }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initial welcome message from the agent
  useEffect(() => {
    if (isOpen) {
      const welcomeMessage = `Olá! Eu sou o ${agent.name}. Como posso ajudar você hoje?`;
      
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            content: welcomeMessage,
            type: 'text',
            sender: 'agent',
            timestamp: new Date()
          }
        ]);
      }, 500);
    } else {
      setMessages([]);
      setInputValue('');
    }
  }, [isOpen, agent]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message to UI
    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      type: 'text',
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const messageText = inputValue;
    setInputValue('');
    
    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      
      const agentResponse: Message = {
        id: Date.now() + 1,
        content: "Esta é uma resposta de exemplo. A integração com webhook será configurada em breve!",
        type: 'text',
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentResponse]);
    }, 1500);
  };

  // Handle clicks outside the modal to close it
  const handleOutsideClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLDivElement).classList.contains('modal-overlay')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 modal-overlay"
      onClick={handleOutsideClick}
    >
      <div 
        className="bg-[var(--primary-900)] rounded-xl w-full max-w-md mx-4 shadow-xl overflow-hidden"
        style={{ animation: 'zoom-in-bounce 300ms' }}
      >
        {/* Chat header */}
        <div className="bg-[var(--primary-800)] p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] flex items-center justify-center mr-3">
              <i className={`${agent.icon} text-xl text-white`}></i>
            </div>
            <div>
              <h3 className="font-tech text-white font-semibold text-lg">{agent.name}</h3>
              <p className="text-white/70 text-xs">Online agora</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        {/* Chat messages */}
        <div className="p-4 h-80 overflow-y-auto bg-[var(--primary-900)] flex flex-col space-y-3 chat-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`${message.type === 'audio' ? 'min-w-[100px]' : 'max-w-[80%]'} p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-[var(--secondary-600)] text-white rounded-tr-none' 
                    : 'bg-[var(--primary-800)] text-white rounded-tl-none'
                }`}
              >
                {message.type === 'audio' ? (
                  <div className="audio-message">
                    <div className="flex items-center">
                      <button 
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2 hover:bg-white/30 transition-colors"
                        title="Reproduzir áudio"
                      >
                        <i className="ri-play-fill text-white"></i>
                      </button>
                      <div className="flex-1">
                        <div className="w-full h-1 bg-white/30 rounded-full">
                          <div className="h-full w-0 bg-white rounded-full"></div>
                        </div>
                        <span className="text-xs text-white/70 mt-1 block">
                          {message.duration 
                            ? `${Math.floor(message.duration / 60)}:${(message.duration % 60).toString().padStart(2, '0')}` 
                            : '0:00'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs opacity-70 block text-right mt-1">
                      {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ) : (
                  <>
                    <p>{message.content}</p>
                    <span className="text-xs opacity-70 block text-right mt-1">
                      {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[var(--primary-800)] p-3 rounded-lg rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat input */}
        <div className="p-4 border-t border-[var(--primary-800)] bg-[var(--primary-900)] flex items-center space-x-2">
          <button 
            className="w-10 h-10 rounded-full bg-[var(--primary-800)] flex items-center justify-center hover:bg-[var(--primary-700)] transition-colors"
            title="Gravar áudio"
          >
            <i className="ri-mic-line text-white"></i>
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-[var(--primary-800)] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-500)]"
          />
          <button 
            onClick={handleSendMessage}
            className="w-10 h-10 rounded-full bg-[var(--secondary-600)] flex items-center justify-center hover:bg-[var(--secondary-700)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim()}
            title="Enviar mensagem"
          >
            <i className="ri-send-plane-fill text-white"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
