import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { useUser } from "../../context/UserContext";

function VolunteerApplication() {
  const [loading, setLoading] = useState(true);
  const [serviceNeeds, setServiceNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const { user } = useUser();
  const ngoId = user._id;

  useEffect(() => {
    const fetchServiceNeeds = async () => {
      try {
        const response = await axiosInstance.get("donation/services");
        setLoading(false);
        if (response.data.success) {
          setServiceNeeds(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching service needs:", error);
      }
    };

    fetchServiceNeeds();
  }, []);

  const fetchVolunteers = async (needId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `donation/service/${ngoId}/${needId}`
      );
      setLoading(false);
      setVolunteers(response.data.donations || []);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching volunteers:", error);
    }
  };

  const handleNeedChange = (event) => {
    const needId = event.target.value;
    setSelectedNeed(needId);
    fetchVolunteers(needId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between pt-4">
                <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-10 bg-gray-200 rounded-full w-10"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Needs</h2>
      <select
        value={selectedNeed}
        onChange={handleNeedChange}
        className="mt-4 p-3 border rounded-lg w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        <option value="" disabled>
          Select a Service Need
        </option>
        {serviceNeeds.map((need) => (
          <option key={need._id} value={need._id}>
            {need.title} - {need.urgencyLevel}
          </option>
        ))}
      </select>

      {selectedNeed && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Volunteers Applied
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteers.length > 0 ? (
              volunteers.map((volunteer) => (
                <div
                  key={volunteer._id}
                  className="p-6 bg-white shadow-lg rounded-lg border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {volunteer.donorId.name}
                  </h3>
                  <p className="text-gray-600 mt-2">{volunteer.message}</p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      <strong>Category:</strong>{" "}
                      {volunteer.services[0].categoryName}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Subcategory:</strong>{" "}
                      {volunteer.services[0].subCategoryName}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Start Date:</strong>{" "}
                      {new Date(
                        volunteer.services[0].startDate
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>End Date:</strong>{" "}
                      {new Date(
                        volunteer.services[0].endDate
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Hours/Week:</strong>{" "}
                      {volunteer.services[0].hoursPerWeek}
                    </p>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition">
                    Contact
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-full">
                No volunteers have applied yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerApplication;
