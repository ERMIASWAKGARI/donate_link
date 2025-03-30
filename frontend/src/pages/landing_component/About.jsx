import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import aboutImage from '../../assets/about.jpg'
const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with animation duration
  }, []);

  return (
    <div id="about">
      <section className="bg-gray-100 py-16 px-4 md:px-8">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div
            className="relative"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <img
              src={aboutImage} // Replace with your actual image path
              alt="Team helping community"
              className="w-full h-[400px] object-cover rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black opacity-20 rounded-lg"></div>
          </div>

          {/* Right Side - Content */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              About <span className="text-yellow-500">Our Mission</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our goal is to create a platform where generosity meets impact. We
              strive to connect donors with those in need through trusted NGOs,
              ensuring transparency and efficiency in every donation.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              By working together, we can make a meaningful difference in the
              lives of those less fortunate. Your support empowers us to deliver
              essentials and bring hope to communities worldwide.
            </p>
            <button className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-full transition duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;