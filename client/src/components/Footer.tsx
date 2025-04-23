export default function Footer() {
  return (
    <footer className="py-12 bg-[var(--primary-900)] border-t border-[var(--primary-800)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] flex items-center justify-center mr-3">
                <i className="ri-brain-line text-xl"></i>
              </div>
              <h2 className="text-2xl font-tech font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-400)] to-[var(--accent-400)]">AIGents</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Transformando o futuro com soluções de inteligência artificial inovadoras e acessíveis.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--primary-800)] flex items-center justify-center hover:bg-[var(--secondary-900)] transition-colors">
                <i className="ri-twitter-x-line text-white"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--primary-800)] flex items-center justify-center hover:bg-[var(--secondary-900)] transition-colors">
                <i className="ri-linkedin-fill text-white"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--primary-800)] flex items-center justify-center hover:bg-[var(--secondary-900)] transition-colors">
                <i className="ri-instagram-line text-white"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--primary-800)] flex items-center justify-center hover:bg-[var(--secondary-900)] transition-colors">
                <i className="ri-github-fill text-white"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Agentes</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Assistente de Atendimento</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Gerador de Conteúdo</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Analista de Dados</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Assistente de Produtividade</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Tradutor Inteligente</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Empresa</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Imprensa</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Cookies</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">Diretrizes de IA Responsável</a></li>
              <li><a href="#" className="hover:text-[var(--secondary-400)] transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[var(--primary-800)] text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} AIGents. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
