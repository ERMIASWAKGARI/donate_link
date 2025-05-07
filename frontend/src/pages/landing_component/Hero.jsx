import { motion } from "framer-motion";
import pic from "../../../src/assets/Background_image.jpg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 20,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div
      className="relative w-full h-[85vh] flex items-center justify-center bg-gray-100 z-10 overflow-hidden"
      id="hero"
    >
      {/* Background Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={pic}
          alt="Happy children"
          className="w-full h-full object-cover"
        />
        <motion.div
          className="absolute inset-0 bg-black opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.2 }}
        />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-yellow-400 rounded-full"
            style={{
              width: Math.random() * 10 + 5 + "px",
              height: Math.random() * 10 + 5 + "px",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -Math.random() * 40],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="absolute left-0 top-0 z-10 bg-white 
          rounded-tr-[80%] rounded-br-[80%] md:w-[55%] w-[90%] h-full 
          p-8 md:p-12 shadow-2xl flex flex-col justify-center 
          bg-gradient-to-br from-white to-gray-50
          border-l-4 border-yellow-400"
      >
        <motion.h3
          variants={childVariants}
          className="text-teal-500 uppercase font-bold tracking-widest 
          text-sm md:text-base font-serif drop-shadow-sm"
        >
          Give Hope For Homeless
        </motion.h3>

        <motion.h1
          variants={childVariants}
          className="text-3xl md:text-5xl font-extrabold mt-2 leading-tight 
          text-gray-800 font-serif bg-gradient-to-r from-gray-800 to-gray-600 
          bg-clip-text text-transparent"
        >
          Donate For A <span className="text-yellow-500">Better World</span>
        </motion.h1>

        <motion.p
          variants={childVariants}
          className="text-gray-600 mt-4 leading-relaxed md:text-lg text-base 
          font-sans tracking-wide max-w-[90%]"
        >
          Explore the variety of volunteer opportunities available. From event
          planning and fundraising to fieldwork and administrative support.
        </motion.p>

        <motion.div variants={childVariants} className="mt-6 flex gap-4">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(234, 179, 8, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 
            text-white font-semibold rounded-full shadow-lg 
            transition-all duration-300 ease-in-out 
            font-sans tracking-wide text-sm md:text-base"
            onClick={() => navigate("/register")}
          >
            Donate Now
          </motion.button>

          <a href="#featured">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-transparent border-2 border-teal-500 
            text-teal-600 hover:bg-teal-50 font-semibold rounded-full 
            transition-all duration-300 ease-in-out 
            font-sans tracking-wide text-sm md:text-base"
              id="featured"
            >
              Learn More
            </motion.button>
          </a>
        </motion.div>
      </motion.div>

      {/* Floating CTA */}
      <motion.div
        className="absolute bottom-6 right-6 z-20"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <button
          className="px-5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white 
          rounded-full shadow-lg flex items-center gap-2 transition-all text-sm"
          onClick={() => navigate("/register")}
        >
          <span>Join Volunteers</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </motion.div>
    </div>
  );
};

export default Hero;
