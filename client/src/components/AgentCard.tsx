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
      <div className="card bg-gradient-to-br from-[var(--primary-800)] to-[var(--primary-900)] rounded-xl overflow-hidden border border-[var(--secondary-500)]/20 glow-effect h-full flex flex-col">
        <div className="p-6 flex flex-col flex-grow">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--secondary-500)] to-[var(--accent-500)] flex items-center justify-center mb-5 mx-auto">
            <i className={`${agent.icon} text-2xl text-white`}></i>
          </div>
          <h3 className="text-xl font-tech font-semibold text-center mb-3 line-clamp-2">{agent.name}</h3>
          <p className="text-gray-300 text-center mb-6 flex-grow">
            {agent.description}
          </p>
          <div className="text-center mt-auto">
            <button 
              className="px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center mx-auto bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] hover:shadow-lg hover:shadow-[#FF416C]/40 transition-all duration-300"
              onClick={handleOpenChat}
            >
              <span>TESTAR AGORA</span>
              <i className="ri-arrow-right-line ml-2"></i>
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
