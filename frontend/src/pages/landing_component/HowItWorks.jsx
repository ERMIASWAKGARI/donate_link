import React, { useEffect } from "react";
import { FaUserPlus, FaGift, FaBuilding, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const HowItWorksSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren",
      },
    },
  };

  const item = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const iconHover = {
    scale: 1.1,
    rotate: 5,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  };

  const steps = [
    {
      icon: <FaUserPlus className="text-3xl" />,
      title: "Sign Up",
      description: "Create your donor account and get started in minutes.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaGift className="text-3xl" />,
      title: "Choose Items",
      description: "Select from various donation options or specific items.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaBuilding className="text-3xl" />,
      title: "Select an NGO",
      description: "Pick a trusted organization that aligns with your values.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "Track Impact",
      description:
        "Receive updates on how your contribution makes a difference.",
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            How <span className="text-[#008080]">It Works</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our simple 4-step process makes donating easy and impactful
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={item}
              className="flex flex-col items-center p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Animated Number */}
              <div className="relative mb-6">
                <div
                  className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center text-2xl font-bold absolute -top-12 left-1/2 transform -translate-x-1/2`}
                >
                  {index + 1}
                </div>
              </div>

              {/* Icon */}
              <motion.div
                whileHover={iconHover}
                className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {step.icon}
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-center text-gray-600 mb-6">
                {step.description}
              </p>

              {/* Animated Arrow (except last item) */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <svg
                    className="w-8 h-8 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#16a34a" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-primary text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
