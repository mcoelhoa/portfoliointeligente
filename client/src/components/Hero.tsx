export default function Hero() {
  const whatsappLink = "https://api.whatsapp.com/send/?phone=5524988582901&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+saber+mais+sobre+os+agentes+de+IA.&type=phone_number&app_absent=0";
  
  return (
    <section className="relative pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden hero-bg">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-tech font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-400)] via-[var(--secondary-500)] to-[var(--accent-500)] animate-pulse-slow">
            O Futuro da Inteligência<br/>Artificial ao Seu Alcance
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Descubra agentes de IA especializados para automatizar tarefas, aumentar sua produtividade e impulsionar seus resultados de forma inteligente.
          </p>
          <div className="flex justify-center items-center">
            <a 
              href="#agents" 
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] font-medium text-white hover:shadow-lg hover:shadow-[#FF416C]/40 transition-all duration-300 w-full sm:w-auto max-w-xs"
            >
              Explorar Agentes
            </a>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-[var(--secondary-500)]/20 backdrop-blur-xl animate-float"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-[var(--accent-500)]/20 backdrop-blur-xl animate-float" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-3/4 left-1/3 w-16 h-16 rounded-full bg-[var(--secondary-400)]/20 backdrop-blur-xl animate-float" style={{ animationDelay: "2s" }}></div>
      
      {/* Added digital network lines in background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </section>
  );
}
