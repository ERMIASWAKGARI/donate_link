import { useEffect, useState } from "react";
import { Frown } from "lucide-react";
import DonationFilter from "./DonationFilter";
import DonationCard from "./DonationCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilteredNeeds } from "../../../redux/needSlice";
import NeedDetail from "./NeedDetail";
const DonationsPage = () => {
  const [selectedNeed, setSelectedNeed] = useState(null);
  const dispatch = useDispatch();
  const { needs, loading, error, pagination } = useSelector(
    (state) => state.needs
  );
  const categories = ["material", "Food", "Emergency", "Education", "Clothing"];

  useEffect(() => {
    dispatch(fetchFilteredNeeds({}));
  }, [dispatch]);

  const handlePageChange = (page) => {
    dispatch(fetchFilteredNeeds({ page }));
  };
  const handleDonateClick = (donation) => {
    setSelectedNeed(donation);
  };

  const handleSeeMoreClick = (donation) => {
    setSelectedNeed(donation);
  };

  const closeModal = () => {
    setSelectedNeed(null);
  };
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 bg-white rounded-b-lg shadow">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
        <Frown size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">
          Error loading donations
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <DonationFilter categories={categories} />

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {pagination.totalItems}{" "}
          {pagination.totalItems === 1 ? "Result" : "Results"} Found
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {needs.length > 0 ? (
          needs.map((donation) => (
            <DonationCard
              key={donation._id}
              donation={donation}
              onDonate={() => handleDonateClick(donation)}
              onSeeMore={() => handleSeeMoreClick(donation)}
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

      {pagination.totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-full ${
                    pagination.currentPage === page
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
        </div>
      )}
      {selectedNeed && <NeedDetail need={selectedNeed} onClose={closeModal} />}
    </div>
  );
};

export default DonationsPage;
