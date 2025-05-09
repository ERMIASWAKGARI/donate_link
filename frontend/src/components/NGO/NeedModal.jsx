import {
  FaTimes,
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
const NeedModal = ({
  // eslint-disable-next-line react/prop-types
  selectedNeed,
  // eslint-disable-next-line react/prop-types
  closeDetailsModal,
}) => {
  return (
    <>
      <div className="fixed inset-0 bg-white/30 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
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
                        ? "bg-green-100 text-[#008080]"
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
                        : "bg-green-100 text-[#008080]"
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
                      <p className="text-3xl font-bold text-[#008080]">
                        {selectedNeed.targetMoney.toLocaleString()} ETB
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
                        className="bg-blue-100 text-[#008080] px-3 py-1 rounded-full text-sm font-medium flex items-center"
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
                    <FaUsers className="mr-2 text-[#008080]" />
                    Beneficiary Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-xs">
                      <p className="text-sm text-gray-500">
                        Number of Beneficiaries
                      </p>
                      <p className="font-medium text-lg">
                        {selectedNeed.beneficiaryInfo?.numberOfBeneficiaries}
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
                            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
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
                              <span className="font-semibold">Vacancy:</span>{" "}
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
    </>
  );
};
export default NeedModal;
