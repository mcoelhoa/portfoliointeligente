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
}

// Interface para as respostas do webhook
interface WebhookResponseItem {
  message: string;
  typeMessage: 'text' | 'audio' | 'image' | 'document' | 'video';
}

interface WebhookResponse {
  messages?: WebhookResponseItem[];
  message?: string;
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
async function sendMessageToWebhook(
  agentName: string, 
  message: string, 
  typeMessage: "text" | "audio" = "text"
): Promise<WebhookResponse[] | null> {
  try {
    const urlFriendlyName = convertToUrlFriendly(agentName);
    
    const payload = {
      agent: urlFriendlyName,
      message: message,
      typeMessage: typeMessage
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
      return null;
    } else {
      console.log('Mensagem enviada com sucesso para o webhook');
      
      // Parse e retorna a resposta do webhook
      const responseData = await response.json();
      console.log('Resposta bruta do webhook:', responseData);
      
      // Retorna a resposta como um array
      if (Array.isArray(responseData)) {
        return responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Se for apenas um objeto, coloque-o em um array
        return [responseData];
      }
      
      return null;
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem para o webhook:', error);
    return null;
  }
}

export default function ChatModal({ isOpen, onClose, agent }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Função para iniciar gravação de áudio
  const startRecording = async () => {
    try {
      setAudioChunks([]);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(chunks => [...chunks, e.data]);
        }
      };
      
      recorder.onstop = () => {
        // Quando a gravação parar, envia o áudio
        handleSendAudio();
      };
      
      recorder.start();
      setAudioRecorder(recorder);
      setIsRecording(true);
      
      console.log("Gravação de áudio iniciada");
    } catch (error) {
      console.error("Erro ao iniciar gravação de áudio:", error);
      alert("Não foi possível iniciar a gravação de áudio. Verifique se seu navegador tem permissão para acessar o microfone.");
    }
  };

  // Função para parar gravação de áudio
  const stopRecording = () => {
    if (audioRecorder && isRecording) {
      audioRecorder.stop();
      setIsRecording(false);
      
      // Fechar as trilhas da stream
      if (audioRecorder.stream) {
        audioRecorder.stream.getTracks().forEach(track => track.stop());
      }
      
      console.log("Gravação de áudio finalizada");
    }
  };
  
  // Função para enviar o áudio gravado para o webhook
  const handleSendAudio = async () => {
    if (audioChunks.length === 0) return;
    
    try {
      // Criar um blob com todos os chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Converter o blob para base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        // Obter o base64 removendo o prefixo (data:audio/webm;base64,)
        const base64Audio = reader.result?.toString().split(',')[1] || '';
        
        // Adicionar mensagem do usuário na UI
        const userMessage: Message = {
          id: Date.now(),
          content: "🎤 Áudio enviado",
          type: 'audio',
          sender: 'user',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Enviar áudio para o webhook
        setIsTyping(true);
        const webhookResponses = await sendMessageToWebhook(agent.name, base64Audio, "audio");
        
        // Processar resposta do webhook
        if (webhookResponses && webhookResponses.length > 0) {
          await addAgentMessagesWithDelay(webhookResponses);
        } else {
          setIsTyping(false);
        }
        
        // Limpar os chunks de áudio
        setAudioChunks([]);
      };
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      setIsTyping(false);
    }
  };

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
        
        // Envia a mensagem de boas-vindas do agente para o webhook
        sendMessageToWebhook(agent.name, welcomeMessage, "text");
      }, 500);
    } else {
      setMessages([]);
      setInputValue('');
      if (isRecording) {
        stopRecording();
      }
    }
  }, [isOpen, agent]);

  // Função para adicionar mensagens do agente com atraso sequencial
  const addAgentMessagesWithDelay = async (responses: WebhookResponse[]) => {
    setIsTyping(true);
    
    // Processar cada resposta do webhook sequencialmente
    for (let responseIdx = 0; responseIdx < responses.length; responseIdx++) {
      const response = responses[responseIdx];
      
      // Processar cada mensagem dentro da resposta
      if (response.messages && Array.isArray(response.messages)) {
        for (let msgIdx = 0; msgIdx < response.messages.length; msgIdx++) {
          // Espera 2 segundos antes de mostrar a próxima mensagem (exceto para a primeira)
          if (msgIdx > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          const messageItem = response.messages[msgIdx];
          
          const newMessage: Message = {
            id: Date.now() + responseIdx + msgIdx,
            content: messageItem.message,
            type: messageItem.typeMessage as 'text' | 'audio' | 'image' | 'document' | 'video',
            sender: 'agent',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      } else if (response.message) {
        // Se não tiver array de mensagens, mas tiver uma única mensagem
        const newMessage: Message = {
          id: Date.now() + responseIdx,
          content: response.message,
          type: 'text',
          sender: 'agent',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    }
    
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
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
    
    try {
      // Enviar mensagem do usuário para o webhook e obter resposta
      const webhookResponses = await sendMessageToWebhook(agent.name, messageText);
      
      console.log("Resposta do webhook:", webhookResponses);
      
      // Verifica se tem a palavra piada para usar resposta especial
      if (messageText.toLowerCase().includes('piada')) {
        const piadaResponse = [
          {
            messages: [
              {
                message: "Claro! Aqui vai uma piada:",
                typeMessage: "text"
              },
              {
                message: "Por que o computador foi ao médico?",
                typeMessage: "text"
              },
              {
                message: "Porque ele estava com um vírus!",
                typeMessage: "text"
              }
            ]
          }
        ];
        await addAgentMessagesWithDelay(piadaResponse);
        return;
      }
      
      // Detecta webhook respostas "Workflow was started" e responde com mensagem apropriada
      if (webhookResponses && 
          webhookResponses.length === 1 && 
          webhookResponses[0].message === "Workflow was started") {
        
        // Resposta especial para "Workflow was started"
        setTimeout(() => {
          const workflowMessage: Message = {
            id: Date.now() + 1,
            content: "Sua solicitação está sendo processada. Logo retornaremos com uma resposta!",
            type: 'text',
            sender: 'agent',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, workflowMessage]);
          setIsTyping(false);
        }, 1000);
        
        return;
      }
      
      // Processar resposta normal do webhook
      if (webhookResponses && webhookResponses.length > 0 && 
          (webhookResponses[0].messages || webhookResponses[0].message)) {
        // Processar as respostas do webhook com delay
        await addAgentMessagesWithDelay(webhookResponses);
      } else {
        console.warn("Resposta do webhook vazia ou inválida, usando resposta gerada localmente");
        // Fallback apenas se não houver resposta do webhook
        throw new Error("Resposta do webhook vazia ou em formato inválido");
      }
    } catch (error) {
      console.error("Erro ao processar resposta do webhook:", error);
      // Fallback para resposta gerada localmente apenas em caso de erro
      setTimeout(async () => {
        const responseText = getAgentResponse(agent, messageText);
        
        const agentResponse: Message = {
          id: Date.now() + 1,
          content: responseText,
          type: 'text',
          sender: 'agent',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, agentResponse]);
        setIsTyping(false);
      }, 1500);
    }
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
        className="bg-[#1d2541] rounded-xl w-full max-w-md mx-4 shadow-xl overflow-hidden"
        style={{ animation: 'zoom-in-bounce 300ms' }}
      >
        {/* Chat header */}
        <div className="bg-[#2d3a5e] p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#5c5dec] flex items-center justify-center mr-3">
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
        <div className="p-4 h-80 overflow-y-auto bg-[#1d2541] flex flex-col space-y-3">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user' 
                  ? 'bg-[#5c5dec] text-white rounded-tr-none' 
                  : 'bg-[#2d3a5e] text-white rounded-tl-none'}`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-70 block text-right mt-1">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#2d3a5e] p-3 rounded-lg rounded-tl-none">
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
        <div className="p-4 bg-[#1d2541] flex items-center">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..." 
            className="flex-1 bg-[#26304c] border-none rounded-full px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
          />
          
          {/* Botão de gravação de áudio */}
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`ml-2 w-12 h-12 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#3b4167] hover:bg-[#4b5187]'
            } text-white transition-colors`}
            title={isRecording ? "Parar gravação" : "Gravar áudio"}
          >
            <i className={`${isRecording ? 'ri-stop-fill' : 'ri-mic-fill'} text-xl`}></i>
          </button>
          
          {/* Botão de envio de mensagem */}
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`ml-2 w-12 h-12 rounded-full flex items-center justify-center ${
              inputValue.trim() 
                ? 'bg-[#5c5dec]' 
                : 'bg-[#3b4167]'
            } text-white`}
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