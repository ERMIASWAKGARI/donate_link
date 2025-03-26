import React, { useEffect } from 'react';
import { FaUserFriends, FaHandHoldingHeart, FaHandsHelping } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles

const ImpactSection = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with animation duration
  }, []);

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Our Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Number of Donors Helped */}
          <div
            className="flex flex-col items-center"
            data-aos="fade-up" // AOS fade-up animation for Donors Helped
          >
            <FaUserFriends className="text-green-600 text-5xl mb-4" />
            <h3 className="text-4xl font-bold text-gray-800">1,200+</h3>
            <p className="text-gray-600">Donors Helped</p>
          </div>

          {/* Total Donations Received */}
          <div
            className="flex flex-col items-center"
            data-aos="fade-up"
            data-aos-delay="100" // Delay for staggered animation
          >
            <FaHandHoldingHeart className="text-green-600 text-5xl mb-4" />
            <h3 className="text-4xl font-bold text-gray-800">$50K+</h3>
            <p className="text-gray-600">Donations Received</p>
          </div>

          {/* Number of NGOs Supported */}
          <div
            className="flex flex-col items-center"
            data-aos="fade-up"
            data-aos-delay="200" // Delay for staggered animation
          >
            <FaHandsHelping className="text-green-600 text-5xl mb-4" />
            <h3 className="text-4xl font-bold text-gray-800">30+</h3>
            <p className="text-gray-600">NGOs Supported</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
