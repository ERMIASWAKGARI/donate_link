import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import axios from "../../config/axiosConfig";
import { Spin } from "antd";
// Icon imports
import {
  FaHandHoldingUsd,
  FaBoxOpen,
  FaUserClock,
  FaUsers,
  FaClipboardList,
} from "react-icons/fa";

const NGOStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const donationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12,
          },
          padding: 10,
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: (context) => {
            if (context.tick.value === 0) {
              return "rgba(0, 0, 0, 0.1)";
            }
            return "rgba(0, 0, 0, 0.05)";
          },
        },
        ticks: {
          stepSize: statistics?.donationTrends?.length === 1 ? 1 : undefined,
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#008080",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        cornerRadius: 4,
        displayColors: false,
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: "bottom",
      },
    },
    barPercentage: 0.6, // Adjusts the width of the bars (0.1 to 1)
    categoryPercentage: 0.8, // Adjusts the space between categories (0.1 to 1)
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get("/donation/statistics");
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
        label: "Material Donations",
        data: statistics?.donationTrends?.map((d) => d.quantity) || [],
        backgroundColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          const max = Math.max(...context.dataset.data);
          const ratio = value / max;
          return `rgba(0, 128, 128, ${0.4 + ratio * 0.6})`; // Dynamic opacity
        },
        hoverBackgroundColor: "#008080",
        borderColor: "#008080",
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <Spin size="large" />
      </div>
    );
  }

  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="ngo-statistics p-6 max-w-8xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">NGO Statistics</h2>

      <div className="statistics-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Monetary Donations"
          value={statistics.monetaryDonations?.toFixed(2)}
          Icon={FaHandHoldingUsd}
        />
        <StatCard
          title="Number of Material Donations"
          value={`${statistics.materialDonations} `}
          Icon={FaBoxOpen}
        />
        <StatCard
          title="Volunteer Hours"
          value={`${statistics.volunteerServiceHours} hrs`}
          Icon={FaUserClock}
        />
        <StatCard
          title="Beneficiaries"
          value={`${statistics.beneficiariesReached}`}
          Icon={FaUsers}
        />
        <StatCard
          title="Needs Posted"
          value={statistics.totalNeedsPosted}
          Icon={FaClipboardList}
        />
      </div>

      <div className="graph-container bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Donations Over Time</h3>
        {statistics.donationTrends.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No donation data available.
          </p>
        ) : (
          <div className="h-80">
            <Bar options={donationOptions} data={donationData} height={320} />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, Icon }) => (
  <div className="stat-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-teal-50 rounded-full">
        <Icon className="text-teal-600 text-lg" />
      </div>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
    </div>
    <p className="text-2xl font-bold text-[#008080] pl-11">{value}</p>
  </div>
);

export default NGOStatistics;
