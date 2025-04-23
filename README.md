# AI Agents - Plataforma Interativa

Uma plataforma moderna de showcase de agentes de IA com integração avançada de webhooks e experiência de chat dinâmica, incluindo comunicação multimodal com suporte a mensagens de áudio.

## 🚀 Tecnologias

- React.js para o frontend
- TailwindCSS para estilos
- Framer Motion para animações
- N8N para integração de webhooks
- Suporte a múltiplos tipos de mensagem (texto, imagem, áudio, vídeo, documento)
- Capacidades de gravação e reprodução de áudio
- Interface de chat responsiva estilo WhatsApp

## 📋 Pré-requisitos

- Node.js 20+
- NPM
- Docker (para containerização)
- Kubectl (para deployment Kubernetes)

## 🔧 Instalação e Execução Local

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/ai-agents.git
cd ai-agents

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5000`.

## 🐳 Containerização com Docker

### Construir a imagem Docker

```bash
# Usando script automatizado
./scripts/build-docker.sh

# OU manualmente
docker build -t ai-agents-app:latest .
```

### Executar localmente com Docker Compose

```bash
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:8080`.

## 🚢 Deployment Kubernetes

### Pré-requisitos
- Cluster Kubernetes configurado
- kubectl instalado e configurado
- kustomize instalado

### Deploy com Kustomize

```bash
# Navegar até o diretório de configuração Kubernetes
cd kubernetes

# Atualizar imagem se necessário (opcional)
kustomize edit set image ai-agents-app=seu-registry/ai-agents-app:latest

# Aplicar configuração
kubectl apply -k .

# Verificar status do deployment
kubectl rollout status deployment/ai-agents-app -n ai-platform
```

### Acessar a aplicação

A aplicação estará disponível através do Ingress configurado, normalmente em `https://agents.example.com` (substitua pelo domínio real configurado).

## 🔄 CI/CD

O projeto possui integração contínua e deployment contínuo configurados com GitHub Actions. A cada push para a branch principal:

1. A aplicação é construída e testada
2. Uma imagem Docker é criada e publicada
3. A aplicação é automaticamente implantada no cluster Kubernetes

É necessário configurar os seguintes secrets no GitHub:

- `REGISTRY_URL`: URL do registro de container
- `REGISTRY_USERNAME`: Usuário do registro
- `REGISTRY_PASSWORD`: Senha do registro
- `KUBE_CONFIG`: Arquivo kubeconfig codificado em base64

## 🤝 Integração com Webhook

A integração com webhook está configurada para comunicação com N8N ou qualquer outro serviço que aceite JSON. O endpoint de webhook é:

```
https://n8neditor.unitmedia.cloud/webhook-test/portfolio
```

O formato da resposta do webhook esperado é:

```json
[
  {
    "messages": [
      {
        "message": "Conteúdo da mensagem",
        "typeMessage": "text" // ou "audio", "image", "document", "video"
      }
    ]
  }
]
```

## 🎙️ Suporte a Áudio

A aplicação suporta gravação e envio de áudio, com as seguintes características:

- Compressão de áudio usando o codec Opus (12kbps, mono, 16kHz)
- Interface de controle de gravação redesenhada (botão de gravação muda para pause)
- Contador de duração em tempo real durante a gravação
- Indicador de "digitando" entre mensagens sequenciais
- Envio de áudio como base64 no payload do webhook