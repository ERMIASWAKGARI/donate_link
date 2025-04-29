import { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import { Download, FileText, ImageIcon, ArrowLeft } from "lucide-react";
import Header from "../../components/header/Header";

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  //   const navigate = useNavigate();

  // Fetch certificates (mock data for now)
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        // Replace with actual API call: axios.get('/api/certificates')
        const mockCerts = [
          {
            id: "1",
            title: "Certificate of Generosity",
            type: "donation",
            issuedAt: "2023-11-15",
            participationCount: 5,
            userName: "John Doe",
            downloadUrl: "#",
          },
          {
            id: "2",
            title: "Volunteer Excellence Award",
            type: "volunteering",
            issuedAt: "2023-10-20",
            participationCount: 3,
            userName: "John Doe",
            downloadUrl: "#",
          },
        ];
        setCertificates(mockCerts);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    };
    fetchCertificates();
  }, []);

  const handleDownload = (format = "pdf") => {
    if (!selectedCert) return;
    alert(`Downloading as ${format.toUpperCase()}`); // Replace with actual download logic
  };

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-full z-1010 bg-white shadow-md">
        <Header />
      </div>
      <div className="min-h-screen bg-gray-50 p-6">
        {selectedCert ? (
          // Certificate Detail View
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <button
              onClick={() => setSelectedCert(null)}
              className="flex items-center gap-2 p-4 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={18} /> Back to all certificates
            </button>

            <div className="p-8">
              {/* Certificate Design (Tailwind) */}
              <div className="border-2 border-gold-500 p-8 rounded-lg bg-gradient-to-br from-blue-50 to-white text-center">
                <h1 className="text-3xl font-bold text-blue-800 mb-2">
                  {selectedCert.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">Awarded to</p>
                <h2 className="text-4xl font-semibold text-gray-900 mb-8">
                  {selectedCert.userName}
                </h2>
                <p className="text-gray-700 mb-2">
                  For{" "}
                  {selectedCert.type === "donation"
                    ? "generous contributions"
                    : "dedicated volunteer service"}
                </p>
                <p className="text-gray-500">
                  Completed {selectedCert.participationCount}{" "}
                  {selectedCert.type === "donation"
                    ? "donations"
                    : "volunteer activities"}
                </p>
                <div className="mt-8 text-sm text-gray-400">
                  Issued on{" "}
                  {new Date(selectedCert.issuedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Download Options */}
              <div className="mt-8 flex gap-4 justify-center">
                <button
                  onClick={() => handleDownload("pdf")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <FileText size={18} /> Download PDF
                </button>
                <button
                  onClick={() => handleDownload("png")}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  <ImageIcon size={18} /> Download Image
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Certificate List View
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              My Certificates
            </h1>

            {certificates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No certificates earned yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete more donations or volunteer activities to earn
                  certificates
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => setSelectedCert(cert)}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer border-l-4 border-blue-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {cert.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {cert.type === "donation" ? "Donation" : "Volunteer"}{" "}
                          Certificate
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {cert.participationCount}+
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Download size={16} /> View
                      </button>
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
