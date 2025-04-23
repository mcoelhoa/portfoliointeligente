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
    name: "Agente Comercial (SDR)",
    description: "Automatize prospecção, qualificação de leads e agendamento de reuniões, aumentando a conversão de vendas sem expandir sua equipe.",
    icon: "ri-user-voice-line",
    testUrl: "#",
  },
  {
    id: 2,
    name: "Agente Clínicas",
    description: "Otimize agendamentos, confirmações de consultas e acompanhamento de pacientes, melhorando a gestão e reduzindo faltas.",
    icon: "ri-hospital-line",
    testUrl: "#",
  },
  {
    id: 3,
    name: "Agente Imobiliárias",
    description: "Qualifique interessados, organize visitas e mantenha contato com potenciais compradores, acelerando o ciclo de vendas imobiliárias.",
    icon: "ri-home-4-line",
    testUrl: "#",
  },
  {
    id: 4,
    name: "Agente Advocacia",
    description: "Realize triagem de casos, organize informações processuais e mantenha clientes atualizados sobre andamentos jurídicos.",
    icon: "ri-scales-3-line",
    testUrl: "#",
  },
  {
    id: 5,
    name: "Agente Financeiro",
    description: "Automatize análises financeiras, ofereça orientações sobre investimentos e acompanhe indicadores econômicos em tempo real.",
    icon: "ri-bank-line",
    testUrl: "#",
  },
  {
    id: 6,
    name: "Agente Vendedor Infoprodutos",
    description: "Potencialize suas vendas online com abordagens personalizadas e acompanhamento eficiente do funil de conversão.",
    icon: "ri-shopping-cart-line",
    testUrl: "#",
  },
  {
    id: 7,
    name: "Agente CS",
    description: "Eleve a satisfação dos clientes com suporte proativo, resolução rápida de problemas e acompanhamento personalizado.",
    icon: "ri-customer-service-2-line",
    testUrl: "#",
  },
  {
    id: 8,
    name: "Agente Recuperador de Vendas",
    description: "Reconquiste clientes inativos e recupere vendas perdidas com abordagens estratégicas e ofertas personalizadas.",
    icon: "ri-arrow-go-back-line",
    testUrl: "#",
  },
  {
    id: 9,
    name: "Agente Recrutamento (RH)",
    description: "Otimize processos seletivos, triagem de currículos e agendamento de entrevistas, encontrando os melhores talentos com eficiência.",
    icon: "ri-team-line",
    testUrl: "#",
  },
  {
    id: 10,
    name: "Agente para Escolas",
    description: "Melhore a comunicação com pais e alunos, organize eventos escolares e acompanhe o desempenho acadêmico com facilidade.",
    icon: "ri-school-line",
    testUrl: "#",
  },
  {
    id: 11,
    name: "Criador de Conteúdo",
    description: "Produza textos, artigos e materiais educativos com qualidade profissional, economizando tempo e mantendo consistência.",
    icon: "ri-file-text-line",
    testUrl: "#",
  },
  {
    id: 12,
    name: "Agente Terapeuta",
    description: "Auxilie no agendamento de sessões, envio de lembretes e materiais de apoio, otimizando o acompanhamento terapêutico.",
    icon: "ri-mental-health-line",
    testUrl: "#",
  },
  {
    id: 13,
    name: "Agente para Psicólogos",
    description: "Organize agenda, gerenciamento de prontuários e envio de atividades, otimizando o fluxo de trabalho clínico.",
    icon: "ri-psychotherapy-line",
    testUrl: "#",
  },
  {
    id: 14,
    name: "Agente para Nutricionistas",
    description: "Automatize planos alimentares, acompanhamento de pacientes e envio de dicas personalizadas para uma nutrição eficiente.",
    icon: "ri-restaurant-line",
    testUrl: "#",
  },
];
