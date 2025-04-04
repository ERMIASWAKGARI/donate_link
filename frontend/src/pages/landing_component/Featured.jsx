import React, { useEffect } from "react";
import water from "../../assets/Water to Remote.jpg";
import education from "../../assets/charity-education.jpg";
import food from "../../assets/food.jpg";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";

const featuredCauses = [
  {
    id: 1,
    title: "Help Build Schools",
    description:
      "Support building schools for underprivileged children to give them access to quality education and a brighter future.",
    image: education,
    raised: 12500,
    goal: 30000,
  },
  {
    id: 2,
    title: "Provide Clean Water",
    description:
      "Help bring clean drinking water to remote communities, reducing waterborne diseases and improving quality of life.",
    image: water,
    raised: 18500,
    goal: 25000,
  },
  {
    id: 3,
    title: "Feed the Hungry",
    description:
      "Contribute to providing nutritious meals for homeless families and children facing food insecurity.",
    image: food,
    raised: 22000,
    goal: 40000,
  },
];

const FeaturedCauses = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: {
        duration: 1.5,
        delay: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
      id="featured"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our <span className="text-primary">Featured Causes</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            Join us in making a difference. Each contribution brings us closer
            to our goals.
          </p>
        </motion.div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredCauses.map((cause) => (
            <motion.div
              key={cause.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group"
              data-aos="fade-up"
              data-aos-delay={cause.id * 100}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden h-60">
                <motion.img
                  src={cause.image}
                  alt={cause.title}
                  className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                    {Math.round((cause.raised / cause.goal) * 100)}% Funded
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {cause.title}
                </h3>
                <p className="text-gray-600 mb-5">{cause.description}</p>

                {/* Progress Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>${cause.raised.toLocaleString()} raised</span>
                    <span>${cause.goal.toLocaleString()} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(cause.raised / cause.goal) * 100}%` }}
                      initial="hidden"
                      whileInView="visible"
                      variants={progressVariants}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "yellow-800" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-yellow-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Donate Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="px-8 py-3 border-2 border-[#008080] text-[#008080] font-medium rounded-full hover:bg-teal-600 hover:text-white transition-all duration-300">
            View All Causes
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCauses;
