import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="relative z-10">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] flex items-center justify-center mr-3">
            <i className="ri-brain-line text-xl"></i>
          </div>
          <h1 className="text-2xl font-tech font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-400)] to-[var(--accent-400)]">
            AIGents
          </h1>
        </div>
        
        <nav className={`md:block ${mobileMenuOpen ? 'block absolute top-20 right-4 bg-[var(--primary-800)] p-4 rounded-lg shadow-lg w-48 z-50' : 'hidden'}`}>
          <ul className={`${mobileMenuOpen ? 'flex flex-col space-y-4' : 'flex space-x-8'}`}>
            <li>
              <a href="#" className="font-medium hover:text-[var(--secondary-400)] transition-colors">
                Início
              </a>
            </li>
            <li>
              <a href="#agents" className="font-medium hover:text-[var(--secondary-400)] transition-colors">
                Agentes
              </a>
            </li>
            <li>
              <a href="#about" className="font-medium hover:text-[var(--secondary-400)] transition-colors">
                Sobre
              </a>
            </li>
            <li>
              <a href="#contact" className="font-medium hover:text-[var(--secondary-400)] transition-colors">
                Contato
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="md:hidden">
          <button 
            className="text-white text-2xl focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <i className="ri-menu-line"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
