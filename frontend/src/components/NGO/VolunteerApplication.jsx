import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { useUser } from "../../context/UserContext";
import Profile from "../../pages/Profile";
import ChatModal from "../ChatModal";

function VolunteerApplication() {
  const [loading, setLoading] = useState(true);
  const [serviceNeeds, setServiceNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const { user } = useUser();
  const ngoId = user._id;
  const [profileLoading, setProfileLoading] = useState(false);
  const [volunteerDetails, setVolunteerDetails] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  // Update the handleViewProfile function
  const handleViewProfile = async (volunteer) => {
    try {
      setProfileLoading(true);
      setSelectedVolunteer(volunteer);

      // Fetch the full user details
      const response = await axiosInstance.get(
        `/users/${volunteer.donorId._id}`
      );
      console.log("Volunteer details:", response.data.data);

      setVolunteerDetails(response.data.data);

      setShowProfileModal(true);
    } catch (error) {
      console.error("Error fetching volunteer details:", error);
    } finally {
      setProfileLoading(false);
    }
  };
  useEffect(() => {
    const fetchServiceNeeds = async () => {
      try {
        const response = await axiosInstance.get("donation/services");
        setLoading(false);
        if (response.data.success) {
          setServiceNeeds(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching service needs:", error);
        setLoading(false);
      }
    };

    fetchServiceNeeds();
  }, []);

  const fetchVolunteers = async (needId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `donation/service/${ngoId}/${needId}`
      );
      setVolunteers(response.data.donations || []);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNeedChange = (event) => {
    const needId = event.target.value;
    setSelectedNeed(needId);
    if (needId) fetchVolunteers(needId);
  };

  const handleAccept = async (volunteerId) => {
    try {
      const response = await axiosInstance.post(
        `donation/accept/${volunteerId}`
      );
      if (response.data.success) {
        if (selectedNeed) fetchVolunteers(selectedNeed);
      }
    } catch (error) {
      console.error("Error accepting volunteer:", error);
    }
  };

  const handleReject = async (volunteerId) => {
    try {
      const response = await axiosInstance.post(
        `donation/reject/${volunteerId}`
      );
      if (response.data.success) {
        if (selectedNeed) fetchVolunteers(selectedNeed);
      }
    } catch (error) {
      console.error("Error rejecting volunteer:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Volunteer Management
        </h1>

        <div className="mb-8">
          <label
            htmlFor="service-need"
            className="block text-lg font-semibold text-gray-700 mb-3"
          >
            Select Service Need
          </label>
          <select
            id="service-need"
            value={selectedNeed}
            onChange={handleNeedChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="">-- Select a service need --</option>
            {serviceNeeds.map((need) => (
              <option key={need._id} value={need._id}>
                {need.title} ({need.urgencyLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedNeed && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Volunteer Applications
            </h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {volunteers.length}{" "}
              {volunteers.length === 1 ? "application" : "applications"}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : volunteers.length > 0 ? (
            <div className="space-y-4">
              {volunteers.map((volunteer) => (
                <div
                  key={volunteer._id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        {volunteer.donorId.name}
                        <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {volunteer.services[0].categoryName}
                        </span>
                      </h3>
                      <p className="text-gray-600 mt-1">{volunteer.message}</p>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Subcategory:</span>
                          <span className="ml-2 font-medium">
                            {volunteer.services[0].subCategoryName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-2 font-medium">
                            {new Date(
                              volunteer.services[0].startDate
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              volunteer.services[0].endDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Hours/Week:</span>
                          <span className="ml-2 font-medium">
                            {volunteer.services[0].hoursPerWeek}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className="ml-2 font-medium capitalize">
                            {volunteer.status || "pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0">
                      <button
                        onClick={() => handleViewProfile(volunteer)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Profile
                      </button>
                      <button
                        onClick={() => setShowChatModal(true)}
                        className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition flex items-center justify-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2 0v10h12V5H4zm3 3h6v2H7V8zm0 4h4v2H7v-2z" />
                        </svg>
                        Contact
                      </button>
                      <button
                        onClick={() => handleAccept(volunteer._id)}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(volunteer._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No applications yet
              </h3>
              <p className="mt-1 text-gray-500">
                Volunteers haven't applied to this need yet. Check back later.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 border border-gray-100 transform transition-all duration-300 scale-95 hover:scale-100">
            <button
              onClick={() => {
                setShowProfileModal(false);
                setVolunteerDetails(null);
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
              {profileLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
              ) : volunteerDetails ? (
                <Profile
                  user={volunteerDetails}
                  // volunteerApplication={selectedVolunteer}
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Failed to load profile details
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal
          onClose={() => setShowChatModal(false)}
          showChatModal={showChatModal}
        />
      )}
    </div>
  );
}

export default VolunteerApplication;
