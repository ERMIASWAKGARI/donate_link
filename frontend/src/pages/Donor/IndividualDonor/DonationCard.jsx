import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const DonationCard = ({ donation, onSeeMore, onDonate }) => {
  const urgencyColors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  };

  // Get the first image URL or fallback to placeholder
  const imageUrl = donation?.beneficiaryInfo?.pictures?.[0]
    ? `http://localhost:5000/uploads/${donation.beneficiaryInfo.pictures[0].replace(
        /\\/g,
        "/"
      )}`
    : null;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
      whileHover={{ y: -5 }}
    >
      {/* Image Section */}
      <div className="h-48 bg-gray-100 overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={donation.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              urgencyColors[donation.urgencyLevel] ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {donation.urgencyLevel || "Unknown"} Urgency
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-green-800 mb-2">
          {donation.title}
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          by {donation.NGO?.name || "Unknown Organization"}
        </p>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {donation.description}
        </p>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onSeeMore}
            className="text-green-700 hover:text-green-800 font-medium flex items-center transition"
          >
            See More <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {donation.beneficiaryInfo?.location?.address ||
              "Location not specified"}
          </span>
          <button
            onClick={onDonate}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-2 px-6 rounded-full transition"
          >
            {donation.needTypes.includes("service") ? "apply" : "Donate Now"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DonationCard;
