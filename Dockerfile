# Estágio de build - Usando Node 20 para otimização
FROM node:20-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar todo o código fonte
COPY . .

# Compilar a aplicação
RUN npm run build

# Estágio de produção - Usando Node 20 Alpine para menor tamanho
FROM node:20-alpine AS production

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos necessários do estágio de build
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server

# Definir porta da aplicação
EXPOSE 3000

# Definir variáveis de ambiente para produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "server/index.js"]