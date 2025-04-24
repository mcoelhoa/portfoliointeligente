export default function Hero() {
  const whatsappLink = "https://api.whatsapp.com/send/?phone=5524988582901&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+saber+mais+sobre+os+agentes+de+IA.&type=phone_number&app_absent=0";
  
  return (
    <section className="relative pt-16 pb-24 md:pt-28 md:pb-32 overflow-hidden hero-bg section-dark section-divider">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-tech font-bold leading-none mb-8 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-500)] via-[var(--secondary-600)] to-[var(--accent-500)]">
              O Futuro da Inteligência
            </span>
            <br/>
            <span className="text-white">Artificial ao Seu Alcance</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Descubra agentes de IA especializados para automatizar tarefas, aumentar sua produtividade e impulsionar seus resultados de forma inteligente.
          </p>
          <div className="flex justify-center">
            <a 
              href="#agents" 
              className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] font-medium text-white hover:shadow-lg hover:shadow-[var(--secondary-500)]/20 transition-all duration-300 w-full sm:w-auto"
            >
              <span className="flex items-center justify-center">
                <span>Explorar Agentes</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Floating elements with enhanced depth */}
      <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-[var(--secondary-600)]/30 to-[var(--secondary-500)]/10 backdrop-blur-xl animate-float shadow-xl"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-gradient-to-tr from-[var(--accent-500)]/30 to-[var(--accent-400)]/10 backdrop-blur-xl animate-float shadow-xl" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-3/4 left-1/3 w-16 h-16 rounded-full bg-gradient-to-r from-[var(--secondary-400)]/30 to-transparent backdrop-blur-xl animate-float shadow-xl" style={{ animationDelay: "2s" }}></div>
      
      {/* Enhanced digital network lines in background */}
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
      
      {/* Nexus-style wave transition */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: "70px", zIndex: 5 }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
        >
          <path 
            fill="white"
            fillOpacity="1" 
            d="M0,128L80,144C160,160,320,192,480,192C640,192,800,160,960,154.7C1120,149,1280,171,1360,181.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
