import { Agent } from "@/data/agents";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="card bg-gradient-to-br from-[var(--primary-800)] to-[var(--primary-900)] rounded-xl overflow-hidden border border-[var(--secondary-500)]/20 glow-effect">
      <div className="p-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--secondary-500)] to-[var(--accent-500)] flex items-center justify-center mb-5 mx-auto">
          <i className={`${agent.icon} text-2xl text-white`}></i>
        </div>
        <h3 className="text-xl font-tech font-semibold text-center mb-3">{agent.name}</h3>
        <p className="text-gray-300 text-center mb-6 h-20">
          {agent.description}
        </p>
        <div className="text-center">
          <button 
            className="test-btn px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center mx-auto"
            onClick={() => window.open(agent.testUrl || '#')}
          >
            <span>TESTAR AGORA</span>
            <i className="ri-arrow-right-line ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
