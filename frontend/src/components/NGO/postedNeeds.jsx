import { useState, useContext, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import NgoNeedForm from "./PostNeedsForm";
import Axios from "../../config/axiosConfig";
import { UserContext } from "../../context/UserContext";

function PostedNeeds() {
  const { user } = useContext(UserContext);
  const [needs, setNeeds] = useState([]);
  const [showNeedForm, setShowNeedForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch needs when component mounts
  useEffect(() => {
    fetchNeeds();
  }, []);

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Axios.get(`/donation/ngo/${user._id}`);
      setNeeds(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch needs"
      );
    } finally {
      setLoading(false);
    }
  };

  // PostedNeeds.js (updated handleAddNeed)
  const handleAddNeed = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // Standardized response handling

      // Handle both possible response structures
      const newNeed =
        formData.data.need || formData.data.data?.need || formData.data;

      if (!newNeed) {
        throw new Error("Invalid response structure from server");
      }

      setNeeds((prev) => [...prev, newNeed]);
      setShowNeedForm(false);
    } catch (err) {
      console.error("Error adding need:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to post need"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNeed = async (needId) => {
    try {
      setLoading(true);
      setError(null);
      await Axios.delete(`/needs/${needId}`);
      setNeeds((prev) => prev.filter((need) => need._id !== needId));
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete need"
      );
    } finally {
      setLoading(false);
    }
  };

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
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {needs.map((need) => (
            <div
              key={need._id}
              className="p-4 bg-white shadow rounded-lg relative"
            >
              <button
                onClick={() => handleDeleteNeed(need._id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete need"
                disabled={loading}
              >
                <FaTrash />
              </button>
              <h3 className="font-bold text-lg">{need.title || "Untitled"}</h3>
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
              <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostedNeeds;
