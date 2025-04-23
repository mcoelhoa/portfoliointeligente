import axios from 'axios';
import { Express, Request, Response } from 'express';

const WEBHOOK_URL = 'https://n8nwebhook.unitmedia.cloud/webhook/portfolio';

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
      console.error('Erro ao encaminhar mensagem para o webhook:', error);
      return res.status(500).json({ error: 'Falha ao encaminhar mensagem para o webhook' });
    }
  });
}