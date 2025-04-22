import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import About from "../pages/landing_component/About";
import CTA from "../pages/landing_component/CTA";
import FeaturedCauses from "../pages/landing_component/Featured";
import Hero from "../pages/landing_component/Hero";
import HowItWorksSection from "../pages/landing_component/HowItWorks";
import ImpactSection from "../pages/landing_component/ImpactSection";
import Newsletter from "../pages/landing_component/Newsletter";
import Testimonials from "../pages/landing_component/Testimonials";

function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <FeaturedCauses />
      <HowItWorksSection />
      <ImpactSection />
      <About />
      <Testimonials />
      <Newsletter />
      <Footer />
      <CTA />
    </div>
  );
}

export default LandingPage;
