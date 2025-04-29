import { useState, useContext, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import NgoNeedForm from "./PostNeedsForm";
import Axios from "../../config/axiosConfig";
import { UserContext } from "../../context/UserContext";
import NeedsList from "./NeedsList";
import Pagination from "./Pagination"; // Import the custom Pagination component
import NeedModal from "./NeedModal";
import { Spin } from "antd";

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

      // Reset to first page when adding a new need
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
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
  const handleNeedDeleted = (deletedNeedId) => {
    setNeeds((prevNeeds) =>
      prevNeeds.filter((need) => need._id !== deletedNeedId)
    );
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedNeed(null);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <Spin size="large" />
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
            <NeedsList
              needs={needs}
              openDetailsModal={openDetailsModal}
              onNeedDeleted={handleNeedDeleted}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                current={currentPage}
                total={totalItems}
                pageSize={itemsPerPage}
                onChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Need Details Modal */}
        {/* Need Details Modal - Enhanced Version */}
        {showDetailsModal && selectedNeed && (
          <NeedModal
            showDetailsModal={showDetailsModal}
            setShowDetailsModal={setShowDetailsModal}
            selectedNeed={selectedNeed}
            setSelectedNeed={setSelectedNeed}
            closeDetailsModal={closeDetailsModal}
          />
        )}
      </div>
    </div>
  );
}

export default PostedNeeds;
