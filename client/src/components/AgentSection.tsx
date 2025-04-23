import { useState } from "react";
import AgentCard from "./AgentCard";
import { agents } from "@/data/agents";

export default function AgentSection() {
  const [visibleAgents, setVisibleAgents] = useState(6);
  
  const handleShowMore = () => {
    setVisibleAgents(prev => 
      prev + 6 > agents.length ? agents.length : prev + 6
    );
  };
  
  const handleShowLess = () => {
    setVisibleAgents(6);
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {agents.slice(0, visibleAgents).map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          {visibleAgents < agents.length ? (
            <button 
              onClick={handleShowMore}
              className="px-6 py-3 rounded-lg bg-[var(--primary-800)] border border-[var(--secondary-400)]/30 font-medium text-white hover:bg-[var(--primary-700)] transition-all duration-300 flex items-center"
            >
              <span>Ver mais agentes</span>
              <i className="ri-arrow-down-line ml-2"></i>
            </button>
          ) : visibleAgents > 6 && (
            <button 
              onClick={handleShowLess}
              className="px-6 py-3 rounded-lg bg-[var(--primary-800)] border border-[var(--secondary-400)]/30 font-medium text-white hover:bg-[var(--primary-700)] transition-all duration-300 flex items-center"
            >
              <span>Ver menos</span>
              <i className="ri-arrow-up-line ml-2"></i>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
