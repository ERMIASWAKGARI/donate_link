import { FaUser, FaCalendarAlt, FaClock, FaInfoCircle } from "react-icons/fa";
import { FiLoader, FiChevronRight } from "react-icons/fi";
import StatusUpdateButton from "./StatusUpdateButton";

const ServiceApplicationsTable = ({
  applications,
  loading,
  onStatusUpdate,
  onViewDetails,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Submitted":
        return "bg-blue-100 text-blue-800";
      case "Interview Scheduled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FiLoader className="animate-spin text-primary text-3xl" />
        <span className="ml-3 text-gray-600">Loading applications...</span>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FaInfoCircle className="inline-block text-4xl text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No service applications received yet
        </h3>
        <p className="text-gray-500">
          This need hasn't received any volunteer applications yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Volunteer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Availability
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((application) => (
            <tr key={application._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {application.applicant?.name || "Anonymous"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.applicant?.email || ""}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {application.category}
                </div>
                <div className="text-sm text-gray-500">
                  {application.subCategory}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FaCalendarAlt className="flex-shrink-0 mr-2 text-gray-400" />
                  <div className="text-sm text-gray-900">
                    {new Date(application.startDate).toLocaleDateString()}
                    {application.endDate && (
                      <>
                        {" - "}
                        {new Date(application.endDate).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>
                {application.hoursPerWeek && (
                  <div className="flex items-center mt-1">
                    <FaClock className="flex-shrink-0 mr-2 text-gray-400" />
                    <div className="text-sm text-gray-500">
                      {application.hoursPerWeek} hrs/week
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onViewDetails(application)}
                    className="text-primary hover:text-primary-dark flex items-center"
                  >
                    Details <FiChevronRight className="ml-1" />
                  </button>
                  {/* <StatusUpdateButton
                    donationId={application._id}
                    currentStatus={application.status}
                    onUpdate={onStatusUpdate}
                    statusOptions={[
                      "Submitted",
                      "Under Review",
                      "Interview Scheduled",
                      "Approved",
                      "Rejected",
                      "Accepted",
                    ]}
                  /> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceApplicationsTable;
