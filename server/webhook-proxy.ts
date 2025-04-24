import axios from 'axios';
import { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Usar apenas a tipagem padrão do multer para o Request
// Não precisamos redefinir a interface pois @types/multer já faz isso corretamente

// URLs do webhook para tentativas alternativas (a partir das variáveis de ambiente)
const WEBHOOK_URLS = [
  process.env.WEBHOOK_URL_PRIMARY || 'https://n8neditor.unitmedia.cloud/webhook/portfolio',
  process.env.WEBHOOK_URL_SECONDARY || 'https://n8neditor.unitmedia.cloud/webhook-test/portfolio',
  process.env.WEBHOOK_URL_TERTIARY || 'https://n8n.unitmedia.cloud/webhook/portfolio'
];

// Índice da URL atual (para alternar em caso de falha)
let currentWebhookUrlIndex = 0;

// Função para obter a URL atual do webhook
const getWebhookUrl = () => WEBHOOK_URLS[currentWebhookUrlIndex];

// Função para alternar para a próxima URL em caso de falha
const switchToNextWebhookUrl = () => {
  currentWebhookUrlIndex = (currentWebhookUrlIndex + 1) % WEBHOOK_URLS.length;
  console.log(`[WebhookProxy] Alternando para a próxima URL do webhook: ${getWebhookUrl()}`);
  return getWebhookUrl();
};

// Aumentar limite para mensagens de áudio (padrão é 100kb)
const jsonParser = bodyParser.json({ limit: '10mb' });

// Configurar o multer para armazenamento temporário de arquivos
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Usar pasta temporária do sistema
    const tempDir = path.join(os.tmpdir(), 'audio-uploads');
    
    // Certificar que o diretório existe
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    cb(null, tempDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configurar o multer com limites
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // Limite de 10MB para arquivos de áudio
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Aceitar apenas arquivos de áudio
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de áudio são permitidos'));
    }
  }
});

// Logs detalhados para facilitar a depuração
const enableDetailedLogs = true;

// Mock da resposta do webhook para testes locais
const MOCK_RESPONSE = [
  {
    messages: [
      {
        message: "Obrigado por entrar em contato. Entendi sua solicitação!",
        typeMessage: "text"
      },
      {
        message: "Posso te ajudar com mais informações sobre nossos serviços.",
        typeMessage: "text"
      },
      {
        message: "Quer agendar uma demonstração?",
        typeMessage: "text"
      }
    ]
  }
];

// Função para tentar enviar mensagem para um webhook específico
async function tryWebhook(webhookUrl: string, data: any, headers: any = {}, timeout = 10000): Promise<any> {
  console.log(`[WebhookProxy] Tentando enviar para webhook: ${webhookUrl}`);
  
  try {
    const response = await axios.post(webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: timeout
    });
    
    // Se recebeu uma resposta válida, use-a
    if (response.data) {
      if (enableDetailedLogs) {
        console.log(`[WebhookProxy] Resposta recebida com sucesso de ${webhookUrl}`);
        console.log('[WebhookProxy] Status:', response.status);
        console.log('[WebhookProxy] Dados:', JSON.stringify(response.data).substring(0, 200) + '...');
      } else {
        console.log(`[WebhookProxy] Resposta recebida do webhook ${webhookUrl}:`, response.data);
      }
      
      return response;
    }
    
    return null;
  } catch (error) {
    const webhookError = error as any;
    console.warn(`[WebhookProxy] Erro ao chamar webhook ${webhookUrl}:`, webhookError.message);
    
    if (enableDetailedLogs && webhookError.response) {
      console.warn('[WebhookProxy] Status do erro:', webhookError.response.status);
      console.warn('[WebhookProxy] Detalhes do erro:', webhookError.response.statusText);
      console.warn('[WebhookProxy] Resposta de erro:', webhookError.response.data || 'Sem dados');
    }
    
    return null;
  }
}

// Função para tentar múltiplos webhooks até obter sucesso
async function tryMultipleWebhooks(data: any, headers: any = {}): Promise<any> {
  // Salvar as URLs já tentadas nesta requisição para evitar ciclos
  const triedUrls = new Set<string>();
  
  try {
    // Primeiro, tente a URL atual
    let currentUrl = getWebhookUrl();
    
    if (!triedUrls.has(currentUrl)) {
      triedUrls.add(currentUrl);
      let response = await tryWebhook(currentUrl, data, headers);
      
      // Se funcionou, retorna
      if (response) return response;
    }
    
    console.log('[WebhookProxy] Primeira tentativa falhou, tentando URLs alternativas');
    
    // Registra um contador para evitar loops infinitos
    let attempts = 0;
    
    // Enquanto ainda tivermos URLs não tentadas
    while (attempts < WEBHOOK_URLS.length) {
      // Alterna para a próxima URL
      currentUrl = switchToNextWebhookUrl();
      
      // Verifica se essa URL já foi tentada
      if (triedUrls.has(currentUrl)) {
        console.log(`[WebhookProxy] URL ${currentUrl} já foi tentada, continuando...`);
        attempts++;
        continue;
      }
      
      // Tenta esta URL
      triedUrls.add(currentUrl);
      const response = await tryWebhook(currentUrl, data, headers);
      if (response) return response;
      
      attempts++;
    }
    
    // Se chegamos aqui, nenhuma das URLs funcionou
    console.warn('[WebhookProxy] Todas as URLs do webhook falharam, usando resposta mock');
    return null;
  } catch (error) {
    console.error('[WebhookProxy] Erro ao tentar enviar para webhooks:', error);
    return null;
  }
}

/**
 * Registra uma rota de proxy para o webhook
 */
export function setupWebhookProxy(app: Express) {
  // Rota para verificar status de todos os webhooks - útil para debugging
  app.get('/api/webhook-status', async (req: Request, res: Response) => {
    // Verificar todas as URLs configuradas
    const results = [];
    
    for (let i = 0; i < WEBHOOK_URLS.length; i++) {
      const webhookUrl = WEBHOOK_URLS[i];
      try {
        console.log(`[WebhookProxy] Verificando status do webhook ${i+1}/${WEBHOOK_URLS.length}: ${webhookUrl}`);
        
        const response = await axios.get(`${webhookUrl}/health`, {
          timeout: 3000 // Timeout mais curto para a verificação de status
        });
        
        results.push({
          url: webhookUrl,
          status: 'online',
          statusCode: response.status,
          response: response.data
        });
        
        // Se encontrar um webhook online e não for o atual, alternar para ele
        if (i !== currentWebhookUrlIndex) {
          currentWebhookUrlIndex = i;
          console.log(`[WebhookProxy] Alternando para webhook online: ${webhookUrl}`);
        }
        
        // Se encontrou um webhook online, não precisa verificar os demais
        break;
      } catch (error) {
        const axiosError = error as any;
        results.push({
          url: webhookUrl,
          status: 'offline',
          error: axiosError.message,
          details: axiosError.response ? {
            status: axiosError.response.status,
            statusText: axiosError.response.statusText
          } : 'Sem detalhes disponíveis'
        });
      }
    }
    
    return res.status(200).json({
      currentWebhook: getWebhookUrl(),
      results: results
    });
  });
  
  // Rota específica para upload de arquivos de áudio
  app.post('/api/webhook-proxy/audio', upload.single('audioFile'), async (req: Request, res: Response) => {
    try {
      // Verifica se o arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo de áudio enviado' });
      }
      
      // Obtem os campos do formulário
      const agent = req.body.agent;
      const typeMessage = req.body.typeMessage || 'audio';
      
      if (!agent) {
        return res.status(400).json({ error: 'Campo "agent" é obrigatório' });
      }
      
      console.log(`[WebhookProxy] Recebido arquivo de áudio: ${req.file.originalname} (${req.file.size} bytes)`);
      console.log(`[WebhookProxy] Agente: ${agent}, Tipo: ${typeMessage}`);
      
      // Para enviar o arquivo, precisamos ler o conteúdo e converter para base64
      const audioContent = fs.readFileSync(req.file.path);
      const audioBase64 = audioContent.toString('base64');
      
      // Dados para enviar ao webhook
      const data = {
        agent,
        message: audioBase64,
        typeMessage 
      };
      
      // Tenta enviar para os webhooks configurados
      const response = await tryMultipleWebhooks(data);
      
      // Limpar o arquivo temporário após enviá-lo
      try {
        fs.unlinkSync(req.file.path);
        console.log(`[WebhookProxy] Arquivo temporário removido: ${req.file.path}`);
      } catch (err) {
        console.warn(`[WebhookProxy] Erro ao remover arquivo temporário: ${err}`);
      }
      
      // Se conseguimos uma resposta de qualquer URL, retorne-a
      if (response && response.data) {
        return res.status(response.status).json(response.data);
      }
      
      // Se chegamos aqui, nenhuma das URLs funcionou, use resposta padrão
      console.log('[WebhookProxy] Usando resposta padrão para áudio');
      return res.status(200).json([
        {
          messages: [
            {
              message: "Recebi seu áudio e estou processando a mensagem.",
              typeMessage: "text"
            },
            {
              message: "Como posso te ajudar?",
              typeMessage: "text"
            }
          ]
        }
      ]);
    } catch (error) {
      console.error('[WebhookProxy] Erro ao processar upload de áudio:', error);
      return res.status(500).json({
        error: 'Falha ao processar o áudio',
        details: (error as Error).message
      });
    }
  });

  // Rota de proxy para o webhook com parser personalizado para lidar com mensagens json
  app.post('/api/webhook-proxy', jsonParser, async (req: Request, res: Response) => {
    try {
      const { agent, message, typeMessage } = req.body;
      
      // Verifica se todos os campos necessários estão presentes
      if (!agent || !message || !typeMessage) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios ausentes. Garanta que agent, message e typeMessage estejam presentes.'
        });
      }
      
      if (enableDetailedLogs) {
        const messagePreview = message.length > 100 
          ? (typeof message === 'string' ? message.substring(0, 100) + '...' : 'Conteúdo binário')
          : message;
        console.log(`[WebhookProxy] Processando mensagem do agente: ${agent}`);
        console.log(`[WebhookProxy] Tipo de mensagem: ${typeMessage}`);
        console.log(`[WebhookProxy] Tamanho da mensagem: ${typeof message === 'string' ? message.length : 'N/A'} caracteres`);
        console.log(`[WebhookProxy] Prévia: ${messagePreview}`);
      } else {
        console.log(`Encaminhando mensagem para o webhook: ${agent}, "${typeof message === 'string' ? message.substring(0, 30) + (message.length > 30 ? '...' : '') : 'Conteúdo binário'}"`);
      }
      
      // Salvar as URLs já tentadas nesta requisição para evitar ciclos
      const triedUrls = new Set<string>();
      
      // Função para tentar enviar para um webhook específico
      const tryWebhook = async (webhookUrl: string): Promise<any> => {
        if (triedUrls.has(webhookUrl)) {
          console.log(`[WebhookProxy] URL ${webhookUrl} já foi tentada, pulando`);
          return null;
        }
        
        triedUrls.add(webhookUrl);
        
        console.log(`[WebhookProxy] Tentando enviar para webhook: ${webhookUrl}`);
        
        try {
          const response = await axios.post(webhookUrl, {
            agent,
            message,
            typeMessage
          }, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundos de timeout
          });
          
          // Se recebeu uma resposta válida, use-a
          if (response.data) {
            if (enableDetailedLogs) {
              console.log(`[WebhookProxy] Resposta recebida com sucesso de ${webhookUrl}`);
              console.log('[WebhookProxy] Status:', response.status);
              console.log('[WebhookProxy] Dados:', JSON.stringify(response.data).substring(0, 200) + '...');
            } else {
              console.log(`[WebhookProxy] Resposta recebida do webhook ${webhookUrl}:`, response.data);
            }
            
            return response;
          }
          
          return null;
        } catch (error) {
          const webhookError = error as any;
          console.warn(`[WebhookProxy] Erro ao chamar webhook ${webhookUrl}:`, webhookError.message);
          
          if (enableDetailedLogs && webhookError.response) {
            console.warn('[WebhookProxy] Status do erro:', webhookError.response.status);
            console.warn('[WebhookProxy] Detalhes do erro:', webhookError.response.statusText);
            console.warn('[WebhookProxy] Resposta de erro:', webhookError.response.data || 'Sem dados');
          }
          
          return null;
        }
      };
      
      try {
        // Primeiro, tente a URL atual
        let currentUrl = getWebhookUrl();
        let response = await tryWebhook(currentUrl);
        
        // Se falhar, tente as outras URLs configuradas
        if (!response) {
          console.log('[WebhookProxy] Primeira tentativa falhou, tentando URLs alternativas');
          
          // Registra um contador para evitar loops infinitos
          let attempts = 0;
          
          // Enquanto não tivermos resposta e ainda tivermos URLs não tentadas
          while (!response && attempts < WEBHOOK_URLS.length) {
            // Alterna para a próxima URL
            currentUrl = switchToNextWebhookUrl();
            
            // Verifica se essa URL já foi tentada
            if (triedUrls.has(currentUrl)) {
              console.log(`[WebhookProxy] URL ${currentUrl} já foi tentada, continuando...`);
              attempts++;
              continue;
            }
            
            // Tenta esta URL
            response = await tryWebhook(currentUrl);
            attempts++;
          }
        }
        
        // Se conseguimos uma resposta de qualquer URL, retorne-a
        if (response && response.data) {
          return res.status(response.status).json(response.data);
        }
        
        // Se chegamos aqui, nenhuma das URLs funcionou
        console.warn('[WebhookProxy] Todas as URLs do webhook falharam, usando resposta mock');
        return res.status(200).json(MOCK_RESPONSE);
      } catch (error) {
        const webhookError = error as any;
        console.warn('[WebhookProxy] Erro não tratado ao chamar webhooks:', webhookError.message);
        
        // Respostas personalizadas para palavras-chave específicas
        if (typeof message === 'string' && message.toLowerCase().includes('piada')) {
          console.log('[WebhookProxy] Detectada solicitação de piada, usando resposta de piada');
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
          return res.status(200).json(piadaResponse);
        }
        
        // Se o webhook externo falhar, retorna a resposta mock para fins de teste
        console.log('[WebhookProxy] Usando resposta mock como fallback');
        return res.status(200).json(MOCK_RESPONSE);
      }
    } catch (error) {
      console.error('[WebhookProxy] Erro ao processar requisição para o webhook:', error);
      return res.status(500).json({ 
        error: 'Falha ao encaminhar mensagem para o webhook',
        details: (error as Error).message 
      });
    }
  });
}