export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappLink = "https://api.whatsapp.com/send/?phone=5524988582901&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+saber+mais+sobre+os+agentes+de+IA.&type=phone_number&app_absent=0";

  return (
    <footer className="py-16 bg-[var(--primary-900)] relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo centralized */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] p-0.5 flex items-center justify-center mr-3 shadow-lg shadow-[var(--secondary-600)]/20">
              <div className="w-full h-full rounded-2xl bg-[var(--primary-900)] flex items-center justify-center">
                <i className="ri-brain-line text-2xl text-[var(--secondary-500)]"></i>
              </div>
            </div>
            <h2 className="text-3xl font-tech font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-500)] to-white">AIGents</h2>
          </div>
          
          {/* Slogan */}
          <p className="text-gray-300 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
            O futuro da inteligência artificial ao seu alcance, transformando ideias em resultados extraordinários.
          </p>
          
          {/* Social icons */}
          <div className="flex justify-center mb-10 gap-6">
            <a 
              href="http://instagram.com/unitmedia1/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] p-0.5 flex items-center justify-center hover:shadow-lg hover:shadow-[var(--secondary-600)]/30 transition-all transform hover:scale-110 duration-300"
            >
              <div className="w-full h-full rounded-full bg-[var(--primary-900)] flex items-center justify-center">
                <i className="ri-instagram-line text-xl text-[var(--secondary-500)]"></i>
              </div>
            </a>
            <a 
              href={whatsappLink}
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] p-0.5 flex items-center justify-center hover:shadow-lg hover:shadow-[var(--secondary-600)]/30 transition-all transform hover:scale-110 duration-300"
            >
              <div className="w-full h-full rounded-full bg-[var(--primary-900)] flex items-center justify-center">
                <i className="ri-whatsapp-line text-xl text-[var(--secondary-500)]"></i>
              </div>
            </a>
          </div>
          
          {/* Divider */}
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-[var(--secondary-500)]/30 to-transparent mb-6"></div>
          
          {/* Copyright */}
          <p className="text-gray-500 text-sm">&copy; {currentYear} AIGents. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
