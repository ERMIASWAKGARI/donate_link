import React from "react";

function DonationsList({ donations }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Received Donations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {donations.map((donation) => (
          <div key={donation.id} className="p-4 bg-white shadow rounded-lg">
            <p className="font-medium">{donation.donor} donated</p>
            <p className="text-gray-600">
              {donation.type === "money"
                ? `${donation.amount}`
                : `${donation.item}`}
            </p>
            <p
              className={`text-sm font-semibold ${
                donation.status === "Completed"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {donation.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonationsList;
