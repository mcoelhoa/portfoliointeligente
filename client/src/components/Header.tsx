import { Link } from "wouter";
import { useState, useEffect } from "react";
import unitmediaLogo from "@/assets/unitmedia-logo.png";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappLink = "https://api.whatsapp.com/send/?phone=5524988582901&text=Ol%C3%A1%21+Vim+do+site+e+gostaria+de+saber+mais+sobre+os+agentes+de+IA.&type=phone_number&app_absent=0";

  return (
    <header className={`fixed w-full top-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'py-3 bg-[var(--primary-900)]/95 backdrop-blur-md shadow-lg' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="container mx-auto px-4 flex justify-center items-center">
        {/* Logo (Centralized) */}
        <div className="logo-container flex items-center justify-center">
          <div className={`transition-all duration-300 ${
            isScrolled ? 'h-10' : 'h-14'
          }`}>
            <img 
              src={unitmediaLogo} 
              alt="Logo da Unitmedia" 
              className="logo-responsive h-full w-auto max-w-full"
              style={{ maxHeight: isScrolled ? '40px' : '56px' }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
