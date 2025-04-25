import { useState, useContext, useEffect } from "react";
import {
  FaPlus,
  FaEye,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaDollarSign,
  FaTags,
  FaMoneyBillWave,
  FaBoxOpen,
  FaUsers,
  FaImages,
  FaBoxes,
  FaHandsHelping,
} from "react-icons/fa";
import NgoNeedForm from "./PostNeedsForm";
import Axios from "../../config/axiosConfig";
import { UserContext } from "../../context/UserContext";

function PostedNeeds() {
  const { user } = useContext(UserContext);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [needs, setNeeds] = useState([]);

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
      // eslint-disable-next-line no-unused-vars
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
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-[#008080] border-dashed rounded-full animate-spin"></div>
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
            className="flex border border-[#008080] items-center gap-2 px-4 py-2  text-[#008080] rounded-lg hover:bg-opacity-90 hover:bg-[#008080] hover:text-white transition-colors"
          >
            {showNeedForm ? (
              "Cancel"
            ) : (
              <>
                <FaPlus /> create a project
              </>
            )}
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
        {/* Need Details Modal - Enhanced Version */}
        {showDetailsModal && selectedNeed && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200 animate-scaleIn">
              <div className="p-6 pt-0">
                {/* Header with sticky positioning */}
                <div className="sticky top-0 bg-white z-10 pt-6 pb-4 border-b mb-4 flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedNeed.title}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedNeed.status === "Fulfilled"
                            ? "bg-green-100 text-green-800"
                            : selectedNeed.status === "Expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
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
                      {selectedNeed.needTypes?.includes("money") && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          Financial Need
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="text-gray-400 hover:text-gray-600 transition-transform hover:scale-110"
                    aria-label="Close"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {/* Body - Reorganized for better flow */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Primary Information */}
                  <div className="space-y-6">
                    {/* Description Section */}
                    <section className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaInfoCircle className="mr-2 text-blue-500" />
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedNeed.description}
                      </p>
                    </section>

                    {/* Financial Target - Prominent if exists */}
                    {selectedNeed.needTypes?.includes("money") && (
                      <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <FaDollarSign className="mr-2 text-green-500" />
                          Financial Target
                        </h3>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl font-bold text-blue-600">
                            ${selectedNeed.targetMoney.toLocaleString()}
                          </p>
                          <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (selectedNeed.currentMoneyRaised /
                                    selectedNeed.targetMoney) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        {selectedNeed.currentMoneyRaised && (
                          <p className="text-sm text-gray-600 mt-2">
                            ${selectedNeed.currentMoneyRaised.toLocaleString()}{" "}
                            raised
                          </p>
                        )}
                      </section>
                    )}

                    {/* Need Types */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaTags className="mr-2 text-orange-500" />
                        Need Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNeed.needTypes?.map((type) => (
                          <span
                            key={type}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                          >
                            {type === "money" ? (
                              <FaMoneyBillWave className="mr-1" />
                            ) : (
                              <FaBoxOpen className="mr-1" />
                            )}
                            {type}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right Column - Supporting Information */}
                  <div className="space-y-6">
                    {/* Beneficiary Info */}
                    <section className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaUsers className="mr-2 text-purple-500" />
                        Beneficiary Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-xs">
                          <p className="text-sm text-gray-500">
                            Number of Beneficiaries
                          </p>
                          <p className="font-medium text-lg">
                            {
                              selectedNeed.beneficiaryInfo
                                ?.numberOfBeneficiaries
                            }
                          </p>
                        </div>
                        {selectedNeed.beneficiaryInfo?.location && (
                          <div className="bg-white p-3 rounded-lg shadow-xs">
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">
                              {selectedNeed.beneficiaryInfo.location.address}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Images Gallery */}
                    {selectedNeed.beneficiaryInfo.pictures?.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <FaImages className="mr-2 text-green-500" />
                          Gallery
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedNeed.beneficiaryInfo.pictures.map(
                            (pic, index) => (
                              <div
                                key={index}
                                className="rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer relative group"
                              >
                                <img
                                  src={`http://localhost:5000/uploads/${pic.replace(
                                    /\\/g,
                                    "/"
                                  )}`}
                                  alt={`Need ${index + 1}`}
                                  className="w-full h-28 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    )}

                    {/* Material Needs */}
                    {selectedNeed.categories?.material?.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <FaBoxes className="mr-2 text-amber-500" />
                          Material Needs
                        </h3>
                        <div className="space-y-3">
                          {selectedNeed.categories.material.map(
                            (category, index) => (
                              <div
                                key={index}
                                className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs hover:shadow-sm transition-shadow"
                              >
                                <p className="font-medium text-gray-800">
                                  {category.categoryName} (
                                  {category.subCategoryName})
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-semibold">
                                    Amount needed:
                                  </span>{" "}
                                  {category.targetAmountNeeded}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    )}

                    {/* Service Needs */}
                    {selectedNeed.categories?.service?.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <FaHandsHelping className="mr-2 text-teal-500" />
                          Service Needs
                        </h3>
                        <div className="space-y-3">
                          {selectedNeed.categories.service.map(
                            (category, index) => (
                              <div
                                key={index}
                                className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs hover:shadow-sm transition-shadow"
                              >
                                <p className="font-medium text-gray-800">
                                  {category.categoryName} (
                                  {category.subCategoryName})
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-semibold">
                                    Vacancy:
                                  </span>{" "}
                                  {category.vacancy}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t flex justify-end space-x-3">
                  <button
                    onClick={closeDetailsModal}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium flex items-center"
                  >
                    <FaTimes className="mr-2" /> Close
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
