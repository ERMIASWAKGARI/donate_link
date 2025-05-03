import { useState } from "react";
import AxiosInstance from "../../config/axiosConfig";
import { FiLoader, FiCheckCircle } from "react-icons/fi";

const StatusUpdateButton = ({ donationId, currentStatus, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusUpdate = async () => {
    if (currentStatus !== "pending") return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await AxiosInstance.put(
        `/donation/updateStatus/${donationId}`,
        { status: "completed" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.status === "success") {
        onUpdate(donationId, "Completed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
      console.error("Status update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleStatusUpdate}
        disabled={currentStatus !== "pending" || isUpdating}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentStatus !== "pending"
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-green-100 text-green-800 hover:bg-green-200"
        } transition-colors flex items-center`}
      >
        {isUpdating ? (
          <>
            <FiLoader className="animate-spin mr-1" />
            Updating...
          </>
        ) : (
          <>
            <FiCheckCircle className="mr-1" />
            Mark as Completed
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default StatusUpdateButton;
