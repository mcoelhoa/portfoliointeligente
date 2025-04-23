import AgentCard from "./AgentCard";
import { agents } from "@/data/agents";

export default function AgentSection() {
  return (
    <section id="agents" className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="inline-block text-3xl md:text-4xl font-tech font-bold mb-4 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-400)] to-[var(--accent-400)]">
              Nossos Agentes de IA
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] rounded-full"></div>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Selecione o agente ideal para suas necessidades e transforme a maneira como você trabalha, cria e toma decisões.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  );
}
