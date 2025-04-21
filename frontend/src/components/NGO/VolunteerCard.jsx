import { motion } from "framer-motion";

const VolunteerCard = ({
  volunteer,
  handleViewProfile,
  openDropdownId,
  toggleDropdown,
  confirmAction,
  setShowChatModal,
  setOpenDropdownId,
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        key={volunteer._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 relative"
      >
        {/* Action Dropdown Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => toggleDropdown(volunteer._id)}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg
              className="h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {openDropdownId === volunteer._id && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleViewProfile(volunteer)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  setShowChatModal(true);
                  setOpenDropdownId(null);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Contact
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction("accepted", volunteer._id);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
              >
                Accept
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction("rejected", volunteer._id);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-shrink-0">
                {volunteer?.applicant?.profilePicture ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={volunteer.applicant.profilePicture}
                    alt={volunteer.applicant.name}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {volunteer?.applicant?.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {volunteer.applicant.name}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {volunteer.status || "pending"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className=" ">Motivation</h3>
                <p className="text-gray-600 italic">
                  {volunteer.motivation || "No message provided"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Service
                  </h4>
                  <p className="mt-1 font-medium">
                    {volunteer.category} • {volunteer.subCategory}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Duration
                  </h4>
                  <p className="mt-1 font-medium">
                    {new Date(volunteer.startDate).toLocaleDateString()} -{" "}
                    {new Date(volunteer.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Commitment
                  </h4>
                  <p className="mt-1 font-medium">
                    {volunteer.hoursPerWeek} hours/week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VolunteerCard;
