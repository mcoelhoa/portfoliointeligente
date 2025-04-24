import { socialLinks } from "@/config/social";

export default function CallToAction() {
  // Usar link do WhatsApp das variáveis de ambiente
  const whatsappLink = socialLinks.whatsapp;
  
  return (
    <section className="pt-20 pb-20 md:pt-28 md:pb-28 relative section-light section-divider overflow-hidden">
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
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: "100px", zIndex: 5, marginBottom: "-1px" }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 100" 
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
        >
          <path 
            fill="var(--primary-900)"
            fillOpacity="1" 
            d="M0,0L120,16C240,32,480,64,720,64C960,64,1200,32,1320,16L1440,0L1440,100L1320,100C1200,100,960,100,720,100C480,100,240,100,120,100L0,100Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
