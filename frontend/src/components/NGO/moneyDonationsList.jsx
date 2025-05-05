import { useState } from "react";
import { FaEye, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { FiCheckCircle, FiLoader, FiXCircle } from "react-icons/fi";
import Modal from "react-modal";

Modal.setAppElement("#root");

const MoneyDonationsTable = ({ donations, loading }) => {
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const openDonationDetails = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDonation(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(donations.length / itemsPerPage);
  const paginatedDonations = donations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FiLoader className="animate-spin text-primary text-3xl" />
        <span className="ml-3 text-gray-600">Loading donations...</span>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FaDonate className="inline-block text-4xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-1">
          No money donations received yet
        </h3>
        <p className="text-gray-500">
          This need hasn't received any monetary donations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Donor Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedDonations.map((donation) => (
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
                    {donation.donorId?.address || "Not specified"}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  ${donation.amount?.toFixed(2) || "0.00"}
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
                  title="View details"
                >
                  <FaEye className="text-lg" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      {donations.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-4 px-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Donation Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Money Donation Details"
        className="bg-white overflow-y-auto rounded-lg shadow-xl max-w-2xl w-full z-50 mx-auto p-6 relative max-h-[90vh]"
        overlayClassName="fixed inset-0 bg-white/30 bg-opacity-20 flex items-center justify-center p-4 z-50"
      >
        {selectedDonation && (
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Money Donation Details
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
                      {selectedDonation.donorId?.address ||
                        "Address not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Donation Details
                  </h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center mb-2">
                      {getStatusIcon(selectedDonation.status)}
                      <span className="ml-2 font-medium">
                        Status: {selectedDonation.status}
                      </span>
                    </div>
                    <p className="font-medium">
                      Amount: ${selectedDonation.amount?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-gray-600 mt-2">
                      Date:{" "}
                      {new Date(
                        selectedDonation.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
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

              {selectedDonation.transactionId && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Transaction ID
                  </h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-700 font-mono">
                      {selectedDonation.transactionId}
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

export default MoneyDonationsTable;
