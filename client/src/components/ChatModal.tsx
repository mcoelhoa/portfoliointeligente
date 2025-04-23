import { useState, useEffect } from 'react';
import { Agent } from '@/data/agents';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

// Função para converter o nome do agente para um formato URL-friendly
function convertToUrlFriendly(name: string): string {
  return name
    .normalize('NFD') // normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '-'); // substitui espaços por hífens
}

// Função para enviar mensagem para o webhook através do proxy no servidor
async function sendMessageToWebhook(agentName: string, message: string) {
  try {
    const urlFriendlyName = convertToUrlFriendly(agentName);
    
    const payload = {
      agent: urlFriendlyName,
      message: message,
      typeMessage: "text"
    };
    
    console.log("Enviando mensagem para webhook:", payload);
    
    const response = await fetch('/api/webhook-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error('Erro ao enviar mensagem para o webhook');
    } else {
      console.log('Mensagem enviada com sucesso para o webhook');
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem para o webhook:', error);
  }
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
            text: welcomeMessage,
            sender: 'agent',
            timestamp: new Date()
          }
        ]);
        
        // Envia a mensagem de boas-vindas do agente para o webhook
        sendMessageToWebhook(agent.name, welcomeMessage);
      }, 500);
    } else {
      setMessages([]);
      setInputValue('');
    }
  }, [isOpen, agent]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to UI
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Enviar mensagem do usuário para o webhook
    await sendMessageToWebhook(agent.name, inputValue);
    
    const messageText = inputValue;
    setInputValue('');
    
    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate agent response after a delay
    setTimeout(async () => {
      const responseText = getAgentResponse(agent, messageText);
      
      const agentResponse: Message = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
      
      // Enviar resposta do agente para o webhook
      await sendMessageToWebhook(agent.name, responseText);
    }, 1500);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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
        className="bg-gradient-to-br from-[var(--primary-800)] to-[var(--primary-900)] rounded-xl w-full max-w-md mx-4 shadow-xl overflow-hidden"
        style={{ animation: 'zoom-in-bounce 300ms' }}
      >
        {/* Chat header */}
        <div className="bg-gradient-to-r from-[var(--secondary-500)] to-[var(--secondary-700)] p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
              <i className={`${agent.icon} text-lg text-white`}></i>
            </div>
            <div>
              <h3 className="font-tech text-white font-semibold">{agent.name}</h3>
              <p className="text-white/70 text-xs">Online</p>
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
        <div className="p-4 h-80 overflow-y-auto bg-[var(--primary-900)]/50 flex flex-col space-y-3">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user' 
                  ? 'bg-[var(--secondary-500)] text-white rounded-tr-none' 
                  : 'bg-[var(--primary-800)] text-white rounded-tl-none'}`}
              >
                <p>{message.text}</p>
                <span className="text-xs opacity-70 block text-right mt-1">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
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
        <div className="p-3 border-t border-[var(--primary-700)] flex items-center bg-[var(--primary-800)]">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..." 
            className="flex-1 bg-[var(--primary-900)]/90 border border-[var(--primary-700)] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-500)]"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`ml-2 w-10 h-10 rounded-full flex items-center justify-center ${
              inputValue.trim() 
                ? 'bg-[var(--secondary-500)] text-white' 
                : 'bg-[var(--primary-700)] text-gray-500'
            }`}
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate responses based on agent type and user input
function getAgentResponse(agent: Agent, userInput: string): string {
  const input = userInput.toLowerCase();
  const responses = {
    default: "Desculpe, não entendi completamente. Poderia fornecer mais detalhes?",
    greeting: "Olá! Como posso ajudar você hoje?",
    thanks: "Por nada! Estou aqui para ajudar. Há mais algo que você gostaria de saber?",
    pricing: "Nossos planos começam em R$99/mês com 7 dias de teste gratuito. Você gostaria de mais informações sobre nossos planos?",
    features: `Como ${agent.name}, posso ${agent.description.toLowerCase()} Gostaria de ver uma demonstração?`,
  };

  if (input.includes('olá') || input.includes('oi') || input.includes('bom dia') || input.includes('boa tarde') || input.includes('boa noite')) {
    return responses.greeting;
  }
  
  if (input.includes('obrigado') || input.includes('obrigada') || input.includes('valeu')) {
    return responses.thanks;
  }
  
  if (input.includes('preço') || input.includes('quanto custa') || input.includes('valor') || input.includes('plano')) {
    return responses.pricing;
  }
  
  if (input.includes('o que') || input.includes('como funciona') || input.includes('recursos') || input.includes('funcionalidades')) {
    return responses.features;
  }
  
  // Agent-specific responses based on their category
  switch (agent.id) {
    case 1: // Agente Comercial (SDR)
      if (input.includes('lead') || input.includes('prospect') || input.includes('venda')) {
        return "Posso ajudar a automatizar a prospecção de leads qualificados e agendar reuniões de vendas com os tomadores de decisão certos. Gostaria de ver como funciona?";
      }
      break;
    case 2: // Agente Clínicas
      if (input.includes('pacient') || input.includes('consult') || input.includes('agenda')) {
        return "Posso gerenciar agendamentos, enviar lembretes de consultas e fazer acompanhamento pós-atendimento com seus pacientes, reduzindo faltas em até 40%. Gostaria de uma demonstração?";
      }
      break;
    case 7: // Agente CS
      if (input.includes('suporte') || input.includes('cliente') || input.includes('atendimento')) {
        return "Posso automatizar respostas para perguntas frequentes, classificar tickets por prioridade e garantir que nenhum cliente fique sem resposta. Isso pode reduzir o tempo de resposta em até 80%.";
      }
      break;
    default:
      if (input.length > 15) {
        return `Entendi sua necessidade relacionada a "${userInput.substring(0, 20)}...". Como ${agent.name}, posso ajudar com isso usando nossa tecnologia de IA avançada. Podemos agendar uma demonstração para você ver como funciona na prática?`;
      }
  }
  
  return responses.default;
}