import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import Newsletter from "./landing_component/Newsletter";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800); // Simulate loading delay
    return () => clearTimeout(timer);
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I donate money through the platform?",
      answer:
        "You can donate money by selecting an NGO's need from the donation page, entering the amount you wish to contribute, and completing the secure payment process through our integrated payment gateway.",
    },
    {
      question: "What types of items can I donate?",
      answer:
        "You can donate various essential items including food, clothing, medical supplies, school materials, and other necessities. NGOs post specific needs that you can browse on our platform.",
    },
    {
      question: "How can I verify that an NGO is legitimate?",
      answer:
        "All NGOs on our platform undergo a rigorous verification process by our administrators. You can view their verification status and registration documents on their profile page.",
    },
    {
      question: "Can I track how my donation is being used?",
      answer:
        "Yes, our platform provides real-time tracking of donations. You'll receive updates on when your donation is received and how it's being utilized by the NGO.",
    },
    {
      question: "How do I volunteer through this platform?",
      answer:
        "You can register as a volunteer, specify your skills and availability, and browse opportunities posted by NGOs. When you find a suitable opportunity, you can apply directly through the platform.",
    },
    {
      question: "Is there a fee for using this platform?",
      answer:
        "No, our platform is completely free for donors and volunteers. NGOs may pay a small service fee for certain premium features.",
    },
    {
      question: "What languages does the platform support?",
      answer:
        "Currently, we support English, Amharic, and Afan Oromo. You can change the language preference in your account settings.",
    },
    {
      question: "How do I report an issue or get help?",
      answer:
        "You can contact our support team through the 'Contact Us' page or email us directly at support@donationplatform.org. We typically respond within 24 hours.",
    },
  ];

  if (loading) {
    return (
      <div className="z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm w-full h-full fixed top-0 left-0">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 hover:text-teal-700 font-medium flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600">
          Find answers to common questions about donating, volunteering, and
          using our platform
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300"
          >
            <button
              className={`w-full px-6 py-4 text-left flex justify-between items-center ${
                activeIndex === index ? "bg-teal-50" : "bg-white"
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <span className="text-lg font-medium text-gray-800">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-teal-600 transform transition-transform duration-300 ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              className={`px-6 py-4 bg-white transition-all duration-300 ease-in-out overflow-hidden ${
                activeIndex === index
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">Still have questions?</p>
        <button
          onClick={() => setShowSupport(!showSupport)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
        >
          {showSupport ? "Hide Support" : "Contact Support"}
        </button>
      </div>

      {showSupport && (
        <div className="mt-8 bg-gray-50 border border-teal-200 rounded-lg p-6 shadow-md relative">
          <button
            onClick={() => setShowSupport(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Close support form"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <Newsletter />
        </div>
      )}
    </div>
  );
};

export default FAQ;
