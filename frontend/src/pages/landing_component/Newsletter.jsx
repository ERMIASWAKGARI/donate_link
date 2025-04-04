import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles

const Newsletter = () => {
  useEffect(() => {
    AOS.init({ duration: 1200 }); // Initialize AOS with a custom duration
  }, []);

  return (
    <section className="py-16 bg-gray-100" id="contact">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <h2
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-4"
            data-aos="fade-up" // Fade-up effect for the title
          >
            Stay Updated on Donation Opportunities
          </h2>
          <p
            className="text-gray-600 mb-6"
            data-aos="fade-up" // Fade-up effect for the paragraph
            data-aos-delay="200" // Delay for the paragraph to appear after the title
          >
            Subscribe to our newsletter and never miss a chance to make a
            difference.
          </p>
          <form className="flex flex-col md:flex-row justify-center items-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full md:w-96 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
              required
              data-aos="zoom-in" // Zoom-in effect for the input field
            />
            <button
              type="submit"
              className="bg-primary-button text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              data-aos="zoom-in" // Zoom-in effect for the button
              data-aos-delay="200" // Delay for the button to appear after the input field
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
