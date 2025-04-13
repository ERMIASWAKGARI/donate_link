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
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

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
      setError("No posts added yet");
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
      setTotalItems((prev) => prev + 1);
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchNeeds}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Posted Needs</h1>
          <button
            onClick={() => setShowNeedForm(!showNeedForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-button text-gray-800 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <FaPlus /> Post New Need
          </button>
        </div>

        {showNeedForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <NgoNeedForm
              onSubmit={handleAddNeed}
              onCancel={() => setShowNeedForm(false)}
            />
          </div>
        )}

        {needs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No needs posted yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by posting your first need to get donations
            </p>
            <button
              onClick={() => setShowNeedForm(true)}
              className="px-4 py-2 bg-primary-button text-gray-800 rounded hover:bg-opacity-90"
            >
              Post a Need
            </button>
          </div>
        ) : (
          <>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-l-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaChevronLeft />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        className={`px-4 py-2 ${
                          currentPage === pageNum
                            ? "bg-primary text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-4 py-2 bg-white text-gray-700">
                      ...
                    </span>
                  )}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`px-4 py-2 ${
                        currentPage === totalPages
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-r-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Need Details Modal */}
        {showDetailsModal && selectedNeed && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedNeed.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedNeed.status === "Fulfilled"
                            ? "bg-green-100 text-green-800"
                            : selectedNeed.status === "Expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-primary text-white"
                        }`}
                      >
                        {selectedNeed.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedNeed.urgencyLevel === "High"
                            ? "bg-red-100 text-red-800"
                            : selectedNeed.urgencyLevel === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedNeed.urgencyLevel} Priority
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Description
                      </h3>
                      <p className="text-gray-600 whitespace-pre-line">
                        {selectedNeed.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Need Types
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNeed.needTypes?.map((type) => (
                          <span
                            key={type}
                            className="px-3 py-1 bg-primary-button text-gray-800 rounded-full text-sm font-medium"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedNeed.needTypes?.includes("money") && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Financial Target
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-primary">
                            ${selectedNeed.targetMoney}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Beneficiary Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Number</p>
                            <p className="font-medium">
                              {
                                selectedNeed.beneficiaryInfo
                                  ?.numberOfBeneficiaries
                              }
                            </p>
                          </div>
                          {selectedNeed.beneficiaryInfo?.location && (
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium">
                                {selectedNeed.beneficiaryInfo.location.address}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedNeed.beneficiaryInfo.pictures?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Images
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedNeed.beneficiaryInfo.pictures.map(
                            (pic, index) => (
                              <div
                                key={index}
                                className="rounded-lg overflow-hidden"
                              >
                                <img
                                  src={`http://localhost:5000/uploads/${pic.replace(
                                    /\\/g,
                                    "/"
                                  )}`}
                                  alt={`Need ${index + 1}`}
                                  className="w-full h-24 object-cover"
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {selectedNeed.categories?.material?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Material Needs
                        </h3>
                        <div className="space-y-3">
                          {selectedNeed.categories.material.map(
                            (category, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded-lg"
                              >
                                <p className="font-medium text-gray-700">
                                  {category.categoryName} (
                                  {category.subCategoryName})
                                </p>
                                <p className="text-sm text-gray-600">
                                  Amount needed: {category.targetAmountNeeded}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {selectedNeed.categories?.service?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Service Needs
                        </h3>
                        <div className="space-y-3">
                          {selectedNeed.categories.service.map(
                            (category, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-3 rounded-lg"
                              >
                                <p className="font-medium text-gray-700">
                                  {category.categoryName} (
                                  {category.subCategoryName})
                                </p>
                                <p className="text-sm text-gray-600">
                                  Vacancy: {category.vacancy}
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
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostedNeeds;
