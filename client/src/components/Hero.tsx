export default function Hero() {
  const whatsappLink = "https://api.whatsapp.com/send/?phone=5524988582901&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+saber+mais+sobre+os+agentes+de+IA.&type=phone_number&app_absent=0";
  
  return (
    <section className="relative pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-tech font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-400)] via-[var(--secondary-500)] to-[var(--accent-500)] animate-pulse-slow">
            O Futuro da Inteligência<br/>Artificial ao Seu Alcance
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Descubra agentes de IA especializados para automatizar tarefas, aumentar sua produtividade e impulsionar seus resultados de forma inteligente.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="#agents" 
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-[var(--secondary-500)] to-[var(--secondary-400)] font-medium text-white hover:shadow-lg hover:shadow-[var(--secondary-500)]/20 transition-all duration-300 w-full sm:w-auto"
            >
              Explorar Agentes
            </a>
            <a 
              href={whatsappLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-lg bg-[var(--primary-800)] border border-[var(--secondary-400)]/30 font-medium text-white hover:bg-[var(--primary-700)] transition-all duration-300 w-full sm:w-auto flex items-center justify-center"
            >
              <span>Saiba Mais</span>
              <i className="ri-whatsapp-line ml-2 text-lg"></i>
            </a>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-[var(--secondary-500)]/10 animate-float"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-[var(--accent-500)]/10 animate-float" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-3/4 left-1/3 w-16 h-16 rounded-full bg-[var(--secondary-400)]/10 animate-float" style={{ animationDelay: "2s" }}></div>
    </section>
  );
}
