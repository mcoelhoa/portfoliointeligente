# Etapa de compilação
FROM node:20-alpine as builder

WORKDIR /app

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

# Criar usuário não-root para segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar dependências e arquivos compilados
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copiar arquivo de inicialização e outros arquivos necessários
COPY --from=builder /app/server ./server

# Configurar variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=8080

# Expor a porta em que a aplicação será executada
EXPOSE 8080

# Mudar para o usuário não-root
USER appuser

# Iniciar a aplicação
CMD ["node", "dist/index.js"]