import React from "react";

function VolunteerApplication({ volunteers }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Volunteers Applied
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {volunteers.map((volunteer) => (
          <div key={volunteer.id} className="p-4 bg-white shadow rounded-lg">
            <p className="font-medium">{volunteer.name}</p>
            <p className="text-gray-600">{volunteer.role}</p>
            <button className="mt-2 px-3 py-1 bg-yellow-400 text-black cursor-pointer rounded hover:bg-yellow-600">
              Contact
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VolunteerApplication;
