import axios from 'axios';
import { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';

// URL atualizada do webhook
const WEBHOOK_URL = 'https://n8neditor.unitmedia.cloud/webhook/portfolio';

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
  // Rota para verificar status do webhook - útil para debugging
  app.get('/api/webhook-status', async (req: Request, res: Response) => {
    try {
      const response = await axios.get(`${WEBHOOK_URL}/health`, {
        timeout: 5000
      });
      return res.status(200).json({
        status: 'online',
        webhook_url: WEBHOOK_URL,
        webhook_response: response.data
      });
    } catch (error) {
      const axiosError = error as any;
      return res.status(200).json({
        status: 'offline',
        webhook_url: WEBHOOK_URL,
        error: axiosError.message,
        details: axiosError.response ? {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText
        } : 'Sem detalhes disponíveis'
      });
    }
  });

  // Rota de proxy para o webhook com parser personalizado para lidar com arquivos grandes
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
      
      try {
        // Encaminha a requisição para o webhook real
        const response = await axios.post(WEBHOOK_URL, {
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
            console.log('[WebhookProxy] Resposta recebida com sucesso do webhook externo');
            console.log('[WebhookProxy] Status:', response.status);
            console.log('[WebhookProxy] Dados:', JSON.stringify(response.data).substring(0, 200) + '...');
          } else {
            console.log('Resposta real do webhook:', response.data);
          }
          return res.status(response.status).json(response.data);
        } else {
          console.warn('[WebhookProxy] Resposta do webhook externa vazia, usando resposta mock');
          return res.status(200).json(MOCK_RESPONSE);
        }
      } catch (error) {
        const webhookError = error as any;
        console.warn('[WebhookProxy] Erro ao chamar webhook externo:', webhookError.message);
        
        if (enableDetailedLogs && webhookError.response) {
          console.warn('[WebhookProxy] Status do erro:', webhookError.response.status);
          console.warn('[WebhookProxy] Detalhes do erro:', webhookError.response.statusText);
          console.warn('[WebhookProxy] Resposta de erro:', webhookError.response.data || 'Sem dados');
        }
        
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