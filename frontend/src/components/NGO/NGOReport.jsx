//prepare the component to be used in the NGO report where it get id from search params and then use it to get the report data from the backend and show it in the component
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../config/axiosConfig";
import dayjs from "dayjs";
import Header from "../header/Header";

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
      pending: "bg-orange-100 text-orange-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p>Report not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Report Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Report for Need: {report.need?.title || "Untitled Need"}
              </h1>
              {getStatusTag(report.status)}
            </div>
          </div>

          {/* Basic Information */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created By</h3>
              <p className="mt-1 text-sm text-gray-900">
                {report.createdBy?.name || "Unknown"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1 text-sm text-gray-900">
                {dayjs(report.createdAt).format("MMMM D, YYYY h:mm A")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">NGO</h3>
              <p className="mt-1 text-sm text-gray-900">
                {report.NGO?.name || "Unknown NGO"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Last Updated
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {dayjs(report.updatedAt).format("MMMM D, YYYY h:mm A")}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* Pictures */}
          {report.pictures?.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Pictures ({report.pictures.length})
              </h2>
              <div className="flex flex-wrap gap-4">
                {report.pictures.map((pic, index) => (
                  <div
                    key={index}
                    className="w-full sm:w-48 h-48 rounded-lg overflow-hidden"
                  >
                    <img
                      src={`http://localhost:5000/uploads/${pic.replace(
                        /\\/g,
                        "/"
                      )}`}
                      alt={`Report image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Metrics */}
          {report.impactMetrics && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Impact Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Beneficiaries Reached
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {report.impactMetrics.beneficiariesReached ||
                      "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Communities Served
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {report.impactMetrics.communitiesServed?.join(", ") ||
                      "Not specified"}
                  </p>
                </div>
              </div>

              {report.impactMetrics.successStories?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Success Stories
                  </h3>
                  <ul className="space-y-4">
                    {report.impactMetrics.successStories.map((story, index) => (
                      <li key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">
                          <span className="font-medium">
                            Story #{index + 1}:
                          </span>{" "}
                          {story}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Donations Received */}
          {(report.donations?.materials?.length > 0 ||
            report.donations?.services?.length > 0) && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Donations Received
              </h2>

              {/* Material Donations */}
              {report.donations.materials?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-md font-medium text-gray-900 mb-3">
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.subCategory}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.totalQuantity} {item.unit}
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
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    Service Donations
                  </h3>
                  <div className="space-y-4">
                    {report.donations.services.map((service, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Volunteer
                            </h4>
                            <p className="text-sm text-gray-900">
                              {service.applicant?.name || "Anonymous"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Service
                            </h4>
                            <p className="text-sm text-gray-900">
                              {service.category} ({service.subCategory})
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Duration
                            </h4>
                            <p className="text-sm text-gray-900">
                              {dayjs(service.startDate).format("MMM D, YYYY")} -{" "}
                              {service.endDate
                                ? dayjs(service.endDate).format("MMM D, YYYY")
                                : "Ongoing"}
                              {service.hoursPerWeek &&
                                ` (${service.hoursPerWeek} hrs/week)`}
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
    </>
  );
};

export default NGOReportViewer;
