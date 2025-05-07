import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../config/axiosConfig";
import dayjs from "dayjs";
import { BlobProvider } from "@react-pdf/renderer";
import Header from "../header/Header";
import PDFReportDocument from "./PDFDocument";

const NGOReportViewer = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/donation/report/${id}`);
        setReport(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    } else {
      setError("No report ID provided");
      setLoading(false);
    }
  }, [id]);

  const getStatusTag = (status) => {
    const statusClasses = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-rose-100 text-rose-800 border-rose-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">
            Report Not Found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            The requested report could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* PDF Download Button */}

          {/* Report Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-[#008080] to-blue-800 px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-xl font-bold text-white">
                  Impact Report: {report.need?.title || "Untitled Need"}
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-100 text-sm">
                    {dayjs(report.createdAt).format("MMMM D, YYYY")}
                  </span>
                  {getStatusTag(report.status)}
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="divide-y divide-gray-200">
              {/* Basic Info */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Created By
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {report.createdBy?.name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      NGO
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {report.NGO?.name || "Unknown NGO"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Created At
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {dayjs(report.createdAt).format("MMMM D, YYYY h:mm A")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {dayjs(report.updatedAt).format("MMMM D, YYYY h:mm A")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-5 w-1 bg-[#008080] rounded-full"></div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Report Summary
                  </h2>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {report.description}
                </div>
              </div>

              {/* Pictures */}
              {report.pictures?.length > 0 && (
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-5 w-1 bg-[#008080] rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Photo Gallery ({report.pictures.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.pictures.map((pic, index) => (
                      <div
                        key={index}
                        className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
                      >
                        <img
                          src={`http://localhost:5000/uploads/${pic.replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt={`Report image ${index + 1}`}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm">
                            Image {index + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact Metrics */}
              {report.impactMetrics && (
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-5 w-1 bg-[#008080] rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Impact Metrics
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Beneficiaries Reached
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {report?.beneficiariesReached || "Not specified"}
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Communities Served
                      </h3>
                      <p className="text-gray-900">
                        {report.impactMetrics.communitiesServed?.join(", ") ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>

                  {report.impactMetrics.successStories?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-md font-semibold text-gray-900 mb-3">
                        Success Stories
                      </h3>
                      <div className="space-y-4">
                        {report.impactMetrics.successStories.map(
                          (story, index) => (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                  <span className="font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                <p className="text-gray-700">{story}</p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Donations Received */}
              {(report.donations?.materials?.length > 0 ||
                report.donations?.services?.length > 0) && (
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="h-5 w-1 bg-[#008080] rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Donations Received
                    </h2>
                  </div>

                  {/* Material Donations */}
                  {report.donations.materials?.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-md font-semibold text-gray-900 mb-3">
                        Material Donations
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subcategory
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.donations.materials.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.subCategory}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className="font-medium">
                                    {item.totalQuantity}
                                  </span>{" "}
                                  {item.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Service Donations */}
                  {report.donations.services?.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-3">
                        Volunteer Services
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.donations.services.map((service, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                {service.applicant?.name
                                  ?.charAt(0)
                                  .toUpperCase() || "V"}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {service.applicant?.name || "Anonymous"}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Volunteer
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500">Service</p>
                                <p className="text-gray-900">
                                  {service.category}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Type</p>
                                <p className="text-gray-900">
                                  {service.subCategory}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Start Date</p>
                                <p className="text-gray-900">
                                  {dayjs(service.startDate).format(
                                    "MMM D, YYYY"
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Status</p>
                                <p className="text-gray-900">
                                  {service.endDate ? "Completed" : "Ongoing"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NGOReportViewer;
