import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import AxiosInstance from "../../config/axiosConfig";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DonationsList = () => {
  const [selectedCategory, setSelectedCategory] = useState("money");
  const [selectedNeed, setSelectedNeed] = useState(null);
  const { user } = useUser();
  const [needs, setNeeds] = useState([]);
  const [donations, setDonations] = useState({
    money: [],
    materials: [],
    services: [],
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch needs with pagination
  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const response = await AxiosInstance.get(`/donation/ngo/${user._id}`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        setNeeds(response.data.data || []);
        setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
      } catch (err) {
        console.error("Error fetching needs:", err);
      }
    };
    fetchNeeds();
  }, [user._id, currentPage, itemsPerPage]);

  // Fetch donations for selected need
  useEffect(() => {
    const fetchDonations = async () => {
      if (!selectedNeed) return;

      try {
        if (selectedCategory === "items") {
          // Only fetch material donations when items category is selected
          const materialResponse = await AxiosInstance.get(
            `donation/material/${selectedNeed.NGO}/${selectedNeed._id}`,
            {
              params: {
                needId: selectedNeed._id,
              },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          setDonations((prev) => ({
            ...prev,
            materials: materialResponse.data.data.donations || [],
          }));
        } else if (selectedCategory === "service") {
          // Only fetch service applications when service category is selected
          const serviceResponse = await AxiosInstance.get(
            `donation/service/${selectedNeed.NGO}/${selectedNeed._id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          setDonations((prev) => ({
            ...prev,
            services: serviceResponse.data.donations || [],
          }));
        }
        // Money donations would be handled separately when implemented
      } catch (error) {
        console.error("Error fetching donations:", error);
      }
    };

    fetchDonations();
  }, [selectedNeed, selectedCategory]);

  const getDonationsByType = () => {
    if (selectedCategory === "money") return donations.money;
    if (selectedCategory === "items") return donations.materials;
    if (selectedCategory === "service") return donations.services;
    return [];
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Needs Selection with Pagination */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Select Need</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <select
          className="w-full p-2 border rounded"
          value={selectedNeed?._id || ""}
          onChange={(e) => {
            const need = needs.find((n) => n._id === e.target.value);
            setSelectedNeed(need);
          }}
        >
          <option value="">Select a need</option>
          {needs.map((need) => (
            <option key={need._id} value={need._id}>
              {need.title || need.description}
            </option>
          ))}
        </select>
      </div>

      {/* Category Selection */}
      <div className="flex gap-4 mb-6">
        {["money", "items", "service"].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">
          {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}{" "}
          Donations
          {selectedNeed &&
            ` for ${selectedNeed.title || selectedNeed.description}`}
        </h2>

        <div className="space-y-4">
          {getDonationsByType()?.length > 0 ? (
            getDonationsByType().map((donation) => (
              <div
                key={donation._id || donation.id}
                className="p-4 bg-gray-50 rounded-lg"
              >
                {selectedCategory === "service" ? (
                  <>
                    {donation.services.map((service, index) => (
                      <div key={index} className="mb-4">
                        <p className="font-medium">Service Details:</p>
                        <p className="text-gray-600">
                          Category: {service.categoryName}
                        </p>
                        <p className="text-gray-600">
                          Subcategory: {service.subCategoryName}
                        </p>
                        <p className="text-gray-600">
                          Start Date:{" "}
                          {new Date(service.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          End Date:{" "}
                          {new Date(service.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          Hours per Week: {service.hoursPerWeek}
                        </p>
                      </div>
                    ))}
                    {donation.message && (
                      <p className="mt-2 text-gray-600">
                        Message: {donation.message}
                      </p>
                    )}
                  </>
                ) : selectedCategory === "items" ? (
                  <>
                    <p className="font-medium">
                      Tracking ID: {donation.trackingId}
                    </p>
                    {donation?.materials?.map((material, index) => (
                      <div key={index} className="mt-2 text-gray-600">
                        <p>Category: {material.categoryName}</p>
                        <p>Subcategory: {material.subCategoryName}</p>
                        <p>Quantity: {material.quantity}</p>
                      </div>
                    ))}
                    <p className="mt-2">
                      Location: {donation.location.address}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">{donation.donor} donated</p>
                    <p className="text-gray-600">{donation.amount}</p>
                    <p
                      className={`text-sm font-semibold ${
                        donation.status === "Completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {donation.status}
                    </p>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No donations available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationsList;
