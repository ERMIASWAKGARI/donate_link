import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // const socialIconVariants = {
  //   hover: {
  //     y: -5,
  //     scale: 1.2,
  //     color: "#facc15", // yellow-400
  //     transition: {
  //       type: "spring",
  //       stiffness: 400,
  //       damping: 10,
  //     },
  //   },
  // };

  const quickLinks = [
    { href: "#header", text: "Home" },
    { href: "#featured", text: "Featured Causes" },
    { href: "#about", text: "About Us" },
    { href: "/donations", text: "Donations" },
  ];

  const legalLinks = [
    { href: "/privacy-policy", text: "Privacy Policy" },
    { href: "/terms-of-service", text: "Terms of Service" },
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, href: "#" },
    { icon: <FaTwitter />, href: "#" },
    { icon: <FaInstagram />, href: "#" },
    { icon: <FaLinkedin />, href: "#" },
    { icon: <FaYoutube />, href: "#" },
  ];

  return (
    <motion.footer
      className="bg-green-800 text-white py-12  relative z-20"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="container mx-auto px-4 pb-12 sm:px-6 lg:px-8 bottom-22">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          {/* Quick Links */}
          <motion.div
            className="flex flex-wrap justify-center gap-6"
            variants={containerVariants}
          >
            {quickLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                className="hover:text-yellow-400 transition relative group"
                variants={itemVariants}
                whileHover={{ color: "#facc15" }}
              >
                {link.text}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                />
              </motion.a>
            ))}
          </motion.div>

          {/* Social Media Links */}
          <motion.div className="flex space-x-6" variants={containerVariants}>
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl"
                variants={itemVariants}
                whileHover="hover"
                // variants={socialIconVariants}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>

          {/* Legal Links */}
          <motion.div
            className="flex flex-wrap justify-center gap-6"
            variants={containerVariants}
          >
            {legalLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                className="hover:text-yellow-400 transition relative group"
                variants={itemVariants}
                whileHover={{ color: "#facc15" }}
              >
                {link.text}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                />
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          className="w-full h-px bg-green-700 my-6"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />

        {/* Copyright */}
        <motion.div
          className="text-center text-sm text-gray-300"
          variants={itemVariants}
        >
          © {new Date().getFullYear()} DonatiLink. All rights reserved.
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute bottom-4 right-4 w-8 h-8 border-2 border-yellow-400 rounded-full"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.3, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
        />
        <motion.div
          className="absolute top-8 left-8 w-6 h-6 border-2 border-yellow-400 rounded-full"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.3, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          viewport={{ once: true }}
        />
      </div>
    </motion.footer>
  );
};

export default Footer;
