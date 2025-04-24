import { features } from "@/data/features";

export default function FeaturesSection() {
  return (
    <section id="about" className="pt-16 pb-24 md:pt-24 md:pb-28 relative section-dark section-divider">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <span className="inline-block py-1 px-3 rounded-full bg-[var(--secondary-600)]/10 text-[var(--secondary-500)] text-sm font-semibold mb-4 transform transition-transform hover:scale-105 duration-300">
            Vantagens Exclusivas
          </span>
          <h2 className="text-3xl md:text-5xl font-tech font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-500)] to-white">
              Por que usar nossos Agentes?
            </span>
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-400)] rounded-full mx-auto mb-6"></div>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Desenvolvidos com tecnologia de ponta para entregar resultados excepcionais em todas as áreas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div key={feature.id} className="flex flex-col items-center text-center group relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--secondary-600)] to-[var(--secondary-400)] p-0.5 mb-6 shadow-lg shadow-[var(--secondary-500)]/20 relative z-10 transform transition-transform group-hover:scale-110 duration-500">
                <div className="w-full h-full rounded-2xl bg-[var(--primary-900)] flex items-center justify-center">
                  <i className={`${feature.icon} text-2xl text-[var(--secondary-500)]`}></i>
                </div>
              </div>
              
              {/* Decorative blur effect */}
              <div className="absolute w-24 h-24 bg-[var(--secondary-500)]/10 rounded-full blur-xl -z-0 top-0 opacity-50 group-hover:opacity-80 transition-all duration-500"></div>
              
              <h3 className="text-xl font-tech font-semibold mb-4 text-white group-hover:text-[var(--secondary-400)] transition-colors duration-300">{feature.title}</h3>
              
              <p className="text-white/70 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Subtle line connector for desktop */}
              <div className="hidden lg:block absolute top-10 right-0 w-full h-px bg-gradient-to-r from-[var(--secondary-600)]/0 via-[var(--secondary-600)]/30 to-[var(--secondary-600)]/0"></div>
            </div>
          ))}
        </div>
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
            d="M0,224L80,229.3C160,235,320,245,480,245.3C640,245,800,235,960,213.3C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
