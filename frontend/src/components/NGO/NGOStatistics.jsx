import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import axios from "../../config/axiosConfig";

const NGOStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get("/donation/statistics"); // Adjust if route differs
        setStatistics(response.data);
      } catch (err) {
        setError("Failed to load statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const donationData = {
    labels:
      statistics?.donationTrends?.map((d) => {
        const [year, month] = d.month.split("-");
        const date = new Date(`${year}-${month}-01`);
        return date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      }) || [],
    datasets: [
      {
        label: "Material Donations (items)",
        data: statistics?.donationTrends?.map((d) => d.quantity) || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  if (loading)
    return <div className="text-center mt-10">Loading statistics...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="ngo-statistics p-6">
      <h2 className="text-2xl font-bold text-center mb-6">NGO Statistics</h2>
      <div className="statistics-container flex flex-wrap gap-6 justify-center">
        <StatCard
          title="Monetary Donations"
          value={statistics.monetaryDonations}
        />
        <StatCard
          title="Material Donations"
          value={`${statistics.materialDonations} items`}
        />
        <StatCard
          title="Volunteer Service Hours"
          value={`${statistics.volunteerServiceHours} hours`}
        />
        <StatCard
          title="Beneficiaries Reached"
          value={`${statistics.beneficiariesReached} people`}
        />
        <StatCard
          title="Total Needs Posted"
          value={statistics.totalNeedsPosted}
        />
      </div>

      <div className="graph-container mt-10">
        <h3 className="text-xl font-semibold text-center mb-4">
          Donations Over Time
        </h3>
        {statistics.donationTrends.length === 0 ? (
          <p className="text-center text-gray-500">
            No donation data available.
          </p>
        ) : (
          <Bar data={donationData} />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="stat-card border border-gray-300 rounded-lg p-4 shadow-md flex-1 max-w-xs text-center">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export default NGOStatistics;
