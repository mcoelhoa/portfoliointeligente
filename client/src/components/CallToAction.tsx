export default function CallToAction() {
  const whatsappLink = "https://api.whatsapp.com/send/?phone=5524988582901&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+saber+mais+sobre+os+agentes+de+IA.&type=phone_number&app_absent=0";
  
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
          <div className="flex justify-center items-center">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] font-medium text-white hover:shadow-lg hover:shadow-[#FF416C]/40 transition-all duration-300 w-full sm:w-auto max-w-xs flex items-center justify-center"
            >
              <span>Converse pelo WhatsApp</span>
              <i className="ri-whatsapp-line ml-2 text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
