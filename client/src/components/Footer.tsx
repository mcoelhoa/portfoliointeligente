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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] p-0.5 flex items-center justify-center mr-3 shadow-lg shadow-[var(--secondary-600)]/20">
                <div className="w-full h-full rounded-2xl bg-[var(--primary-900)] flex items-center justify-center">
                  <i className="ri-brain-line text-2xl text-[var(--secondary-500)]"></i>
                </div>
              </div>
              <h2 className="text-3xl font-tech font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-500)] to-white">AIGents</h2>
            </div>
            
            <p className="text-gray-300 max-w-lg mb-8 text-base leading-relaxed">
              Transformando o futuro com soluções de inteligência artificial inovadoras e acessíveis para empresas e profissionais que buscam automação, produtividade e resultados extraordinários.
            </p>
            
            <div className="flex mb-6 gap-4">
              <a 
                href="http://instagram.com/unitmedia1/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] p-0.5 flex items-center justify-center hover:shadow-lg hover:shadow-[var(--secondary-600)]/30 transition-all transform hover:scale-110 duration-300"
              >
                <div className="w-full h-full rounded-full bg-[var(--primary-900)] flex items-center justify-center">
                  <i className="ri-instagram-line text-lg text-[var(--secondary-500)]"></i>
                </div>
              </a>
              <a 
                href={whatsappLink}
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] p-0.5 flex items-center justify-center hover:shadow-lg hover:shadow-[var(--secondary-600)]/30 transition-all transform hover:scale-110 duration-300"
              >
                <div className="w-full h-full rounded-full bg-[var(--primary-900)] flex items-center justify-center">
                  <i className="ri-whatsapp-line text-lg text-[var(--secondary-500)]"></i>
                </div>
              </a>
            </div>
          </div>
          
          {/* Links Columns */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Navegação</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-[var(--secondary-500)] transition-colors duration-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-[var(--secondary-500)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Início</span>
                </a>
              </li>
              <li>
                <a href="#agents" className="text-gray-400 hover:text-[var(--secondary-500)] transition-colors duration-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-[var(--secondary-500)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Agentes</span>
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-[var(--secondary-500)] transition-colors duration-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-[var(--secondary-500)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Recursos</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="text-gray-400 flex items-start">
                <i className="ri-phone-line text-[var(--secondary-500)] mr-3 mt-1"></i>
                <span>+55 (24) 98858-2901</span>
              </li>
              <li className="text-gray-400 flex items-start">
                <i className="ri-map-pin-line text-[var(--secondary-500)] mr-3 mt-1"></i>
                <span>Rio de Janeiro, RJ<br/>Brasil</span>
              </li>
              <li className="text-gray-400 flex items-start">
                <i className="ri-time-line text-[var(--secondary-500)] mr-3 mt-1"></i>
                <span>Segunda a Sexta<br/>8:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary-800)] to-transparent mb-6"></div>
        
        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-gray-500 text-sm">&copy; {currentYear} AIGents. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 text-sm hover:text-[var(--secondary-500)] transition-colors duration-300">Termos de Uso</a>
            <a href="#" className="text-gray-500 text-sm hover:text-[var(--secondary-500)] transition-colors duration-300">Política de Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
