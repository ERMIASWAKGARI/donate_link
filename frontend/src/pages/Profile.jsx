const Profile = ({ user, volunteerApplication }) => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-yellow-100"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 border-4 border-yellow-100">
            {user.name.charAt(0)}
          </div>
        )}
        <h2 className="mt-4 text-2xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-600 capitalize">
          {user.role.replace("_", " ")}
        </p>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Contact Information
        </h3>
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {user.email}
          </p>
          {user.phone && (
            <p className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {user.phone}
            </p>
          )}
          {user.address && (
            <p className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-gray-500 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {[user.address.city, user.address.region, user.address.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Volunteer Application Details */}
      {volunteerApplication && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Application Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Message</p>
              <p className="text-gray-700">
                {volunteerApplication.message || "No message provided"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-gray-700">
                  {volunteerApplication?.categoryName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subcategory</p>
                <p className="text-gray-700">
                  {volunteerApplication?.subCategoryName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className="text-gray-700">
                  {new Date(
                    volunteerApplication.startDate
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(volunteerApplication.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours/Week</p>
                <p className="text-gray-700">
                  {volunteerApplication.hoursPerWeek}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Skills */}
      {user.skills && user.skills.length > 0 && (
        <div className="p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Volunteer Availability */}
      {user.availability && user.availability.length > 0 && (
        <div className="p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Availability
          </h3>
          <div className="space-y-2">
            {user.availability.map((slot, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{slot.day}</span>
                <span className="text-gray-600">
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
