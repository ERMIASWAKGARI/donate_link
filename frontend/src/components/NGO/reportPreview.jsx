import Axios from "../../config/axiosConfig";
import { useEffect, useState } from "react";
import {
  FaImages,
  FaChartLine,
  FaUsers,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaBoxes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ReportList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Axios.get(`donation/reports`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setReports(response.data.data || []);
      setTotalItems(response.data.total || 0);
    } catch (err) {
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setShowPreview(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-blue-50 rounded-full p-4 mb-4">
          <FaChartLine className="text-blue-600 text-3xl" />
        </div>
        <h2 className="text-3xl font-bold text-blue-600 mb-2">
          Impact Reports
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track and visualize the impact of your organization's work through
          detailed reports
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading reports
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <button
                onClick={fetchReports}
                className="mt-3 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && !error && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No reports available
          </h4>
          <p className="text-gray-500 mb-6">
            You haven't submitted any impact reports yet.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">
            Create New Report
          </button>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <motion.div
            key={report._id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100"
            whileHover={{ y: -5 }}
          >
            {report.pictures && report.pictures.length > 0 && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={report.pictures[0]}
                  alt="Report cover"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => openReportDetails(report)}
                />
                {report.pictures.length > 1 && (
                  <span className="absolute top-3 right-3 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center backdrop-blur-sm">
                    <FaImages className="mr-1" /> {report.pictures.length}
                  </span>
                )}
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    report.status
                  )}`}
                >
                  {report.status.toUpperCase()}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  {new Date(report.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h3
                className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-600 transition"
                onClick={() => openReportDetails(report)}
              >
                {report.need?.title || "Impact Report"}
              </h3>
              <p className="text-gray-600 line-clamp-3 mb-4">
                {report.description}
              </p>

              {report.impactMetrics && (
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full">
                    <FaUsers className="text-gray-500 mr-2" />
                    <span>
                      {report.impactMetrics.beneficiariesReached || 0}{" "}
                      Beneficiaries
                    </span>
                  </div>
                  {report.impactMetrics.communitiesServed && (
                    <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full">
                      <FaMapMarkerAlt className="text-gray-500 mr-2" />
                      <span>
                        {report.impactMetrics.communitiesServed.length}{" "}
                        Communities
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => openReportDetails(report)}
                className="w-full px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center"
              >
                View Full Report
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="flex justify-center mt-10">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(Math.ceil(totalItems / itemsPerPage)).keys()].map(
              (number) => (
                <button
                  key={number + 1}
                  onClick={() => handlePageChange(number + 1)}
                  className={`px-4 py-2 border-t border-b ${
                    currentPage === number + 1
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {number + 1}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Report Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedReport && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
            />

            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Report Details
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedReport.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
                  >
                    <svg
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
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-8">
                  {/* Report Overview */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {selectedReport.need?.title || "Impact Report"}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          selectedReport.status
                        )}`}
                      >
                        {selectedReport.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="prose max-w-none text-gray-700">
                      <p className="whitespace-pre-line">
                        {selectedReport.description}
                      </p>
                    </div>
                  </div>

                  {/* Impact Photos */}
                  {selectedReport.pictures &&
                    selectedReport.pictures.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="text-md font-medium text-gray-700 flex items-center">
                          <FaImages className="mr-2 text-blue-600" />
                          Impact Photos
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {selectedReport.pictures.map((file, index) => (
                            <motion.div
                              key={index}
                              className="relative group rounded-lg overflow-hidden"
                              whileHover={{ scale: 1.02 }}
                            >
                              <img
                                src={file}
                                alt={`Impact ${index + 1}`}
                                className="w-full h-40 object-cover rounded-lg border border-gray-200"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Impact Metrics */}
                  {selectedReport.impactMetrics && (
                    <div className="space-y-4">
                      <h5 className="text-md font-medium text-gray-700 flex items-center">
                        <FaChartLine className="mr-2 text-blue-600" />
                        Impact Metrics
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h6 className="text-sm font-medium text-gray-600 mb-2">
                            Beneficiaries Reached
                          </h6>
                          <p className="text-3xl font-bold text-blue-600">
                            {selectedReport.impactMetrics
                              .beneficiariesReached || 0}
                          </p>
                        </div>
                        {selectedReport.impactMetrics.communitiesServed && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h6 className="text-sm font-medium text-gray-600 mb-2">
                              Communities Served
                            </h6>
                            <div className="flex flex-wrap gap-2">
                              {selectedReport.impactMetrics.communitiesServed.map(
                                (community, i) => (
                                  <span
                                    key={i}
                                    className="bg-white px-3 py-1 rounded-full text-xs shadow-sm"
                                  >
                                    {community}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Donation Details */}
                  {selectedReport.donations && (
                    <div className="space-y-6">
                      <h5 className="text-md font-medium text-gray-700 flex items-center">
                        <FaBoxes className="mr-2 text-blue-600" />
                        Donation Details
                      </h5>

                      {/* Service Donations */}
                      {selectedReport.donations.services &&
                        selectedReport.donations.services.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-600 mb-3">
                              Service Donations
                            </h6>
                            <div className="space-y-3">
                              {selectedReport.donations.services.map(
                                (donation, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded-lg"
                                  >
                                    <div className="flex items-start">
                                      <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                                        <FaUsers className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="ml-3">
                                        <h6 className="text-sm font-medium text-gray-800">
                                          {donation.applicant?.name ||
                                            "Anonymous Volunteer"}
                                        </h6>
                                        <p className="text-sm text-gray-600">
                                          {donation.applicant?.email ||
                                            "No email provided"}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {donation.category}
                                          </span>
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {donation.subCategory}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Material Donations */}
                      {selectedReport.donations.materials &&
                        selectedReport.donations.materials.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-600 mb-3">
                              Material Donations
                            </h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {selectedReport.donations.materials.map(
                                (donation, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded-lg"
                                  >
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                                        <FaBoxes className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="ml-3">
                                        <h6 className="text-sm font-medium text-gray-800">
                                          {donation.subCategory}
                                        </h6>
                                        <p className="text-sm text-gray-600">
                                          Received:{" "}
                                          <span className="font-medium text-blue-600">
                                            {donation.totalQuantity}{" "}
                                            {donation.unit}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportList;
