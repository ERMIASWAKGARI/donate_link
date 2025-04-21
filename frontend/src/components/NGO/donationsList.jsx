import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import AxiosInstance from "../../config/axiosConfig";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDonate,
  FaBoxOpen,
  FaHandsHelping,
  FaTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
} from "react-icons/fi";
import Modal from "react-modal";

// Set app element for accessibility (should be set to your app's root element)
Modal.setAppElement("#root");

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
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const openDonationDetails = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDonation(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Needs Selection with Pagination */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h3 className="text-xl font-semibold text-gray-800">Select Need</h3>

          {needs.length > 0 && (
            <div className="flex items-center gap-4">
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
        ) : selectedCategory === "items" && getDonationsByType()?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Donor Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getDonationsByType().map((donation) => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donorId?.name || "Anonymous"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="flex-shrink-0 mr-2 text-gray-400" />
                        <div className="text-sm text-gray-500">
                          {donation.location?.address || "Not specified"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          donation.status
                        )}`}
                      >
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDonationDetails(donation)}
                        className="text-primary hover:text-primary-dark flex items-center"
                      >
                        Details <FiChevronRight className="ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : getDonationsByType()?.length > 0 ? (
          <div className="space-y-4">
            {getDonationsByType().map((donation) => (
              <div
                key={donation._id || donation.id}
                className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
              >
                {/* ... existing non-table content ... */}
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

      {/* Donation Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Donation Details"
        className="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6 relative"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      >
        {selectedDonation && (
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Donation Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Donor Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">
                      {selectedDonation.donorId?.name || "Anonymous"}
                    </p>
                    <p className="text-gray-600">
                      {selectedDonation.donorId?.email || "Email not provided"}
                    </p>
                    <p className="text-gray-600 mt-2">
                      <FaMapMarkerAlt className="inline mr-1" />
                      {selectedDonation.location?.address ||
                        "Address not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                  <div className="flex items-center">
                    {getStatusIcon(selectedDonation.status)}
                    <span className="ml-2 font-medium">
                      {selectedDonation.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Donation Date
                    </h3>
                    <p className="text-gray-600">
                      {new Date(
                        selectedDonation.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Donated Items
                </h3>
                <div className="space-y-2">
                  {selectedDonation?.materials?.map((material, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{material.categoryName}</p>
                          <p className="text-sm text-gray-600">
                            {material.subCategoryName}
                          </p>
                        </div>
                        <p className="font-medium">
                          Quantity: {material.quantity}
                        </p>
                      </div>
                      {material.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {material.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedDonation.message && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Donor Message
                  </h3>
                  <div className="bg-gray-50 p-3 rounded border-l-4 border-primary">
                    <p className="text-gray-700 italic">
                      {selectedDonation.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DonationsList;
