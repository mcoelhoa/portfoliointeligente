import { Link } from "wouter";
import { useState, useEffect } from "react";

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
        <div className="flex items-center">
          <div className={`rounded-2xl bg-gradient-to-r from-[var(--secondary-600)] to-[var(--secondary-500)] p-0.5 flex items-center justify-center mr-3 shadow-lg shadow-[var(--secondary-600)]/20 transition-all duration-300 ${
            isScrolled ? 'w-10 h-10' : 'w-12 h-12'
          }`}>
            <div className="w-full h-full rounded-2xl bg-[var(--primary-900)] flex items-center justify-center">
              <i className={`ri-brain-line ${isScrolled ? 'text-lg' : 'text-xl'} text-[var(--secondary-500)]`}></i>
            </div>
          </div>
          <h1 className={`font-tech font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-500)] to-white transition-all duration-300 ${
            isScrolled ? 'text-2xl' : 'text-3xl'
          }`}>
            AIGents
          </h1>
        </div>
      </div>
    </header>
  );
}
