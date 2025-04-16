import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import AxiosInstance from "../../config/axiosConfig";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDonate,
  FaBoxOpen,
  FaHandsHelping,
} from "react-icons/fa";
import { FiLoader, FiCheckCircle, FiXCircle } from "react-icons/fi";

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
  const [loading, setLoading] = useState({
    needs: false,
    donations: false,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch needs with pagination
  useEffect(() => {
    const fetchNeeds = async () => {
      setLoading((prev) => ({ ...prev, needs: true }));
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
      } finally {
        setLoading((prev) => ({ ...prev, needs: false }));
      }
    };
    fetchNeeds();
  }, [user?._id, currentPage, itemsPerPage]);

  // Fetch donations for selected need
  useEffect(() => {
    const fetchDonations = async () => {
      if (!selectedNeed) return;

      setLoading((prev) => ({ ...prev, donations: true }));
      try {
        if (selectedCategory === "items") {
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
          const serviceResponse = await AxiosInstance.get(
            `donation/service/${selectedNeed._id}`,
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
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading((prev) => ({ ...prev, donations: false }));
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <FiCheckCircle className="text-green-500" />;
      case "Pending":
        return <FiLoader className="text-yellow-500 animate-spin" />;
      case "Cancelled":
        return <FiXCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "money":
        return <FaDonate className="mr-2" />;
      case "items":
        return <FaBoxOpen className="mr-2" />;
      case "service":
        return <FaHandsHelping className="mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Needs Selection with Pagination */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h3 className="text-xl font-semibold text-gray-800">Select Need</h3>

          {needs.length > 0 && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 disabled:opacity-50 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-sm"
              >
                <FaChevronLeft />
              </button>
              <span className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 disabled:opacity-50 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-sm"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        {loading.needs ? (
          <div className="flex justify-center py-4">
            <FiLoader className="animate-spin text-primary text-2xl" />
          </div>
        ) : (
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
        )}
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {["money", "items", "service"].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center justify-center p-4 rounded-xl transition-all ${
              selectedCategory === category
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
            }`}
          >
            {getCategoryIcon(category)}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
            {getCategoryIcon(selectedCategory)}
            {selectedCategory.charAt(0).toUpperCase() +
              selectedCategory.slice(1)}{" "}
            Donations
          </h2>
          {selectedNeed && (
            <span className="text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
              {selectedNeed.title || selectedNeed.description}
            </span>
          )}
        </div>

        {loading.donations ? (
          <div className="flex justify-center py-12">
            <FiLoader className="animate-spin text-primary text-3xl" />
            <span className="ml-3 text-gray-600">Loading donations...</span>
          </div>
        ) : getDonationsByType()?.length > 0 ? (
          <div className="space-y-4">
            {getDonationsByType().map((donation) => (
              <div
                key={donation._id || donation.id}
                className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
              >
                {selectedCategory === "service" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Service Details
                        </h3>
                        <div className="space-y-1 text-gray-600">
                          <p>
                            <span className="font-medium">Category:</span>{" "}
                            {donation.category}
                          </p>
                          <p>
                            <span className="font-medium">Subcategory:</span>{" "}
                            {donation.subCategory}
                          </p>
                          <p>
                            <span className="font-medium">Hours/Week:</span>{" "}
                            {donation.hoursPerWeek}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Timing
                        </h3>
                        <div className="space-y-1 text-gray-600">
                          <p>
                            <span className="font-medium">Start:</span>{" "}
                            {new Date(donation.startDate).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">End:</span>{" "}
                            {new Date(donation.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {donation?.message && (
                      <div className="mt-3 p-3 bg-white rounded border-l-4 border-primary">
                        <p className="text-gray-700 italic">
                          "{donation.message}"
                        </p>
                      </div>
                    )}
                  </>
                ) : selectedCategory === "items" ? (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-700">
                        Tracking ID:{" "}
                        <span className="text-primary">
                          {donation.trackingId}
                        </span>
                      </h3>
                      <div className="flex items-center text-sm">
                        {getStatusIcon(donation.status)}
                        <span className="ml-1">{donation.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Items
                        </h4>
                        <div className="space-y-2">
                          {donation?.materials?.map((material, index) => (
                            <div
                              key={index}
                              className="bg-white p-2 rounded border"
                            >
                              <p className="font-medium">
                                {material.categoryName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {material.subCategoryName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {material.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Location
                        </h4>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-gray-600">
                            {donation.location.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-700">
                          Donation from {donation.donor}
                        </h3>
                        <p className="text-xl font-bold text-primary mt-1">
                          ${donation.amount}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(donation.status)}
                        <span className="ml-2 font-medium">
                          {donation.status}
                        </span>
                      </div>
                    </div>
                    {donation.message && (
                      <div className="mt-3 p-3 bg-white rounded border-l-4 border-primary">
                        <p className="text-gray-700 italic">
                          "{donation.message}"
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaDonate className="inline-block text-4xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-1">
              No donations available
            </h3>
            <p className="text-gray-500">
              {selectedNeed
                ? `No ${selectedCategory} donations for this need yet`
                : "Select a need to view donations"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationsList;
