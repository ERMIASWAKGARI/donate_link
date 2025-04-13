import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";

function VolunteerApplication({ volunteers }) {
  const [loading, setLoading] = useState(true);
  const [serviceNeeds, setServiceNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState("");

  useEffect(() => {
    // Fetch service needs from the backend
    const fetchServiceNeeds = async () => {
      try {
        const response = await axiosInstance.get("donation/services"); // Adjust the endpoint as needed
        setLoading(false);
        if (response.data.success) {
          setServiceNeeds(response.data.data);
        }
        // if (response.data.success) {
        //   setServiceNeeds(response.data.data);
        // }
        console.log("Service needs data:", response.data.data);
      } catch (error) {
        console.error("Error fetching service needs:", error);
      }
    };

    fetchServiceNeeds();
  }, []);
  const handleNeedChange = (event) => {
    setSelectedNeed(event.target.value);
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
      <h2 className="text-xl font-semibold text-gray-800">Service Needs</h2>
      <select
        value={selectedNeed}
        onChange={handleNeedChange}
        className="mt-4 p-2 border rounded"
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
          <h2 className="text-xl font-semibold text-gray-800">
            Volunteers Applied
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {volunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                className="p-4 bg-white shadow rounded-lg"
              >
                <p className="font-medium">{volunteer.name}</p>
                <p className="text-gray-600">{volunteer.role}</p>
                <button className="mt-2 px-3 py-1 bg-yellow-400 text-black cursor-pointer rounded hover:bg-yellow-600">
                  Contact
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerApplication;
