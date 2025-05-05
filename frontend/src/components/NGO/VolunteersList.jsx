import { Eye, Check, X } from "lucide-react";
import { motion } from "framer-motion";

const VolunteersList = ({
  volunteer,
  volunteers,
  handleViewDetails,
  onStatusChange,
}) => {
  const handleStatusUpdate = (id, newStatus) => {
    // Call the external function to persist status
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 relative"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volunteer Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {volunteers.map((vol) => (
              <motion.tr
                key={vol._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {vol.applicant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {vol.applicant.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vol.applicant.phone || "No phone"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {vol.applicant.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      vol.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : vol.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vol.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(vol.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(vol)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition"
                      aria-label="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {vol.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(vol._id, "accepted")
                          }
                          className="p-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition"
                          aria-label="Accept"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(vol._id, "rejected")
                          }
                          disabled={
                            vol.status === "rejected" ||
                            vol.status === "completed"
                          }
                          className={`p-2 rounded-lg ${
                            vol.status === "rejected" ||
                            vol.status === "completed"
                              ? "bg-red-100 text-red-400 cursor-not-allowed"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          } transition`}
                          aria-label="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>

                        {vol.status === "accepted" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(vol._id, "completed")
                            }
                            className="p-2 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 transition"
                            aria-label="Complete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default VolunteersList;
