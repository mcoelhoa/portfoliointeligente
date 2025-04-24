import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  subject: z.string().min(3, { message: "Assunto deve ter pelo menos 3 caracteres" }),
  message: z.string().min(10, { message: "Mensagem deve ter pelo menos 10 caracteres" }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would normally send the data to an API
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Mensagem enviada",
        description: "Entraremos em contato em breve!",
      });
      
      reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="inline-block text-3xl md:text-4xl font-tech font-bold mb-4 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF416C] to-[#FF4B2B]">
                Entre em Contato
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] rounded-full"></div>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Tem dúvidas ou precisa de ajuda? Nossa equipe está pronta para atendê-lo.
            </p>
          </div>

          <div className="bg-[var(--primary-800)]/50 backdrop-blur-sm rounded-xl p-8 border border-[#FF416C]/20 shadow-lg">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="Seu nome completo" 
                    className={`w-full px-4 py-3 bg-[var(--primary-900)]/80 rounded-lg border ${errors.name ? 'border-red-500' : 'border-[var(--primary-700)]'} text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF416C] focus:border-transparent`}
                    {...register("name")}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="seu@email.com" 
                    className={`w-full px-4 py-3 bg-[var(--primary-900)]/80 rounded-lg border ${errors.email ? 'border-red-500' : 'border-[var(--primary-700)]'} text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-500)] focus:border-transparent`}
                    {...register("email")}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Assunto</label>
                <input 
                  type="text" 
                  id="subject" 
                  placeholder="Como podemos ajudar?" 
                  className={`w-full px-4 py-3 bg-[var(--primary-900)]/80 rounded-lg border ${errors.subject ? 'border-red-500' : 'border-[var(--primary-700)]'} text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-500)] focus:border-transparent`}
                  {...register("subject")}
                />
                {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Mensagem</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  placeholder="Detalhe sua solicitação..." 
                  className={`w-full px-4 py-3 bg-[var(--primary-900)]/80 rounded-lg border ${errors.message ? 'border-red-500' : 'border-[var(--primary-700)]'} text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-500)] focus:border-transparent resize-none`}
                  {...register("message")}
                ></textarea>
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
              </div>
              
              <div>
                <button 
                  type="submit"
                  className="w-full px-6 py-4 rounded-lg font-medium text-white flex items-center justify-center bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] hover:shadow-lg hover:shadow-[#FF416C]/40 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <span>Enviar Mensagem</span>
                      <i className="ri-send-plane-line ml-2"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
