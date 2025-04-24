import unitmediaLogo from "@/assets/unitmedia-logo.png";
import { socialLinks } from "@/config/social";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  // Usar link do WhatsApp das variáveis de ambiente
  const whatsappLink = socialLinks.whatsapp;

  return (
    <footer className="py-16 bg-[var(--primary-900)] relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo centralized */}
          <div className="logo-container flex items-center justify-center mb-6">
            <div className="h-20">
              <img 
                src={unitmediaLogo} 
                alt="Logo da Unitmedia" 
                className="logo-responsive h-full w-auto max-w-full"
                style={{ maxHeight: '80px' }}
              />
            </div>
          </div>
          
          {/* Slogan */}
          <p className="text-gray-300 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
            O futuro da inteligência artificial ao seu alcance, transformando ideias em resultados extraordinários.
          </p>
          
          {/* Social icons */}
          <div className="flex justify-center mb-10 gap-6">
            <a 
              href={socialLinks.instagram}
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
          <p className="text-gray-500 text-sm">&copy; {currentYear} Unitmedia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
