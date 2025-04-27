import { FaEye } from "react-icons/fa";
// eslint-disable-next-line react/prop-types
const NeedsList = ({ needs, openDetailsModal }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {needs.map((need) => (
        <div
          key={need._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
        >
          {need.beneficiaryInfo.pictures?.length > 0 && (
            <div className="h-48 overflow-hidden">
              <img
                src={`http://localhost:5000/uploads/${need.beneficiaryInfo.pictures[0].replace(
                  /\\/g,
                  "/"
                )}`}
                alt="Need"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-800">
                {need.title || "Untitled Need"}
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  need.status === "Fulfilled"
                    ? "bg-green-100 text-green-800"
                    : need.status === "Expired"
                    ? "bg-red-100 text-red-800"
                    : "bg-primary text-white"
                }`}
              >
                {need.status}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">
              {need.description || "No description provided"}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {need.needTypes?.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                >
                  {type}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium ${
                  need.urgencyLevel === "High"
                    ? "text-red-500"
                    : need.urgencyLevel === "Medium"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {need.urgencyLevel}
              </span>
              <button
                onClick={() => openDetailsModal(need)}
                className="flex items-center gap-1 text-primary hover:text-opacity-90 text-sm font-medium"
              >
                View Details <FaEye className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default NeedsList;
