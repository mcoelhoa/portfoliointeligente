# Etapa de compilação
FROM node:20-alpine as builder

WORKDIR /app

# Instalar dependências necessárias para compilação
RUN apk add --no-cache python3 make g++

# Copiar arquivos de configuração e instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar o código-fonte
COPY . .

# Compilar a aplicação
RUN npm run build

# Etapa de produção
FROM node:20-alpine

WORKDIR /app

# Instalar dependências de produção
RUN apk add --no-cache curl dumb-init

# Criar usuário não-root para segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar dependências e arquivos compilados
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Configurar variáveis de ambiente para produção
ENV NODE_ENV=production
# Usar porta 5000 conforme definido no server/index.ts
ENV PORT=5000

# Healthcheck para verificar se a aplicação está respondendo
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Expor a porta em que a aplicação será executada
EXPOSE 5000

# Criar diretórios necessários e definir permissões
RUN mkdir -p /app/tmp /app/logs && \
    chown -R appuser:appgroup /app

# Mudar para o usuário não-root
USER appuser

# Usar dumb-init como processo init para gerenciar sinais corretamente
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Iniciar a aplicação
CMD ["node", "dist/index.js"]