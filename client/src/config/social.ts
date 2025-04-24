/**
 * Configurações de redes sociais e contato
 * Os valores são carregados a partir das variáveis de ambiente ou valores padrão
 */

// Função para obter variáveis de ambiente (client-side)
const getEnvVariable = (key: string, defaultValue: string): string => {
  // O import.meta.env só está disponível durante o build
  return (import.meta.env?.[key] as string) || defaultValue;
};

// Redes sociais
export const WHATSAPP_URL = getEnvVariable('VITE_WHATSAPP_URL', 'https://wa.me/5512991234567');
export const INSTAGRAM_URL = getEnvVariable('VITE_INSTAGRAM_URL', 'https://instagram.com/unitmedia');
export const FACEBOOK_URL = getEnvVariable('VITE_FACEBOOK_URL', 'https://facebook.com/unitmedia');
export const LINKEDIN_URL = getEnvVariable('VITE_LINKEDIN_URL', 'https://linkedin.com/company/unitmedia');
export const TWITTER_URL = getEnvVariable('VITE_TWITTER_URL', 'https://twitter.com/unitmedia');

// Contato
export const CONTACT_EMAIL = getEnvVariable('VITE_CONTACT_EMAIL', 'contato@unitmedia.cloud');
export const CONTACT_PHONE = getEnvVariable('VITE_CONTACT_PHONE', '+55 12 3456-7890');

// Objeto com todas as redes sociais para fácil acesso
export const socialLinks = {
  whatsapp: WHATSAPP_URL,
  instagram: INSTAGRAM_URL,
  facebook: FACEBOOK_URL,
  linkedin: LINKEDIN_URL,
  twitter: TWITTER_URL
};

// Objeto com informações de contato
export const contactInfo = {
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE
};

export default {
  socialLinks,
  contactInfo
};