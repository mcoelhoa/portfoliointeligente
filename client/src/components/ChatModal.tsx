import { useState, useEffect, useCallback, useRef } from 'react';
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
  audioUrl?: string; // URL do objeto de áudio para reprodução
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
  
  // Estado para controlar a reprodução de áudio
  const [currentAudio, setCurrentAudio] = useState<{
    audio: HTMLAudioElement | null;
    messageId: number | null;
    isPlaying: boolean;
  }>({
    audio: null,
    messageId: null,
    isPlaying: false
  });

  // Referência ao bloco de áudio atual para manter consistência entre renders
  const audioChunksRef = useRef<Blob[]>([]);
  const audioDurationRef = useRef<number>(0);
  
  // Atualizar as referências quando os estados mudarem
  useEffect(() => {
    audioChunksRef.current = audioChunks;
  }, [audioChunks]);
  
  useEffect(() => {
    audioDurationRef.current = audioDuration;
  }, [audioDuration]);
  
  // Função para enviar mensagem de áudio ao webhook
  const processAndSendAudio = useCallback(async (audioBlob: Blob, duration: number) => {
    if (!audioBlob || audioBlob.size === 0) {
      console.error("[DEBUG] Blob de áudio vazio, não é possível processar");
      return;
    }
    
    try {
      console.log(`[DEBUG] Processando áudio de ${duration}s, tamanho: ${(audioBlob.size/1024).toFixed(2)}KB`);
      
      // 1. Criar URL do objeto de áudio para reprodução no navegador
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("[DEBUG] URL do áudio criada:", audioUrl);
      
      // 2. Criar ID único para a mensagem
      const messageId = Date.now();
      const isLargeAudio = audioBlob.size > 100 * 1024;
      
      // 3. Adicionar mensagem ao chat com a URL do áudio
      console.log("[DEBUG] Adicionando mensagem de áudio com URL:", audioUrl);
      
      const userMessage: Message = {
        id: messageId,
        content: isLargeAudio ? "🎤 Processando áudio..." : "🎤 Áudio enviado",
        type: 'audio',
        sender: 'user',
        timestamp: new Date(),
        duration: duration,
        audioUrl: audioUrl // Esta é a URL do blob que permite reprodução
      };
      
      // 4. Atualizar estado com a nova mensagem
      setMessages(prevMessages => {
        console.log("[DEBUG] Estado anterior de mensagens:", prevMessages.length);
        const newMessages = [...prevMessages, userMessage];
        console.log("[DEBUG] Novo estado de mensagens:", newMessages.length);
        return newMessages;
      });
      
      // 5. Converter para base64 para envio ao webhook
      console.log("[DEBUG] Convertendo áudio para base64...");
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          try {
            const base64 = reader.result?.toString().split(',')[1] || '';
            console.log("[DEBUG] Base64 gerado com sucesso, tamanho:", base64.length);
            resolve(base64);
          } catch (err) {
            console.error("[DEBUG] Erro ao gerar base64:", err);
            reject(err);
          }
        };
        reader.onerror = err => {
          console.error("[DEBUG] Erro de leitura do arquivo:", err);
          reject(err);
        };
      });
      
      // 6. Verificar tamanho do base64
      const base64Size = base64Data.length * 0.75; // 1 caractere base64 = 0.75 bytes
      console.log(`[DEBUG] Tamanho do áudio em base64: ${(base64Size/1024).toFixed(2)}KB`);
      
      // 7. Atualizar mensagem se necessário, mantendo a URL do áudio
      if (isLargeAudio) {
        const finalContent = base64Size > 500 * 1024 
          ? "🎤 Áudio enviado (versão reduzida - o original era muito grande)"
          : "🎤 Áudio enviado";
        
        console.log("[DEBUG] Atualizando conteúdo da mensagem de áudio:", finalContent);
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? {...msg, content: finalContent} : msg
        ));
      }
      
      // 8. Preparar áudio para envio (reduzindo tamanho se necessário)
      let processedBase64 = base64Data;
      if (base64Size > 500 * 1024) {
        const maxChars = Math.floor(500 * 1024 / 0.75);
        processedBase64 = base64Data.substring(0, maxChars);
        console.warn("[DEBUG] Áudio truncado para aproximadamente 500KB");
      }
      
      // 9. Enviar para o webhook
      console.log("[DEBUG] Enviando áudio para webhook...");
      setIsTyping(true);
      
      try {
        const webhookResponses = await sendMessageToWebhook(agent.name, processedBase64, "audio");
        console.log("[DEBUG] Resposta do webhook recebida:", webhookResponses);
        
        // Processar resposta
        if (webhookResponses && webhookResponses.length > 0) {
          await addAgentMessagesWithDelay(webhookResponses);
        } else {
          setIsTyping(false);
        }
      } catch (webhookError) {
        console.error('[DEBUG] Erro ao enviar áudio para o webhook:', webhookError);
        setIsTyping(false);
      }
      
      // 10. Fazer scroll para mostrar a nova mensagem
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      
    } catch (error) {
      console.error('[DEBUG] Erro ao processar áudio:', error);
      setIsTyping(false);
      
      // Adicionar mensagem de erro
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: "Houve um erro ao processar o áudio. Por favor, tente novamente.",
        type: 'text',
        sender: 'agent',
        timestamp: new Date()
      }]);
    }
  }, [agent.name]);
  
  // Função para iniciar gravação de áudio
  const startRecording = useCallback(async () => {
    try {
      // Limpar gravação anterior se existir
      if (audioRecorder) {
        try {
          if (audioRecorder.state === 'recording') {
            audioRecorder.onstop = null; // Remover callback existente
            audioRecorder.stop();
          }
          
          if (audioRecorder.stream) {
            audioRecorder.stream.getTracks().forEach(track => track.stop());
          }
        } catch (err) {
          console.warn("Erro ao limpar gravação anterior:", err);
        }
      }
      
      // Resetar estados
      setAudioChunks([]);
      setAudioDuration(0);
      setIsRecording(false);
      
      if (audioTimer) {
        clearInterval(audioTimer);
        setAudioTimer(null);
      }
      
      // Configurar e iniciar nova gravação
      console.log("Iniciando nova gravação de áudio...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Mono
          sampleRate: 16000, // 16kHz
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Configurar recorder com baixo bitrate
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 12000 // 12kbps para áudio de voz
      };
      
      // Verificar suporte ao codec
      let recorder;
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        recorder = new MediaRecorder(stream, options);
      } else {
        recorder = new MediaRecorder(stream);
        console.warn("Codec Opus não suportado, usando codec padrão");
      }
      
      // Capturar chunks de áudio
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          setAudioChunks(prev => [...prev, e.data]);
        }
      };
      
      // Configurar ação ao parar gravação
      recorder.onstop = async () => {
        console.log("[DEBUG] Gravação finalizada, processando...");
        
        // Limpar timer
        if (audioTimer) {
          clearInterval(audioTimer);
          setAudioTimer(null);
        }
        
        // Parar trilhas
        stream.getTracks().forEach(track => track.stop());
        
        // Processar áudio capturado
        if (chunks.length > 0) {
          const finalDuration = audioDurationRef.current;
          const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
          
          // Log para debug do blob
          console.log(`[DEBUG] Blob de áudio criado: ${audioBlob.size} bytes, tipo: ${audioBlob.type}`);
          
          // Criar URL do blob para uso imediato
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log(`[DEBUG] URL do áudio criada: ${audioUrl}`);
          
          // Enviar áudio
          console.log(`[DEBUG] Preparando envio de áudio: ${chunks.length} chunks, ${finalDuration}s, com audioUrl`);
          await processAndSendAudio(audioBlob, finalDuration);
        } else {
          console.warn("[DEBUG] Nenhum dado capturado na gravação");
        }
        
        // Resetar estado
        setIsRecording(false);
      };
      
      // Iniciar gravação com chunks a cada 500ms
      recorder.start(500);
      setAudioRecorder(recorder);
      setIsRecording(true);
      
      // Iniciar timer para duração
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setAudioDuration(elapsed);
      }, 200); // Atualiza a cada 200ms
      
      setAudioTimer(timer);
      
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      alert("Não foi possível acessar o microfone. Verifique as permissões do seu navegador.");
      
      // Resetar estados em caso de erro
      setIsRecording(false);
      setAudioChunks([]);
      setAudioDuration(0);
      
      if (audioTimer) {
        clearInterval(audioTimer);
        setAudioTimer(null);
      }
    }
  }, [audioRecorder, audioTimer, processAndSendAudio]);
  
  // Função para parar gravação de áudio
  const stopRecording = useCallback(() => {
    try {
      if (!isRecording || !audioRecorder) {
        console.warn("Nenhuma gravação ativa para parar");
        setIsRecording(false);
        return;
      }
      
      console.log("Parando gravação de áudio...");
      
      // Capturar valores atuais
      const currentChunks = [...audioChunksRef.current];
      const finalDuration = audioDurationRef.current;
      
      // Tentar parar gravador
      if (audioRecorder.state === 'recording') {
        // O callback onstop cuidará do envio
        audioRecorder.stop();
      } else {
        // Se já parou por algum motivo, mas temos chunks, enviar manualmente
        if (currentChunks.length > 0) {
          const audioBlob = new Blob(currentChunks, { type: 'audio/webm;codecs=opus' });
          processAndSendAudio(audioBlob, finalDuration);
        }
      }
      
      // Limpar timer
      if (audioTimer) {
        clearInterval(audioTimer);
        setAudioTimer(null);
      }
      
      // Parar trilhas
      if (audioRecorder.stream) {
        audioRecorder.stream.getTracks().forEach(track => track.stop());
      }
      
      // Resetar estado
      setIsRecording(false);
      
    } catch (error) {
      console.error("Erro ao parar gravação:", error);
      
      // Tentar recuperação de emergência
      setIsRecording(false);
      
      if (audioTimer) {
        clearInterval(audioTimer);
        setAudioTimer(null);
      }
      
      // Se temos chunks, tente enviar mesmo com erro
      const chunks = audioChunksRef.current;
      if (chunks.length > 0) {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        processAndSendAudio(audioBlob, audioDurationRef.current);
      }
    }
  }, [isRecording, audioRecorder, audioTimer, processAndSendAudio]);
  
  // Função para descartar gravação sem enviar
  const discardRecording = useCallback(() => {
    if (audioRecorder && isRecording) {
      try {
        // Desativar callback para não processar o áudio
        audioRecorder.onstop = null;
        
        // Parar gravação
        audioRecorder.stop();
        
        // Limpar recursos
        if (audioTimer) {
          clearInterval(audioTimer);
          setAudioTimer(null);
        }
        
        if (audioRecorder.stream) {
          audioRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        // Resetar estados
        setIsRecording(false);
        setAudioChunks([]);
        setAudioDuration(0);
        
        console.log("Gravação descartada");
      } catch (error) {
        console.error("Erro ao descartar gravação:", error);
        setIsRecording(false);
      }
    }
  }, [audioRecorder, isRecording, audioTimer]);
  
  // Função para reproduzir áudio
  const playAudio = useCallback((messageId: number, audioContent: string, audioUrl?: string) => {
    console.log("[DEBUG] Reproduzindo áudio...", { messageId, audioContent, audioUrl });
    
    // Se já estiver tocando um áudio, pare-o
    if (currentAudio.audio && currentAudio.isPlaying) {
      currentAudio.audio.pause();
      currentAudio.audio.currentTime = 0;
    }
    
    // Se clicar no mesmo áudio que está tocando, apenas pare
    if (currentAudio.messageId === messageId && currentAudio.isPlaying) {
      setCurrentAudio({
        audio: null,
        messageId: null,
        isPlaying: false
      });
      return;
    }
    
    try {
      // Criar elemento de áudio
      const audioElement = new Audio();
      
      // Usar a URL do blob se disponível, caso contrário, usar áudio de exemplo
      if (audioUrl) {
        console.log("[DEBUG] Reproduzindo áudio da URL:", audioUrl);
        audioElement.src = audioUrl;
      } else {
        // Áudio de fallback apenas para efeito visual
        console.log("[DEBUG] Áudio URL não disponível, usando fallback");
        const audioSrc = `data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCkpKSkpKT4+Pj4+PklJSUlJSVpaWlpaWm9vb29vb3t7e3t7e4aGhoaGhpGRkZGRkaampqamprKysrKysr29vb29vcfHx8fHx9LS0tLS0uTk5OTk5PX19fX19f////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7UMQAAAesTx2R0TAI8XHk0mYbBAhBAEAQBA0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NAAIAAJ/4iIiIiIiITEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LECgAK6Q8+2emAAkG9J5ZxkwBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==`;
        audioElement.src = audioSrc;
      }
      
      // Eventos de controle
      audioElement.onplay = () => {
        console.log("[DEBUG] Áudio começou a tocar", messageId);
        setCurrentAudio({
          audio: audioElement,
          messageId: messageId,
          isPlaying: true
        });
      };
      
      audioElement.onended = () => {
        console.log("[DEBUG] Áudio terminou", messageId);
        setCurrentAudio({
          audio: null,
          messageId: null,
          isPlaying: false
        });
      };
      
      audioElement.onerror = (e) => {
        console.error("[DEBUG] Erro ao reproduzir áudio:", e);
        setCurrentAudio({
          audio: null,
          messageId: null,
          isPlaying: false
        });
      };
      
      // Iniciar reprodução
      audioElement.play()
        .then(() => console.log("[DEBUG] Reprodução iniciada com sucesso"))
        .catch(err => {
          console.error("[DEBUG] Erro ao iniciar reprodução:", err);
        });
    } catch (error) {
      console.error("[DEBUG] Erro ao criar elemento de áudio:", error);
    }
  }, [currentAudio]);
  
  // Função para adicionar mensagens do agente com delay
  const addAgentMessagesWithDelay = async (responses: WebhookResponse[]) => {
    setIsTyping(true);
    
    // Processar cada resposta sequencialmente
    for (let responseIdx = 0; responseIdx < responses.length; responseIdx++) {
      const response = responses[responseIdx];
      
      // Processar mensagens em array
      if (response.messages && Array.isArray(response.messages)) {
        for (let msgIdx = 0; msgIdx < response.messages.length; msgIdx++) {
          // Adicionar delay entre mensagens
          if (msgIdx > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          const messageItem = response.messages[msgIdx];
          
          // Criar nova mensagem
          const newMessage: Message = {
            id: Date.now() + responseIdx + msgIdx,
            content: messageItem.message,
            type: messageItem.typeMessage as 'text' | 'audio' | 'image' | 'document' | 'video',
            sender: 'agent',
            timestamp: new Date()
          };
          
          // Adicionar mensagem
          setMessages(prev => [...prev, newMessage]);
          
          // Manter indicador de digitação entre mensagens
          if (msgIdx < response.messages.length - 1) {
            // Scroll para o fim
            setTimeout(() => {
              const chatContainer = document.querySelector('.chat-messages');
              if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
            }, 100);
            
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
      } else if (response.message) {
        // Mensagem única
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
    
    // Finalizar digitação
    setIsTyping(false);
    
    // Scroll final
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  };
  
  // Função para enviar mensagem de texto
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      type: 'text',
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Scroll para o fim
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
    
    try {
      // Enviar para webhook
      const webhookResponses = await sendMessageToWebhook(agent.name, inputValue);
      
      // Processar resposta
      if (webhookResponses && webhookResponses.length > 0) {
        await addAgentMessagesWithDelay(webhookResponses);
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setIsTyping(false);
      
      // Mensagem de erro
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        type: 'text',
        sender: 'agent',
        timestamp: new Date()
      }]);
    }
  };
  
  // Mensagem inicial de boas-vindas
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
        
        // Envia a mensagem de boas-vindas para o webhook
        sendMessageToWebhook(agent.name, welcomeMessage, "text");
      }, 500);
    } else {
      setMessages([]);
      setInputValue('');
      if (isRecording) {
        stopRecording();
      }
    }
  }, [isOpen, agent, isRecording, stopRecording]);
  
  // Formatar duração em MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-[var(--primary-900)] w-full max-w-2xl h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-[var(--primary-800)] p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-white font-bold text-lg flex items-center">
              <span className="mr-2">{agent.name}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-[var(--secondary-300)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Área de mensagens */}
        <div className="flex-1 p-4 overflow-y-auto chat-messages bg-gradient-to-br from-[var(--primary-950)] to-[var(--primary-900)]">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 ${message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
            >
              <div 
                className={`max-w-3/4 rounded-lg px-4 py-2 ${
                  message.sender === 'user' 
                    ? 'bg-[var(--secondary-600)] text-white' 
                    : 'bg-[var(--primary-800)] text-white'
                }`}
              >
                {message.type === 'text' ? (
                  <p>{message.content}</p>
                ) : message.type === 'audio' ? (
                  <div className="flex items-center">
                    
                    {/* Novo layout para áudio com maior visibilidade e controles nativos */}
                    <div className="w-full">
                      <div className="flex items-center mb-1">
                        <button 
                          onClick={() => playAudio(message.id, message.content, message.audioUrl)}
                          className="mr-2 p-1 rounded-full bg-[var(--primary-700)] hover:bg-[var(--primary-600)] transition-colors"
                        >
                          {currentAudio.messageId === message.id && currentAudio.isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m-9-9h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                      
                      {/* Controle de áudio nativo (visível para garantir funcionamento) */}
                      {message.audioUrl && (
                        <audio 
                          src={message.audioUrl} 
                          controls 
                          className="w-full h-8 mt-1" 
                        />
                      )}
                      
                      {/* Barra de progresso customizada */}
                      {message.duration && (
                        <div className="mt-1 text-xs text-gray-300">
                          {currentAudio.messageId === message.id && currentAudio.isPlaying ? (
                            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1 overflow-hidden">
                              <div 
                                className="bg-[var(--secondary-400)] h-1.5 rounded-full animate-progress-bar"
                                style={{ animationDuration: `${message.duration}s` }}
                              ></div>
                            </div>
                          ) : (
                            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                              <div 
                                className="bg-gray-500 h-1.5 rounded-full"
                                style={{ width: '0%' }}
                              ></div>
                            </div>
                          )}
                          <span>{formatDuration(message.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>Tipo de mensagem não suportado: {message.type}</p>
                )}
                <span className="text-xs text-gray-400 block mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-[var(--primary-800)] text-white rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Área de entrada e controles */}
        <div className="p-4 bg-[var(--primary-850)] border-t border-[var(--primary-700)]">
          {isRecording ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-[var(--primary-800)] rounded-full px-4 py-2 flex-1 mr-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                <span className="text-white">Gravando: {formatDuration(audioDuration)}</span>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={stopRecording}
                  className="p-2 bg-[var(--secondary-500)] hover:bg-[var(--secondary-400)] rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
                
                <button 
                  onClick={discardRecording}
                  className="p-2 bg-red-600 hover:bg-red-500 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-[var(--primary-800)] border border-[var(--primary-700)] text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-500)]"
              />
              
              <button
                onClick={startRecording}
                className="bg-[var(--primary-700)] hover:bg-[var(--primary-600)] text-white px-3 py-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`bg-[var(--secondary-500)] hover:bg-[var(--secondary-400)] text-white px-4 py-2 rounded-r-lg transition-colors ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}