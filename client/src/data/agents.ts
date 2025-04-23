export interface Agent {
  id: number;
  name: string;
  description: string;
  icon: string;
  testUrl?: string;
}

export const agents: Agent[] = [
  {
    id: 1,
    name: "Assistente de Atendimento",
    description: "Automatize seu suporte ao cliente com respostas inteligentes e personalizadas 24/7, melhorando a experiência do usuário.",
    icon: "ri-customer-service-2-line",
    testUrl: "#",
  },
  {
    id: 2,
    name: "Gerador de Conteúdo",
    description: "Crie textos, artigos e posts para redes sociais de forma ágil e criativa, economizando tempo na produção de conteúdo.",
    icon: "ri-file-text-line",
    testUrl: "#",
  },
  {
    id: 3,
    name: "Analista de Dados",
    description: "Transforme dados brutos em insights valiosos com análises automatizadas e visualizações dinâmicas para decisões mais precisas.",
    icon: "ri-line-chart-line",
    testUrl: "#",
  },
  {
    id: 4,
    name: "Assistente de Produtividade",
    description: "Organize sua agenda, priorize tarefas e otimize seu fluxo de trabalho com sugestões inteligentes baseadas em seus hábitos.",
    icon: "ri-calendar-check-line",
    testUrl: "#",
  },
  {
    id: 5,
    name: "Tradutor Inteligente",
    description: "Supere barreiras linguísticas com traduções precisas e naturais, preservando contexto e nuances culturais em múltiplos idiomas.",
    icon: "ri-translate-2",
    testUrl: "#",
  },
  {
    id: 6,
    name: "Assistente de Programação",
    description: "Aumente sua eficiência no desenvolvimento com sugestões de código, debugging automático e respostas para dúvidas técnicas.",
    icon: "ri-code-box-line",
    testUrl: "#",
  },
];
