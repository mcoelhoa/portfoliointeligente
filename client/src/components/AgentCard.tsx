import { useState } from "react";
import { Agent } from "@/data/agents";
import ChatModal from "./ChatModal";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const handleOpenChat = () => {
    setIsChatOpen(true);
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };
  
  return (
    <>
      <div className="card bg-white dark:bg-[var(--primary-800)]/10 rounded-2xl overflow-hidden border border-[var(--secondary-600)]/10 hover:border-[var(--secondary-600)]/30 hover:shadow-xl shadow-md transition-all duration-500 h-full flex flex-col group">
        <div className="p-6 sm:p-8 flex flex-col flex-grow relative">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
            <div className="absolute transform rotate-45 bg-gradient-to-r from-[var(--secondary-500)]/10 to-[var(--secondary-600)]/10 w-20 h-6 -top-3 -right-10"></div>
          </div>
          
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--secondary-600)] to-[var(--accent-500)] flex items-center justify-center mb-6 mx-auto shadow-lg shadow-[var(--secondary-500)]/10 group-hover:shadow-[var(--secondary-500)]/20 transition-all duration-500">
            <i className={`${agent.icon} text-2xl text-white`}></i>
          </div>
          
          <h3 className="text-xl font-tech font-semibold text-center mb-3 line-clamp-2 text-[var(--primary-900)] group-hover:text-[var(--secondary-600)] transition-colors duration-300">{agent.name}</h3>
          
          <p className="text-[var(--primary-800)] text-center mb-6 flex-grow leading-relaxed">
            {agent.description}
          </p>
          
          <div className="text-center mt-auto">
            <button 
              className="px-6 py-3 rounded-full font-medium text-white flex items-center justify-center mx-auto bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] hover:shadow-lg hover:shadow-[var(--secondary-500)]/20 transform hover:-translate-y-1 transition-all duration-300"
              onClick={handleOpenChat}
            >
              <span>TESTAR AGORA</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={handleCloseChat} 
        agent={agent} 
      />
    </>
  );
}
