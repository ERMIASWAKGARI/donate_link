import { useEffect, useState } from "react";
import {
  Download,
  // FileText,
  ArrowLeft,
  Award,
  Trophy,
  HeartHandshake,
} from "lucide-react";
import Header from "../../components/header/Header";
import axios from "axios";
import logo from "../../assets/logosa.png"; // Import your logo

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [progress, setProgress] = useState({
    donations: { current: 0, remaining: 5 },
    volunteering: { current: 0, remaining: 3 },
  });
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = "http://localhost:5000"; // or your production URL

  // Get access token from localStorage
  const getAccessToken = () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }
      return token;
    } catch (err) {
      console.error("Error getting access token:", err);
      return null;
    }
  };

  // Fetch certificates and progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getAccessToken();
        if (!token) {
          throw new Error("User not authenticated");
        }

        console.log("Fetching certificates with token:", token);

        const { data } = await axios.get(`${API_BASE_URL}/api/certificate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", data);

        // Handle API response structure
        if (data && data.status === "success" && data.message) {
          setCertificates(data.message.certificates || []);
          setProgress({
            donations: data.message.progress?.donations || {
              current: 0,
              remaining: 5,
            },
            volunteering: data.message.progress?.volunteering || {
              current: 0,
              remaining: 3,
            },
          });
          console.log("Data successfully set");
        } else {
          throw new Error(data?.message || "Invalid API response structure");
        }
      } catch (err) {
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          stack: err.stack,
        });
        setError(err.message || "Failed to load certificates");
        setCertificates([]);
        setProgress({
          donations: { current: 0, remaining: 5 },
          volunteering: { current: 0, remaining: 3 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async (certId) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      console.log("Downloading certificate:", certId);
      const response = await axios.get(
        `${API_BASE_URL}/api/certificate/download/${certId}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.log("Download successful");
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderProgressBar = (current, threshold) => {
    const percentage = Math.min(100, (current / threshold) * 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-teal-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Error Loading Certificates
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-full z-1010 bg-white shadow-md">
        <Header />
      </div>

      <div className="min-h-screen bg-gray-50 p-6 pt-24">
        {selectedCert ? (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <button
              onClick={() => setSelectedCert(null)}
              className="flex items-center gap-2 pb-2 p-4 text-teal-600 hover:text-teal-800"
            >
              <ArrowLeft size={18} /> Back
            </button>

            <div className="pt-2 p-8">
              <div className="relative border-2 border-teal-100 p-8 rounded-lg bg-gradient-to-br from-teal-50 to-white text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-teal-300"></div>

                {/* Logo added here */}
                <div className="absolute top-4 left-4">
                  <img
                    src={logo}
                    alt="System Logo"
                    className="h-16 object-contain"
                  />
                </div>

                <div className="absolute bottom-0 right-0 opacity-10">
                  {selectedCert.type === "volunteering" ? (
                    <HeartHandshake size={120} className="text-teal-400" />
                  ) : (
                    <Award size={120} className="text-teal-400" />
                  )}
                </div>

                <div className="relative z-10">
                  <div className="mb-6 pt-8">
                    {" "}
                    {/* Added pt-8 to account for logo space */}
                    <h1 className="text-3xl font-bold text-teal-800 mb-2">
                      {selectedCert.title ||
                        (selectedCert.type === "volunteering"
                          ? "Certificate of Volunteer Excellence"
                          : "Certificate of Generosity")}
                    </h1>
                    <div className="w-24 h-1 bg-teal-200 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 mb-6">
                      This certificate is proudly presented to
                    </p>{" "}
                    {/* Updated text */}
                  </div>

                  <h2 className="text-4xl font-semibold text-gray-900 mb-8">
                    {selectedCert.user?.name
                      ? capitalizeWords(selectedCert.user.name)
                      : "Recipient"}
                  </h2>

                  <div className="my-8 px-4 sm:px-12">
                    <p className="text-gray-700 text-lg">
                      For outstanding contributions to our community
                    </p>
                    <p className="text-gray-700 text-lg">
                      In recognition of{" "}
                      <span className="font-bold text-teal-600">
                        {selectedCert.participationCount}
                      </span>{" "}
                      {selectedCert.type === "donation"
                        ? "generous donations"
                        : "volunteer activities"}{" "}
                      completed
                    </p>
                    {selectedCert.type === "volunteering" && (
                      <p className="text-gray-600">
                        With gratitude for your service.
                      </p>
                    )}
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {" "}
                    <div className="mt-8 pt-4 border-t border-teal-100">
                      <p className="text-sm text-gray-500">
                        DonateLink Excellence Foundation
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Certificate ID: {selectedCert._id}
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-sm text-gray-500">Issued on</p>
                      <p className="text-gray-700">
                        {new Date(selectedCert.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4 justify-center">
                <button
                  onClick={() => handleDownload(selectedCert._id)}
                  className="border border-gray-300 text-gray-500 gap-2 px-4 py-2.5 rounded-lg hover:bg-teal-600 hover:text-white transition-colors flex items-center"
                >
                  <Download size={18} /> Download Certificate
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              My Certificates
            </h1>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Your Progress
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Volunteering</span>
                    <span className="font-medium">
                      {progress.volunteering.current}/
                      {progress.volunteering.threshold || 3}
                    </span>
                  </div>
                  {renderProgressBar(
                    progress.volunteering.current,
                    progress.volunteering.threshold || 3
                  )}
                  {progress.volunteering.remaining > 0 ? (
                    <p className="text-sm text-teal-600 mt-1">
                      {progress.volunteering.remaining} more volunteer{" "}
                      {progress.volunteering.remaining === 1
                        ? "activity"
                        : "activities"}{" "}
                      needed
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 mt-1">
                      You have reached the volunteering threshold!
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Donations</span>
                    <span className="font-medium">
                      {progress.donations.current}/
                      {progress.donations.threshold || 5}
                    </span>
                  </div>
                  {renderProgressBar(
                    progress.donations.current,
                    progress.donations.threshold || 5
                  )}
                  {progress.donations.remaining > 0 ? (
                    <p className="text-sm text-teal-600 mt-1">
                      {progress.donations.remaining} more{" "}
                      {progress.donations.remaining === 1
                        ? "donation"
                        : "donations"}{" "}
                      needed
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 mt-1">
                      You have reached the donation threshold!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Award size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No certificates earned yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete more activities to unlock certificates
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    onClick={() => setSelectedCert(cert)}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer border-l-4 border-teal-500 flex items-center gap-4"
                  >
                    <div className="bg-teal-100 p-3 rounded-full">
                      {cert.type === "volunteering" ? (
                        <HeartHandshake size={24} className="text-teal-600" />
                      ) : (
                        <Award size={24} className="text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {cert.type === "volunteering"
                          ? "Volunteer Certificate"
                          : "Donation Certificate"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Earned on {new Date(cert.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Activities</p>
                      <p className="font-medium">{cert.participationCount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
