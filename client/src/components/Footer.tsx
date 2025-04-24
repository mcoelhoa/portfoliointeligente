export default function Footer() {
  return (
    <footer className="py-12 bg-[var(--primary-900)] border-t border-[var(--primary-800)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] flex items-center justify-center mr-3 shadow-lg shadow-[var(--secondary-500)]/20">
              <i className="ri-brain-line text-xl text-white"></i>
            </div>
            <h2 className="text-3xl font-tech font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-400)] to-[var(--accent-400)]">AIGents</h2>
          </div>
          
          <p className="text-gray-300 max-w-lg mx-auto mb-8 text-lg">
            Transformando o futuro com soluções de inteligência artificial inovadoras e acessíveis.
          </p>
          
          <div className="flex mb-12">
            <a 
              href="http://instagram.com/unitmedia1/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] flex items-center justify-center hover:shadow-lg hover:shadow-[var(--secondary-500)]/30 transition-all"
            >
              <i className="ri-instagram-line text-xl text-white"></i>
            </a>
          </div>
          
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} AIGents. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
