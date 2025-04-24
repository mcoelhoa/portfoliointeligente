export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export const features: Feature[] = [
  {
    id: 1,
    title: "Alta Performance",
    description: "Respostas rápidas e precisas, mesmo com grandes volumes de dados ou solicitações complexas.",
    icon: "ri-speed-up-line",
  },
  {
    id: 2,
    title: "Segurança Avançada",
    description: "Seus dados são protegidos com criptografia de ponta a ponta e medidas de segurança rigorosas.",
    icon: "ri-lock-line",
  },
  {
    id: 3,
    title: "Análise Inteligente",
    description: "Insights valiosos baseados em padrões e comportamentos para tomar melhores decisões.",
    icon: "ri-pie-chart-line",
  },
  {
    id: 4,
    title: "Personalização Total",
    description: "Agentes adaptáveis que aprendem com suas preferências e se ajustam às suas necessidades.",
    icon: "ri-settings-line",
  },
  {
    id: 5,
    title: "Suporte Multilíngue",
    description: "Comunicação eficiente em diversos idiomas, eliminando barreiras linguísticas.",
    icon: "ri-global-line",
  },
  {
    id: 6,
    title: "Integração Simples",
    description: "Fácil implementação com suas ferramentas e sistemas existentes, sem complicações técnicas.",
    icon: "ri-plug-line",
  },
];
