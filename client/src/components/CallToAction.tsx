export default function CallToAction() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-[var(--primary-800)] to-[var(--secondary-900)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full neural-bg"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-tech font-bold mb-6 text-white">
            Pronto para transformar sua experiência com IA?
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Comece agora mesmo e descubra como nossos agentes de IA podem revolucionar seus processos, aumentar sua produtividade e impulsionar seus resultados.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="#agents" 
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] font-medium text-white hover:shadow-lg hover:shadow-[var(--accent-500)]/30 transition-all duration-300 w-full sm:w-auto animate-pulse-slow"
            >
              Começar Gratuitamente
            </a>
            <a 
              href="#contact" 
              className="px-8 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 font-medium text-white hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
            >
              Falar com Especialista
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
