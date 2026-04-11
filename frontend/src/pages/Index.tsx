
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LiveAuctions from "@/components/LiveAuctions";
import Categories from "@/components/Categories";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <LiveAuctions />
        <Categories />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
