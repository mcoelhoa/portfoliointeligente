import axios from 'axios';
import { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';

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

  // Rota de proxy para o webhook com parser personalizado para lidar com arquivos grandes
  app.post('/api/webhook-proxy', jsonParser, async (req: Request, res: Response) => {
    try {
      const { agent, message, typeMessage } = req.body;
      
      // Log detalhado de recebimento da requisição
      console.log(`[WebhookProxy] Requisição recebida: ${new Date().toISOString()}`);
      console.log(`[WebhookProxy] Agent: ${agent}, TypeMessage: ${typeMessage}`);
      
      // Verifica se todos os campos necessários estão presentes
      if (!agent || !message || !typeMessage) {
        console.error('[WebhookProxy] ERRO: Campos obrigatórios ausentes:', { 
          agentPresente: !!agent, 
          messagePresente: !!message, 
          typeMessagePresente: !!typeMessage 
        });
        
        return res.status(400).json({ 
          error: 'Campos obrigatórios ausentes. Garanta que agent, message e typeMessage estejam presentes.'
        });
      }
      
      // Log extra para áudio
      if (typeMessage === 'audio') {
        console.log(`[WebhookProxy] Processando ÁUDIO: comprimento da string base64 = ${typeof message === 'string' ? message.length : 'N/A'}`);
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