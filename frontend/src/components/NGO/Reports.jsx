import { useState, useEffect, useRef } from "react";
import Axios from "../../config/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import ReportForm from "./ReportForm";
import { useUser } from "../../context/UserContext";
import ReportList from "./ReportsList";
import { FaUsers, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { Spin } from "antd";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedNeed, setSelectedNeed] = useState("");
  const [needs, setNeeds] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const formRef = useRef(null);

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
      const response = await Axios.get(`/donation/needsReports/${user._id}`, {
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
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleGenerateReport = (newReport) => {
    setReports([...reports, newReport]);
  };
  if (loading) {
    return (
      <div className="z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm w-full h-full">
        <Spin size="large" />
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
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      {needs
                        .filter(
                          (need) =>
                            need.isReportGenerated === false &&
                            // need.status === "Closed" &&
                            need.hasDonations === true
                        )
                        .map((need) => (
                          <label
                            key={need._id}
                            className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="need"
                              value={need._id}
                              checked={selectedNeed?._id === need._id}
                              onChange={() => handleNeedChange(need)}
                              className="accent-[#008080] w-5 h-5 mt-1 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-900">
                                  {need.title}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    need.status === "Open"
                                      ? "bg-green-100 text-green-800"
                                      : need.status === "Fulfilled"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {need.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <FaUsers className="mr-1 text-gray-400 text-xs" />
                                  <span>
                                    {need.beneficiaryInfo.numberOfBeneficiaries}{" "}
                                    beneficiaries
                                  </span>
                                </div>

                                <div className="flex items-center">
                                  <FaMapMarkerAlt className="mr-1 text-gray-400 text-xs" />
                                  <span>
                                    {
                                      need.beneficiaryInfo.location.address.split(
                                        ","
                                      )[0]
                                    }
                                  </span>
                                </div>

                                <div className="flex items-center">
                                  <FaCalendarAlt className="mr-1 text-gray-400 text-xs" />
                                  <span>
                                    Ends{" "}
                                    {new Date(
                                      need.endDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {need.needTypes.map((type) => (
                                  <span
                                    key={type}
                                    className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded-full"
                                  >
                                    {type.charAt(0).toUpperCase() +
                                      type.slice(1)}
                                  </span>
                                ))}
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    need.urgencyLevel === "High"
                                      ? "bg-red-100 text-red-800"
                                      : need.urgencyLevel === "Medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {need.urgencyLevel} urgency
                                </span>
                              </div>
                            </div>
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
                  <div ref={formRef}>
                    <ReportForm
                      selectedNeeds={selectedNeed}
                      onGenerate={handleGenerateReport}
                      clearSelection={() => setSelectedNeed("")}
                    />
                  </div>
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
