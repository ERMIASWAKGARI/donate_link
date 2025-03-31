import { useState, useContext, useEffect } from "react";
import {
  FaPlus,
  FaEye,
  FaTrash,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import NgoNeedForm from "./PostNeedsForm";
import Axios from "../../config/axiosConfig";
import { UserContext } from "../../context/UserContext";

function PostedNeeds() {
  const { user } = useContext(UserContext);
  const [needs, setNeeds] = useState([]);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Number of items per page
  const [totalItems, setTotalItems] = useState(0);

  // Fetch needs when component mounts or page changes
  useEffect(() => {
    fetchNeeds();
  }, [currentPage]);

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Axios.get(`/donation/ngo/${user._id}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      setNeeds(response.data.data || []);
      setTotalItems(response.data.total || 0);
    } catch (err) {
      setError("No posts added yet ");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNeed = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const newNeed =
        formData.data.need || formData.data.data?.need || formData.data;

      if (!newNeed) {
        throw new Error("Invalid response structure from server");
      }

      setNeeds((prev) => [newNeed, ...prev]);
      setShowNeedForm(false);
      setTotalItems((prev) => prev + 1); // Update total count
    } catch (err) {
      console.error("Error adding need:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to post need"
      );
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (need) => {
    setSelectedNeed(need);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedNeed(null);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // ... keep the rest of your existing functions (openDetailsModal, closeDetailsModal, etc.)

  if (loading) return <div className="text-center py-4">Loading...</div>;

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error: {typeof error === "object" ? JSON.stringify(error) : error}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Posted Needs</h2>
        <button
          onClick={() => setShowNeedForm(!showNeedForm)}
          className="flex items-center px-3 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-600"
          disabled={loading}
        >
          <FaPlus className="mr-2" />
          Post New Need
        </button>
      </div>

      {showNeedForm && (
        <NgoNeedForm
          onSubmit={handleAddNeed}
          onCancel={() => setShowNeedForm(false)}
        />
      )}

      {needs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No needs posted yet. Click the button above to post your first need.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {needs.map((need) => (
              <div
                key={need._id}
                className="p-4 bg-white shadow rounded-lg relative"
              >
                <h3 className="font-bold text-lg">
                  {need.title || "Untitled"}
                </h3>
                <p className="font-medium">
                  {need.description || "No description provided"}
                </p>
                <div className="flex flex-wrap gap-1 my-2">
                  {Array.isArray(need.needTypes) &&
                    need.needTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-gray-100 text-xs rounded"
                      >
                        {type}
                      </span>
                    ))}
                </div>
                {need.needTypes?.includes("money") && need.targetMoney && (
                  <p className="text-gray-600">Amount: {need.targetMoney}</p>
                )}
                <p
                  className={`text-sm font-semibold ${
                    need.status === "Fulfilled"
                      ? "text-green-600"
                      : need.status === "Expired"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  Status: {need.status || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  Urgency: {need.urgencyLevel || "Not specified"}
                </p>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => openDetailsModal(need)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded cursor-pointer hover:bg-yellow-600"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center gap-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first pages, current page, and last pages
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2">...</span>
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaChevronRight />
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {showDetailsModal && selectedNeed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedNeed.title}
                </h2>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600">{selectedNeed.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Need Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedNeed.needTypes?.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Status & Urgency
                    </h3>
                    <div className="flex gap-4">
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`font-semibold ${
                            selectedNeed.status === "Fulfilled"
                              ? "text-green-600"
                              : selectedNeed.status === "Expired"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {selectedNeed.status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Urgency:</span>{" "}
                        <span className="font-semibold">
                          {selectedNeed.urgencyLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedNeed.needTypes?.includes("money") && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Financial Target
                      </h3>
                      <p className="text-gray-600">
                        ${selectedNeed.targetMoney}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Beneficiary Information
                    </h3>
                    <p className="text-gray-600">
                      <span className="font-medium">Number:</span>{" "}
                      {selectedNeed.beneficiaryInfo?.numberOfBeneficiaries}
                    </p>
                    {selectedNeed.beneficiaryInfo?.location && (
                      <div className="mt-2">
                        <p className="font-medium">Location:</p>
                        <p className="text-gray-600">
                          {selectedNeed.beneficiaryInfo.location.address}
                        </p>
                        <p className="text-sm text-gray-500">
                          Lat: {selectedNeed.beneficiaryInfo.location.latitude},
                          Lng: {selectedNeed.beneficiaryInfo.location.longitude}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedNeed.beneficiaryInfo.pictures?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Images
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedNeed.beneficiaryInfo.pictures.map(
                          (pic, index) => (
                            <div key={index} className="relative">
                              <img
                                src={`http://localhost:5000/uploads/${pic.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                alt={`Need ${pic.replace(/\\/g, "/")}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Material Categories */}
                  {selectedNeed.categories?.material?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Material Needs
                      </h3>
                      <div className="space-y-2">
                        {selectedNeed.categories.material.map(
                          (category, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded">
                              <p>
                                <span className="font-medium">Category:</span>{" "}
                                {category.categoryName}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Sub-category:
                                </span>{" "}
                                {category.subCategoryName}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Amount Needed:
                                </span>{" "}
                                {category.targetAmountNeeded}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Service Categories */}
                  {selectedNeed.categories?.service?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Service Needs
                      </h3>
                      <div className="space-y-2">
                        {selectedNeed.categories.service.map(
                          (category, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded">
                              <p>
                                <span className="font-medium">Category:</span>{" "}
                                {category.categoryName}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Sub-category:
                                </span>{" "}
                                {category.subCategoryName}
                              </p>
                              <p>
                                <span className="font-medium">Vacancy:</span>{" "}
                                {category.vacancy}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostedNeeds;
