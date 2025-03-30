import React from "react";
import { motion } from "framer-motion";

const CTA = () => {
  // Animation variants
  const containerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const buttonHover = {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const buttonTap = {
    scale: 0.95
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-1 px-6 shadow-lg z-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Text Content */}
        <motion.div 
          className="mb-4 md:mb-0 text-center md:text-left"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-xl md:text-2xl font-bold mb-1"
            whileHover={{ scale: 1.02 }}
          >
            Make a Difference Today!
          </motion.h2>
          <motion.p 
            className="text-sm md:text-base text-green-100"
            whileHover={{ scale: 1.01 }}
          >
            Your support can change lives. Start contributing now.
          </motion.p>
        </motion.div>

        {/* Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          variants={containerVariants}
        >
          <motion.button
            className="bg-yellow-400 text-green-900 font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg"
            variants={itemVariants}
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            Join as a Donor
          </motion.button>
          <motion.button
            className="bg-white text-green-700 border border-green-500 font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg"
            variants={itemVariants}
            whileHover={{
              ...buttonHover,
              backgroundColor: "#f0fdf4" // green-50
            }}
            whileTap={buttonTap}
          >
            Become a Volunteer
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div 
        className="absolute top-0 left-0 w-16 h-16 bg-yellow-400 rounded-full -translate-x-8 -translate-y-8 opacity-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-12 h-12 bg-yellow-400 rounded-full translate-x-6 translate-y-6 opacity-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      />
    </motion.div>
  );
};

export default CTA;