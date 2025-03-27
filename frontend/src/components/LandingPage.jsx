import { Link } from "react-router-dom";
import Hero from "../pages/landing_component/Hero";
import About from "../pages/landing_component/About";
import ImpactSection from "../pages/landing_component/ImpactSection";
import HowItWorksSection from "../pages/landing_component/HowItWorks";
import FeaturedCauses from "../pages/landing_component/Featured";
import Testimonials from "../pages/landing_component/Testimonials";
import CTA from "../pages/landing_component/CTA";
import Newsletter from "../pages/landing_component/Newsletter";
import Header from "./common/Header";
import Footer from "./common/Footer";

function LandingPage() {
  return (

    <div>
      <Hero/>
      <FeaturedCauses/>
      <HowItWorksSection/>
      <ImpactSection/>
      <About/>
      <Testimonials/>
      <Newsletter/>
      <CTA/>
    </div>
  );
}

export default LandingPage;
