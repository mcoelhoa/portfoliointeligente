export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappLink = "https://api.whatsapp.com/send/?phone=5524988582901&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+saber+mais+sobre+os+agentes+de+IA.&type=phone_number&app_absent=0";

  return (
    <footer className="pt-24 pb-12 bg-[var(--primary-900)] relative">
      {/* Wave top decoration */}
      <div className="absolute top-0 left-0 w-full overflow-hidden rotate-180">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16">
          {/* Logo & Description (Centered) */}
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] p-0.5 flex items-center justify-center mr-3 shadow-lg shadow-[var(--secondary-600)]/20">
              <div className="w-full h-full rounded-2xl bg-[var(--primary-900)] flex items-center justify-center">
                <i className="ri-brain-line text-2xl text-[var(--secondary-500)]"></i>
              </div>
            </div>
            <h2 className="text-3xl font-tech font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-500)] to-white">AIGents</h2>
          </div>
          
          <p className="text-gray-300 max-w-lg mb-8 text-base leading-relaxed">
            Transformando o futuro com soluções de inteligência artificial para automação, produtividade e inovação nos negócios.
          </p>
          
          {/* Social Icons (Centered) */}
          <div className="flex gap-4 mb-6">
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
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary-800)] to-transparent mb-6"></div>
        
        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">&copy; {currentYear} AIGents. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
