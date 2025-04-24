export default function CallToAction() {
  const whatsappLink = "https://api.whatsapp.com/send/?phone=5524988582901&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+saber+mais+sobre+os+agentes+de+IA.&type=phone_number&app_absent=0";
  
  return (
    <section className="pt-20 pb-28 md:pt-28 md:pb-36 relative section-light section-divider overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[var(--primary-900)] to-[var(--primary-800)] rounded-3xl p-2 shadow-2xl overflow-hidden">
            <div className="relative bg-gradient-to-br from-[var(--primary-900)] to-[var(--primary-800)] rounded-2xl p-8 md:p-12 lg:p-16 flex flex-col items-center backdrop-blur-sm">
              
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                <div className="absolute top-0 left-0 w-full h-full neural-bg"></div>
              </div>
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-[var(--secondary-500)]/20 to-[var(--secondary-600)]/10 blur-2xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-[var(--accent-500)]/20 to-transparent blur-2xl"></div>
              
              {/* Text content (centered) */}
              <div className="text-center z-10 max-w-3xl mx-auto">
                <span className="inline-block py-1 px-3 rounded-full bg-[var(--secondary-600)]/10 text-[var(--secondary-500)] text-sm font-semibold mb-6">
                  Comece Agora
                </span>
                <h2 className="text-3xl md:text-5xl font-tech font-bold mb-6 text-white leading-tight">
                  Pronto para <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-500)] to-[var(--secondary-400)]">transformar</span> sua experiência com IA?
                </h2>
                <p className="text-lg text-white/80 mb-8 mx-auto">
                  Comece agora mesmo e descubra como nossos agentes de IA podem revolucionar seus processos, aumentar sua produtividade e impulsionar seus resultados.
                </p>
                <div className="flex justify-center">
                  <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] font-medium text-white hover:shadow-lg hover:shadow-[var(--secondary-500)]/30 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center max-w-xs mx-auto"
                  >
                    <span>Converse pelo WhatsApp</span>
                    <i className="ri-whatsapp-line ml-2 text-lg"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nexus-style wave transition */}
      <div className="absolute -bottom-1 left-0 w-full overflow-hidden" style={{ height: "150px" }}>
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="absolute bottom-0 w-full h-full"
          style={{ transform: "translateY(1px)" }}
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            fill="var(--primary-900)" 
            className="shape-fill"
          ></path>
        </svg>
      </div>
    </section>
  );
}
