import React, { useState } from "react";

const ngoData = {
  name: "Helping Hands NGO",
  email: "contact@helpinghands.org",
  donations: [
    {
      id: 1,
      donor: "John Doe",
      amount: "5000 ETB",
      type: "money",
      status: "Completed",
    },
    {
      id: 2,
      donor: "Jane Smith",
      item: "50 Jackets",
      type: "items",
      status: "Pending",
    },
  ],
  serviceApplications: [
    { id: 1, name: "Samuel Tesfaye", role: "Teaching" },
    { id: 2, name: "Martha Tadesse", role: "Medical Aid" },
  ],
};

const DonationsList = () => {
  const [selectedCategory, setSelectedCategory] = useState("money");

  // Filter data based on selected category
  const getDonationsByType = () => {
    if (selectedCategory === "money") {
      return ngoData.donations.filter((donation) => donation.type === "money");
    }
    if (selectedCategory === "items") {
      return ngoData.donations.filter((donation) => donation.type === "items");
    }
    if (selectedCategory === "service") {
      return ngoData.serviceApplications;
    }
    return [];
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-white sticky top-0 w-full text-gray-800 py-4 flex justify-center gap-6 shadow-md">
        <button
          onClick={() => setSelectedCategory("money")}
          className={`flex items-center p-2 rounded transition-colors ${
            selectedCategory === "money" ? "bg-yellow-400" : "hover:bg-gray-100"
          }`}
        >
          <span className="font-semibold">Money Donations</span>
        </button>
        <button
          onClick={() => setSelectedCategory("items")}
          className={`flex items-center p-2 rounded transition-colors ${
            selectedCategory === "items" ? "bg-yellow-400" : "hover:bg-gray-100"
          }`}
        >
          <span className="font-semibold">Materials Donated</span>
        </button>
        <button
          onClick={() => setSelectedCategory("service")}
          className={`flex items-center p-2 rounded transition-colors ${
            selectedCategory === "service"
              ? "bg-yellow-400"
              : "hover:bg-gray-100"
          }`}
        >
          <span className="font-semibold">Service Applications</span>
        </button>
      </nav>

      {/* Display List */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 capitalize">
          {selectedCategory} Donations
        </h2>
        <div className="mt-4">
          {getDonationsByType().length > 0 ? (
            getDonationsByType().map((donation) => (
              <div
                key={donation.id}
                className="p-4 bg-white shadow rounded-lg mt-2"
              >
                {selectedCategory === "service" ? (
                  <>
                    <p className="font-medium">{donation.name}</p>
                    <p className="text-gray-600">{donation.role}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">{donation.donor} donated</p>
                    <p className="text-gray-600">
                      {donation.type === "money"
                        ? donation.amount
                        : donation.item}
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
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No donations available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationsList;
