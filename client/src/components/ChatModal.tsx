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
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioTimer, setAudioTimer] = useState<NodeJS.Timeout | null>(null);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Função para iniciar gravação de áudio
  const startRecording = async () => {
    try {
      // Resetar o estado da gravação
      setAudioChunks([]);
      setAudioDuration(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          // Configuração para reduzir a qualidade do áudio e economizar tamanho
          channelCount: 1, // Mono
          sampleRate: 16000, // 16kHz é suficiente para voz
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Usando o codec de áudio mais compacto disponível, geralmente opus
      // Definindo baixo bitrate para áudio de voz
      const options = { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 12000 // Bitrate muito baixo (12kbps) próprio para voz
      };
      
      // Verificar se o codec é suportado, senão usar o padrão
      let recorder;
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        recorder = new MediaRecorder(stream, options);
      } else {
        // Fallback para o codec padrão
        recorder = new MediaRecorder(stream);
        console.warn("Codec Opus não suportado, usando codec padrão");
      }
      
      // Armazenamento local para os chunks
      const localChunks: Blob[] = [];
      
      // Função para processar dados disponíveis
      recorder.ondataavailable = (e) => {
        console.log(`Chunk de dados recebido: ${e.data.size} bytes`);
        if (e.data && e.data.size > 0) {
          // Adiciona aos chunks locais e atualiza estado
          localChunks.push(e.data);
          console.log(`Total de chunks locais: ${localChunks.length}`);
        }
      };
      
      // Quando a gravação parar
      recorder.onstop = () => {
        console.log(`Gravação finalizada. Total de chunks capturados: ${localChunks.length}`);
        
        // Atualiza o estado com todos os chunks de uma vez só
        if (localChunks.length > 0) {
          setAudioChunks(localChunks);
          
          // Pequeno timeout para garantir que o estado foi atualizado
          setTimeout(() => {
            console.log("Enviando áudio para processamento após timeout...");
            handleSendAudio();
          }, 500);
        } else {
          console.warn("Nenhum chunk de áudio foi capturado durante a gravação");
        }
        
        // Limpar o timer quando a gravação parar
        if (audioTimer) {
          clearInterval(audioTimer);
          setAudioTimer(null);
        }
      };
      
      // Definir um intervalo curto para obter chunks menores (500ms)
      recorder.start(500);
      setAudioRecorder(recorder);
      setIsRecording(true);
      
      // Iniciar o temporizador para atualizar a duração em tempo real (precisamente a cada segundo)
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setAudioDuration(elapsedSeconds);
      }, 200); // Atualiza a cada 200ms para maior precisão visual
      setAudioTimer(timer);
      
      console.log("Gravação de áudio iniciada");
    } catch (error) {
      console.error("Erro ao iniciar gravação de áudio:", error);
      alert("Não foi possível iniciar a gravação de áudio. Verifique se seu navegador tem permissão para acessar o microfone.");
    }
  };

  // Função para parar gravação de áudio e enviar
  const stopRecording = () => {
    if (audioRecorder && isRecording) {
      // Mostrar mensagem de log detalhada
      console.log("Iniciando parada da gravação de áudio...");
      
      try {
        // Importante: Solicitamos os dados finais antes de parar a gravação
        // para garantir que tudo seja capturado
        audioRecorder.requestData();
        
        // Parar a gravação
        audioRecorder.stop();
        setIsRecording(false);
        
        // Fechar as trilhas da stream
        if (audioRecorder.stream) {
          audioRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        // Limpar o timer
        if (audioTimer) {
          clearInterval(audioTimer);
          setAudioTimer(null);
        }
        
        console.log("Gravação de áudio finalizada e será enviada");
      } catch (error) {
        console.error("Erro ao parar gravação:", error);
      }
    } else {
      console.warn("Tentativa de parar gravação, mas nenhum gravador ativo foi encontrado");
    }
  };
  
  // Função para descartar o áudio gravado
  const discardRecording = () => {
    if (audioRecorder && isRecording) {
      try {
        // Primeiro desconectar o evento onstop para não acionar handleSendAudio
        audioRecorder.onstop = null;
        
        // Parar a gravação sem enviar o áudio
        audioRecorder.stop();
        
        // Limpar o timer
        if (audioTimer) {
          clearInterval(audioTimer);
          setAudioTimer(null);
        }
        
        // Fechar as trilhas da stream
        if (audioRecorder.stream) {
          audioRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        // Resetar o estado
        setIsRecording(false);
        setAudioChunks([]);
        setAudioDuration(0);
        
        console.log("Gravação de áudio descartada");
      } catch (error) {
        console.error("Erro ao descartar gravação:", error);
      }
    }
  };
  
  // Função para enviar o áudio gravado para o webhook
  const handleSendAudio = async () => {
    console.log(`Iniciando processamento de áudio com ${audioChunks.length} chunks`);
    
    if (audioChunks.length === 0) {
      console.warn("Não há chunks de áudio para processar");
      return;
    }
    
    try {
      // Criar um blob com todos os chunks usando o formato compactado
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
      console.log(`Blob de áudio criado com sucesso: ${audioBlob.size} bytes`);
      
      // Verificar o tamanho do áudio antes da compressão
      console.log(`Tamanho do áudio original: ${(audioBlob.size / 1024).toFixed(2)} KB`);
      
      // Se o áudio for maior que 100KB, comprima-o
      if (audioBlob.size > 100 * 1024) {
        console.log("Áudio muito grande, comprimindo...");
        // Exibir uma mensagem pro usuário de que o áudio está sendo processado
        const finalDuration = audioDuration; // Captura a duração final
        console.log(`Duração final do áudio sendo processado: ${finalDuration} segundos`);
        
        const userMessage: Message = {
          id: Date.now(),
          content: "🎤 Processando áudio...",
          type: 'audio',
          sender: 'user',
          timestamp: new Date(),
          duration: finalDuration
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Em um cenário real, aqui usaríamos uma biblioteca de compressão de áudio
        // Para simplicidade neste exemplo, vamos apenas usar o áudio original
        // mas cortar a duração se for muito grande
        
        // Enviar uma mensagem indicando o problema se necessário
        if (audioBlob.size > 500 * 1024) {
          // Se o áudio for realmente grande, avisamos o usuário
          const finalDuration = audioDuration; // Captura a duração final
          console.log(`Duração final do áudio grande: ${finalDuration} segundos`);
          
          setMessages(prev => [
            ...prev.filter(m => m.content !== "🎤 Processando áudio..."), 
            {
              id: Date.now(),
              content: "🎤 Áudio enviado (versão curta - o áudio original era muito grande)",
              type: 'audio',
              sender: 'user',
              timestamp: new Date(),
              duration: finalDuration
            }
          ]);
        } else {
          // Atualiza a mensagem para indicar que o áudio foi enviado
          const finalDuration = audioDuration; // Captura a duração final
          console.log(`Duração final do áudio normal: ${finalDuration} segundos`);
          
          setMessages(prev => [
            ...prev.filter(m => m.content !== "🎤 Processando áudio..."), 
            {
              id: Date.now(),
              content: "🎤 Áudio enviado",
              type: 'audio',
              sender: 'user',
              timestamp: new Date(),
              duration: finalDuration
            }
          ]);
        }
      } else {
        // Se o áudio for pequeno o suficiente, apenas envie normalmente
        const finalDuration = audioDuration; // Captura a duração final do áudio
        console.log(`Duração final do áudio: ${finalDuration} segundos`);
        
        const userMessage: Message = {
          id: Date.now(),
          content: "🎤 Áudio enviado",
          type: 'audio',
          sender: 'user',
          timestamp: new Date(),
          duration: finalDuration
        };
        
        setMessages(prev => [...prev, userMessage]);
      }
      
      // Converter o blob para base64
      console.log("Iniciando conversão do Blob para base64...");
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        console.log("Conversão para base64 concluída com sucesso");
        try {
          // Obter o base64 removendo o prefixo
          let base64Audio = reader.result?.toString().split(',')[1] || '';
          console.log("Base64 obtido, comprimento:", base64Audio.length);
          
          // Verificar tamanho do base64
          const base64Size = base64Audio.length * 0.75; // 1 caractere base64 = 0.75 bytes
          console.log(`Tamanho do base64: ${(base64Size / 1024).toFixed(2)} KB`);
          
          // Se ainda estiver muito grande mesmo após a compressão, truncamos
          // Este é um "último recurso" para evitar erros de payload muito grande
          if (base64Size > 500 * 1024) { // Se maior que 500KB
            // Truncar para ~500KB (em caracteres base64)
            const maxChars = 500 * 1024 / 0.75;
            base64Audio = base64Audio.substring(0, maxChars);
            console.warn("Áudio truncado para aproximadamente 500KB");
          }
          
          // Enviar áudio para o webhook
          setIsTyping(true);
          const webhookResponses = await sendMessageToWebhook(agent.name, base64Audio, "audio");
          
          // Processar resposta do webhook
          if (webhookResponses && webhookResponses.length > 0) {
            await addAgentMessagesWithDelay(webhookResponses);
          } else {
            setIsTyping(false);
          }
        } catch (err) {
          console.error("Erro ao processar ou enviar áudio:", err);
          setIsTyping(false);
          // Adicionar mensagem de erro
          setMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              content: "Não foi possível enviar o áudio. Por favor, tente um áudio mais curto.",
              type: 'text',
              sender: 'agent',
              timestamp: new Date()
            }
          ]);
        }
        
        // Limpar os chunks de áudio
        setAudioChunks([]);
      };
    } catch (error) {
      console.error('Erro ao preparar áudio:', error);
      setIsTyping(false);
      // Adicionar mensagem de erro para o usuário
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          content: "Houve um erro ao processar o áudio. Por favor, tente novamente.",
          type: 'text',
          sender: 'agent',
          timestamp: new Date()
        }
      ]);
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
            // Mostra o indicador de digitação por um tempo antes da próxima mensagem
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          const messageItem = response.messages[msgIdx];
          
          const newMessage: Message = {
            id: Date.now() + responseIdx + msgIdx,
            content: messageItem.message,
            type: messageItem.typeMessage as 'text' | 'audio' | 'image' | 'document' | 'video',
            sender: 'agent',
            timestamp: new Date()
          };
          
          // Adiciona a mensagem, atualizando o estado
          setMessages(prev => [...prev, newMessage]);
          
          // Após adicionar cada mensagem, verifica se há mais mensagens a serem mostradas
          // Se houver, mantém o indicador de digitação ativo para a próxima mensagem
          if (msgIdx < response.messages.length - 1) {
            // Move a visualização para o final da lista
            setTimeout(() => {
              const chatContainer = document.querySelector('.chat-messages');
              if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
            }, 100);
            
            // Mantém o indicador de digitação visível por um breve período para a próxima mensagem
            await new Promise(resolve => setTimeout(resolve, 800));
          }
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
    
    // Remove o indicador de digitação quando todas as mensagens forem mostradas
    setIsTyping(false);
    
    // Scroll para o final da lista de mensagens
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
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
                typeMessage: "text" as const
              },
              {
                message: "Por que o computador foi ao médico?",
                typeMessage: "text" as const
              },
              {
                message: "Porque ele estava com um vírus!",
                typeMessage: "text" as const
              }
            ]
          }
        ] as WebhookResponse[];
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
        <div className="p-4 bg-[var(--primary-900)] flex items-center">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..." 
            className="flex-1 bg-[var(--primary-800)] border-none rounded-full px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
          />
          
          {/* Contador de tempo de gravação */}
          {isRecording && (
            <div className="mr-2 px-3 py-1 bg-red-500/20 rounded-md text-white flex items-center">
              <span className="text-red-400 text-sm font-mono">
                {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
          
          {isRecording ? (
            <>
              {/* Botão de descarte de áudio (lixeira) quando estiver gravando */}
              <button 
                onClick={discardRecording}
                className="ml-2 w-12 h-12 rounded-full flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                title="Descartar gravação"
              >
                <i className="ri-delete-bin-line text-xl"></i>
              </button>
              
              {/* Botão de envio quando estiver gravando (para o áudio e envia) */}
              <button 
                onClick={stopRecording}
                className="ml-2 w-12 h-12 rounded-full flex items-center justify-center bg-[var(--secondary-600)] text-white"
                title="Parar e enviar áudio"
              >
                <i className="ri-send-plane-fill text-xl"></i>
              </button>
            </>
          ) : (
            <>
              {/* Botão de gravação de áudio quando não estiver gravando */}
              <button 
                onClick={startRecording}
                className="ml-2 w-12 h-12 rounded-full flex items-center justify-center bg-[var(--primary-800)] hover:bg-[var(--primary-700)] text-white transition-colors"
                title="Gravar áudio"
              >
                <i className="ri-mic-fill text-xl"></i>
              </button>
              
              {/* Botão de envio de mensagem de texto quando não estiver gravando */}
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`ml-2 w-12 h-12 rounded-full flex items-center justify-center ${
                  inputValue.trim() 
                    ? 'bg-[var(--secondary-600)]' 
                    : 'bg-[var(--primary-800)]'
                } text-white`}
                title="Enviar mensagem"
              >
                <i className="ri-send-plane-fill text-xl"></i>
              </button>
            </>
          )}
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