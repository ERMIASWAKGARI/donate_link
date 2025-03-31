import { useState } from "react";
import { Link } from "react-router-dom";

import { PlusCircle, Frown } from "lucide-react";
import DonationFilter from "../../../pages/Donor/IndividualDonor/DonationFilter";
import DonationCard from "../../../pages/Donor/IndividualDonor/DonationCard";

import ERCS from "../../../assets/redcross.jpg";
import meseret from "../../../assets/meseret.jpg";
import save from "../../../assets/savethechildren.jpg";
import mekedonia from "../../../assets/mekedonia.jpg";

const DonationsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["Medical", "Food", "Emergency", "Education", "Clothing"];

  const donations = [
    {
      id: 1,
      organization: "Ethiopian Red Cross Society (ERCS)",
      description:
        "Emergency medical supplies and food kits for flood-affected regions in Ethiopia.",
      category: "Emergency",
      image: ERCS,
      location: "Gamo Gofa, Geyo",
      urgency: "high",
    },
    {
      id: 2,
      organization: "Meseret Humanitarian Organization (MHO)",
      description:
        "Providing emergency medical supplies and food kits for flood-affected communities.",
      category: "Medical",
      image: meseret,
      location: "Gambella Region",
      urgency: "medium",
    },
    {
      id: 3,
      organization: "Save the Children Ethiopia",
      description:
        "Education supplies and nutrition support for children in drought-affected areas.",
      category: "Education",
      image: save,
      location: "Addis Ababa, Lafto",
      urgency: "low",
    },
    {
      id: 4,
      organization: "Mekedonia Ethiopia",
      description:
        "The purpose of Mekedonia Homes is to support the elderly and people with Mental disabilities.",
      category: "Clothing",
      image: mekedonia,
      location: "Addis Ababa, Mekanisa",
      urgency: "high",
    },
    {
      id: 5,
      organization: "Hope for Women Foundation",
      description:
        "Clothes for women and children affected by displacement in rural Ethiopia.",
      category: "Clothing",
      image: meseret,
      location: "Dire Dawa",
      urgency: "high",
    },
    {
      id: 6,
      organization: "ERCS Food Relief Program",
      description:
        "Emergency food supplies for drought-affected communities in Oromia region.",
      category: "Food",
      image: ERCS,
      location: "Jimma zone, Beshasha",
      urgency: "high",
    },
    {
      id: 7,
      organization: "Mekedonia Ethiopia",
      description:
        "The purpose of Mekedonia Homes is to support the elderly and people with Mental disabilities.",
      category: "Clothing",
      image: mekedonia,
      location: "Addis Ababa, Mekanisa",
      urgency: "high",
    },
  ];

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || donation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDonate = (donationId) => {
    console.log("Donating to:", donationId);
    // Add your donation logic here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-8 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Make a Difference Today
        </h1>
        <p className="text-lg mb-6 max-w-2xl">
          Join thousands of donors supporting critical causes across Ethiopia
        </p>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-block bg-yellow-400 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
              {donations.length} Active Campaigns
            </span>
          </div>
          <Link
            to="/donation-form"
            className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-green-700 font-medium py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle className="mr-2" size={18} />
            Post Donation
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <DonationFilter
        categories={categories}
        onCategoryChange={(e) => setSelectedCategory(e.target.value)}
        onSearch={(e) => setSearchTerm(e.target.value)}
      />

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {filteredDonations.length}{" "}
          {filteredDonations.length === 1 ? "Result" : "Results"} Found
        </h2>
        <div className="text-sm text-gray-500">
          Sorted by:{" "}
          <span className="font-medium text-green-700">Most Urgent</span>
        </div>
      </div>

      {/* Donations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDonations.length > 0 ? (
          filteredDonations.map((donation) => (
            <DonationCard
              key={donation.id}
              organization={donation.organization}
              description={donation.description}
              image={donation.image}
              location={donation.location}
              urgency={donation.urgency}
              onDonate={() => handleDonate(donation.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <Frown size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No matching donations found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search filters or check back later for new
              donation opportunities.
            </p>
          </div>
        )}
      </div>

      {/* Load More Button (optional) */}
      {filteredDonations.length > 0 && (
        <div className="mt-10 text-center">
          <button className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 hover:bg-green-50 rounded-full font-medium transition">
            Load More Campaigns
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationsPage;
