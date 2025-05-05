import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/api";

export default function UnsubscribePage() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribeUser = async () => {
      try {
        if (!email) {
          throw new Error("No email provided for unsubscribe");
        }

        const response = await axiosInstance.put(
          `/subscriber/unsubscribe/${email}`
        );

        if (response.data.success) {
          setSuccess(true);
          setMessage(response.data.message);
        } else {
          setSuccess(false);
          setMessage(response.data.message || "Unsubscribe failed");
        }
      } catch (err) {
        console.error("Unsubscribe error:", err);
        setSuccess(false);
        setMessage(
          err.response?.data?.message ||
            "Failed to unsubscribe. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    unsubscribeUser();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-700 text-lg">
          Processing unsubscribe request...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <div
            className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
              success ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {success ? (
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {success ? "Unsubscribe Successful" : "Unsubscribe Failed"}
          </h3>

          <p className="text-gray-600 mb-6">{message}</p>

          <button
            onClick={() => navigate("/")}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
