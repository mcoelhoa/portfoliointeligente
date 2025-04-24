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
    <section id="agents" className="pt-16 pb-24 md:pt-20 md:pb-32 relative section-light section-divider">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-[var(--primary-900)]/10 text-[var(--primary-900)] text-sm font-semibold mb-4 transform transition-transform hover:scale-105 duration-300">
            Tecnologia Avançada
          </span>
          <h2 className="text-3xl md:text-5xl font-tech font-bold mb-6 relative tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-900)] to-[var(--accent-500)]">
              Nossos Agentes de IA
            </span>
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-400)] rounded-full mx-auto mb-6"></div>
          <p className="text-[var(--primary-800)] max-w-2xl mx-auto text-lg mb-12">
            Selecione o agente ideal para suas necessidades e transforme a maneira como você trabalha, cria e toma decisões.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {agents.slice(0, visibleAgents).map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
        
        <div className="flex justify-center mt-16">
          {visibleAgents < agents.length ? (
            <button 
              onClick={handleShowMore}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] font-medium text-white hover:shadow-lg hover:shadow-[var(--secondary-500)]/20 transition-all duration-300 flex items-center"
            >
              <span>Ver mais agentes</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          ) : visibleAgents > 6 && (
            <button 
              onClick={handleShowLess}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] font-medium text-white hover:shadow-lg hover:shadow-[var(--secondary-500)]/20 transition-all duration-300 flex items-center"
            >
              <span>Ver menos</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Nexus-style wave transition to the next section */}
      <div className="absolute -bottom-2 left-0 w-full h-20 z-0 overflow-hidden">
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full" style={{transform: "rotate(180deg)"}}>
          <path d="M0,100 C150,200 350,0 500,100 L500,150 L0,150 Z" fill="var(--primary-900)"></path>
        </svg>
      </div>
    </section>
  );
}
