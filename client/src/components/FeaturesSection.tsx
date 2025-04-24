import { features } from "@/data/features";

export default function FeaturesSection() {
  return (
    <section id="about" className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="inline-block text-3xl md:text-4xl font-tech font-bold mb-4 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-400)] to-[var(--accent-400)]">
              Por que usar nossos Agentes?
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] rounded-full"></div>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Desenvolvidos com tecnologia de ponta para entregar resultados excepcionais em todas as áreas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div key={feature.id} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--secondary-500)]/20">
                <i className={`${feature.icon} text-2xl text-white`}></i>
              </div>
              <h3 className="text-xl font-tech font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
