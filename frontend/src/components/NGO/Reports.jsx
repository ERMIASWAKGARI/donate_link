import { useState, useEffect } from "react";
import Axios from "../../config/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import ReportForm from "./ReportForm";
import { useUser } from "../../context/UserContext";
import ReportList from "./reportPreview";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedNeed, setSelectedNeed] = useState("");
  const [needs, setNeeds] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
      setNeeds(response.data.data || []);
      setTotalItems(response.data.total || 0);
      // eslint-disable-next-line no-unused-vars
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
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        📊 NGO Reports Dashboard
      </h1>

      {needs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle size={48} className="text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No needs available for report generation.
          </h2>
          <p className="text-gray-500 mb-4">
            You haven&apos;t created any needs yet that could generate reports.
          </p>
          <button
            onClick={() => fetchNeeds()}
            className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition"
          >
            Refresh Needs
          </button>
        </div>
      ) : (
        <>
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
                      {needs.map((need) => (
                        <label
                          key={need._id}
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
                          {need.title}
                        </label>
                      ))}
                    </div>
                  </>
                )}
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  <span className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-50 font-medium text-gray-700 shadow-sm">
                    Page <span className="text-blue-600">{currentPage}</span> of{" "}
                    <span className="text-blue-600">{totalPages}</span>
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
              </motion.div>
            )}

            {activeTab === "ourReports" && <ReportList />}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Reports;
