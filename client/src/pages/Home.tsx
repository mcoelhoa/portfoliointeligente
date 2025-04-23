import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AgentSection from "@/components/AgentSection";
import FeaturesSection from "@/components/FeaturesSection";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--primary-900)] text-white">
      <Header />
      <Hero />
      <AgentSection />
      <FeaturesSection />
      <CallToAction />
      <Footer />
    </div>
  );
}
