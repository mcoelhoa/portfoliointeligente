#!/bin/bash
set -e

# Configurações
IMAGE_NAME="ai-agents-app"
TAG="latest"

# Cores para melhor legibilidade
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Mensagem de início
echo -e "${YELLOW}Iniciando build do Docker para $IMAGE_NAME:$TAG...${NC}"

# Build da imagem Docker
echo -e "\n${GREEN}[1/3]${NC} Construindo imagem Docker..."
docker build -t $IMAGE_NAME:$TAG .

# Verificação se a imagem foi criada com sucesso
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Imagem Docker construída com sucesso: $IMAGE_NAME:$TAG${NC}"
else
    echo -e "\n${YELLOW}⚠ Falha ao construir a imagem Docker.${NC}"
    exit 1
fi

# Listar a imagem criada
echo -e "\n${GREEN}[2/3]${NC} Verificando imagem criada:"
docker images | grep $IMAGE_NAME

# Executar testes com a imagem (opcional)
echo -e "\n${GREEN}[3/3]${NC} Verificando se a imagem está funcionando..."
echo -e "${YELLOW}Iniciando container para teste rápido...${NC}"

# Execute o container em background, mapeando a porta e definindo um nome para o container
CONTAINER_ID=$(docker run -d --name $IMAGE_NAME-test -p 8080:8080 $IMAGE_NAME:$TAG)

# Aguarde alguns segundos para o container iniciar
echo "Aguardando o container iniciar..."
sleep 5

# Verifique se o container está em execução
if docker ps | grep -q $IMAGE_NAME-test; then
    echo -e "${GREEN}✓ Container de teste iniciado com sucesso!${NC}"
    
    # Tente acessar o health check
    HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health || echo "falhou")
    
    if [ "$HEALTH_CHECK" == "200" ]; then
        echo -e "${GREEN}✓ Health check respondeu com sucesso (200 OK)${NC}"
    else
        echo -e "${YELLOW}⚠ Health check não respondeu corretamente. Status: $HEALTH_CHECK${NC}"
    fi
    
    # Pare e remova o container de teste
    echo "Parando e removendo o container de teste..."
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
else
    echo -e "${YELLOW}⚠ Container de teste não está em execução.${NC}"
    # Tente obter logs do container para diagnóstico
    echo "Logs do container:"
    docker logs $IMAGE_NAME-test
    
    # Limpe o container mesmo se falhou
    docker rm -f $IMAGE_NAME-test 2>/dev/null || true
fi

echo -e "\n${GREEN}Processo concluído!${NC}"
echo -e "Para executar a aplicação localmente:"
echo -e "  ${YELLOW}docker-compose up -d${NC}"
echo -e "Para acessar, abra: ${YELLOW}http://localhost:8080${NC}"