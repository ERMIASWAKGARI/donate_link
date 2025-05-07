import { useEffect, useState } from 'react';
import { FaCheckCircle, FaGavel, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

const TermsOfService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulate a brief loading delay (e.g., 500ms)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm w-full h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
      {/* Back Button */}
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

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-600">
          Please read our terms carefully before using our platform.
        </p>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8">
        {/* 1. Acceptance */}
        <div>
          <h2 className="flex items-center text-2xl font-semibold mb-2">
            <FaCheckCircle className="text-teal-600 mr-2" />
            Acceptance of Terms
          </h2>
          <p className="text-gray-600">
            By accessing or using our donation platform, you agree to comply
            with and be bound by these Terms of Service. If you do not agree
            with these terms, please do not use the platform.
          </p>
        </div>

        {/* 2. User Responsibilities */}
        <div>
          <h2 className="flex items-center text-2xl font-semibold mb-2">
            <FaUsers className="text-teal-600 mr-2" />
            User Responsibilities
          </h2>
          <p className="text-gray-600">
            Users are responsible for providing accurate information and using
            the platform ethically. Donations must be made in good faith. Any
            misuse, fraud, or abuse will lead to account termination.
          </p>
        </div>

        {/* 3. NGO Obligations */}
        <div>
          <h2 className="flex items-center text-2xl font-semibold mb-2">
            <FaShieldAlt className="text-teal-600 mr-2" />
            NGO and Vendor Responsibilities
          </h2>
          <p className="text-gray-600">
            NGOs and vendors must provide truthful information, verify their
            legitimacy with documentation, and fulfill their obligations
            transparently. They must use donations for the intended purposes as
            specified.
          </p>
        </div>

        {/* 4. Intellectual Property */}
        <div>
          <h2 className="flex items-center text-2xl font-semibold mb-2">
            <FaGavel className="text-teal-600 mr-2" />
            Intellectual Property
          </h2>
          <p className="text-gray-600">
            All content, logos, trademarks, and designs are owned by the
            platform and protected under copyright laws. Users may not copy or
            reuse platform content without permission.
          </p>
        </div>

        {/* 5. Limitation of Liability */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Limitation of Liability
          </h2>
          <p className="text-gray-600">
            The platform is not liable for the actions of any third-party NGO or
            donor. While we ensure verification and transparency, we are not
            responsible for misuse by any user or organization.
          </p>
        </div>

        {/* 6. Modifications */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Changes to the Terms</h2>
          <p className="text-gray-600">
            We reserve the right to update or modify these terms at any time.
            Users will be notified via email or platform alerts. Continued use
            of the platform after updates implies agreement to the new terms.
          </p>
        </div>

        {/* 7. Governing Law */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Governing Law</h2>
          <p className="text-gray-600">
            These terms are governed by and construed in accordance with the
            laws of Ethiopia. Any disputes will be subject to the jurisdiction
            of local courts.
          </p>
        </div>
      </div>

      {/* Acknowledgment */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          By using this platform, you agree to our Terms of Service.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default TermsOfService;
