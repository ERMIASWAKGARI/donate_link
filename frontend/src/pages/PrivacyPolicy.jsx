import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiShield,
  FiLock,
  FiDatabase,
  FiUser,
  FiMail,
  FiCreditCard,
} from "react-icons/fi";
import { Spin } from "antd";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("data-collection");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // simulate loading delay
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    {
      id: "data-collection",
      title: "Data Collection",
      icon: <FiDatabase className="mr-2" />,
      content: (
        <>
          <p className="mb-4">
            We collect information to provide better services to all our users.
            The types of information we collect include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Personal Information:</strong> When you register as a
              donor, NGO, or volunteer, we collect your name, email address,
              phone number, and other contact details.
            </li>
            <li>
              <strong>Payment Information:</strong> For monetary donations, we
              process payment information through secure third-party payment
              gateways (Chappa API). We do not store full credit card details on
              our servers.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect information about how you
              interact with our platform, including pages visited and features
              used.
            </li>
            <li>
              <strong>Cookies:</strong> We use cookies to improve your
              experience and analyze platform usage.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "data-use",
      title: "Data Use",
      icon: <FiUser className="mr-2" />,
      content: (
        <>
          <p className="mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>
              To allow you to participate in interactive features of our service
            </li>
            <li>To provide customer support</li>
            <li>
              To gather analysis or valuable information so that we can improve
              our service
            </li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>
              To facilitate communication between donors, NGOs, and volunteers
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "data-sharing",
      title: "Data Sharing",
      icon: <FiMail className="mr-2" />,
      content: (
        <>
          <p className="mb-4">
            We may share your information in the following situations:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>With NGOs:</strong> When you donate to an NGO, we share
              necessary information (name, contact details) to facilitate the
              donation process.
            </li>
            <li>
              <strong>With Volunteers:</strong> When you apply for volunteer
              opportunities, relevant information is shared with the requesting
              NGO.
            </li>
            <li>
              <strong>Service Providers:</strong> We may employ third-party
              companies to facilitate our service, provide the service on our
              behalf, or assist us in analyzing how our service is used.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose your
              information if required to do so by law or in response to valid
              requests by public authorities.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <FiLock className="mr-2" />,
      content: (
        <>
          <p className="mb-4">
            The security of your data is important to us. We implement
            appropriate technical and organizational measures to protect
            personal data against unauthorized or unlawful processing,
            accidental loss, destruction, or damage.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>All data is encrypted in transit using SSL/TLS protocols</li>
            <li>Sensitive data is encrypted at rest</li>
            <li>
              We implement role-based access control to limit who can access
              your information
            </li>
            <li>
              Regular security audits are conducted to identify and address
              vulnerabilities
            </li>
            <li>
              Payment processing is handled by secure third-party providers
              (Chappa API)
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: <FiShield className="mr-2" />,
      content: (
        <>
          <p className="mb-4">
            You have certain rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Access:</strong> You can request copies of your personal
              data.
            </li>
            <li>
              <strong>Rectification:</strong> You can request that we correct
              any information you believe is inaccurate.
            </li>
            <li>
              <strong>Erasure:</strong> You can request that we erase your
              personal data, under certain conditions.
            </li>
            <li>
              <strong>Restriction:</strong> You can request that we restrict the
              processing of your personal data, under certain conditions.
            </li>
            <li>
              <strong>Objection:</strong> You can object to our processing of
              your personal data, under certain conditions.
            </li>
            <li>
              <strong>Data Portability:</strong> You can request that we
              transfer the data we have collected to another organization, or
              directly to you, under certain conditions.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at
            privacy@donationplatform.org.
          </p>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      icon: <FiCreditCard className="mr-2" />,
      content: (
        <>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the <strong> Last Updated</strong> date.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading Privacy Policy..." />
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
        <div className="flex justify-center mb-4">
          <FiShield className="w-12 h-12 text-teal-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-600">
          Last Updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="mb-8">
        <p className="text-gray-700 mb-4">
          At Online Donation Platform Through NGOs, we take your privacy
          seriously. This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you use our platform.
        </p>
        <p className="text-gray-700">
          By using our service, you agree to the collection and use of
          information in accordance with this policy.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-1/4">
          <div className="sticky top-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">
                Policy Sections
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                      activeSection === section.id
                        ? "bg-teal-50 text-teal-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {section.icon}
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className={`${
                  activeSection === section.id ? "block" : "hidden"
                }`}
              >
                <div className="flex items-center mb-4">
                  {section.icon}
                  <h2 className="text-xl font-semibold text-gray-800">
                    {section.title}
                  </h2>
                </div>
                <div className="text-gray-700">{section.content}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Contact Us
            </h3>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-teal-600 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Email: privacy@donationplatform.org</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-teal-600 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Phone: +251 123 456 789</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-teal-600 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  Address: Jimma Institute of Technology, Faculty of Computing
                  and Informatics, Jimma, Ethiopia
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
