import axios from 'axios';
import { Express, Request, Response } from 'express';

const WEBHOOK_URL = 'https://n8neditor.unitmedia.cloud/webhook-test/portfolio';

// Mock da resposta do webhook para testes locais
const MOCK_RESPONSE = [
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
];

/**
 * Registra uma rota de proxy para o webhook
 */
export function setupWebhookProxy(app: Express) {
  // Rota de proxy para o webhook
  app.post('/api/webhook-proxy', async (req: Request, res: Response) => {
    try {
      const { agent, message, typeMessage } = req.body;
      
      // Verifica se todos os campos necessários estão presentes
      if (!agent || !message || !typeMessage) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios ausentes. Garanta que agent, message e typeMessage estejam presentes.'
        });
      }
      
      console.log(`Encaminhando mensagem para o webhook: ${agent}, "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`);
      
      try {
        // Encaminha a requisição para o webhook real
        const response = await axios.post(WEBHOOK_URL, {
          agent,
          message,
          typeMessage
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Retorna a resposta do webhook
        return res.status(response.status).json(response.data);
      } catch (error) {
        const webhookError = error as Error;
        console.warn('Erro ao chamar webhook externo, usando resposta mock:', webhookError.message);
        
        // Se o webhook externo falhar, retorna a resposta mock para fins de teste
        return res.status(200).json(MOCK_RESPONSE);
      }
    } catch (error) {
      console.error('Erro ao processar requisição para o webhook:', error);
      return res.status(500).json({ error: 'Falha ao encaminhar mensagem para o webhook' });
    }
  });
}