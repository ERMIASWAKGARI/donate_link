import { useState, useContext, useEffect } from "react";
import Axios from "../../config/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import ReportForm from "./ReportForm";
import { useUser } from "../../context/UserContext";
const Reports = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedNeed, setSelectedNeed] = useState("");
  const [needs, setNeeds] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchNeeds();
  }, [currentPage]);

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Axios.get(`/donation/ngo/${user._id}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      console.log("here is our response", response.data);
      setNeeds(response.data.data || []);
      setTotalItems(response.data.total || 0);
    } catch (err) {
      setError("Failed to fetch needs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNeedChange = (need) => {
    setSelectedNeed(need);
  };

  const handleGenerateReport = (newReport) => {
    setReports([...reports, newReport]);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        📊 NGO Reports Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {["generate", "ourReports"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
              activeTab === tab
                ? "bg-[#008080] text-white border-[#008080]"
                : "border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white"
            }`}
          >
            {tab === "generate" ? "Generate Report" : "Our Reports"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "generate" && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Generate a New Report
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading ? (
              <p className="text-gray-500">Loading needs...</p>
            ) : (
              <>
                <p className="mb-4 text-gray-500">Select one need:</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {needs.map((need, index) => (
                    <label
                      key={need._id} // Use the actual ID instead of index
                      className="flex items-center gap-2 text-gray-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="need"
                        value={need._id}
                        checked={selectedNeed?._id === need._id}
                        onChange={() => handleNeedChange(need)}
                        className="accent-[#008080] w-5 h-5"
                      />
                      {need.title}{" "}
                      {/* Render the title instead of the whole object */}
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-l-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-1 border-t border-b bg-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-r-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            {selectedNeed && (
              <ReportForm
                selectedNeeds={selectedNeed}
                onGenerate={handleGenerateReport}
                clearSelection={() => setSelectedNeed("")}
              />
            )}

            {/* Pagination */}
          </motion.div>
        )}

        {activeTab === "ourReports" && (
          <motion.div
            key="ourReports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Our Reports
            </h2>

            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: report.id * 0.05 }}
                  >
                    <CheckCircle className="text-green-500 w-5 h-5" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Report for{" "}
                        <span className="text-blue-600">{report.need}</span>
                      </p>
                      <p className="text-gray-500 text-sm">
                        Generated on {report.date}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reports generated yet.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
