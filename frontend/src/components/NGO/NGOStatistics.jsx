import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import axios from "../../config/axiosConfig";
import { Spin } from "antd";
import { Pie } from "react-chartjs-2";

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
  const moneyDonationData = {
    labels:
      statistics?.monetaryDonationsByCurrency?.map(
        (d) => `${d.currency} (${d.count})`
      ) || [],
    datasets: [
      {
        data:
          statistics?.monetaryDonationsByCurrency?.map((d) => d.total) || [],
        backgroundColor: [
          "rgba(0, 128, 0, 0.7)", // ETB - Green
          "rgba(0, 86, 179, 0.7)", // USD - Blue
          "rgba(153, 102, 255, 0.7)", // EUR - Purple
          "rgba(255, 159, 64, 0.7)", // GBP - Orange
        ],
        borderColor: [
          "rgba(0, 128, 0, 1)",
          "rgba(0, 86, 179, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Enhanced Service Applications Chart
  const serviceStatusData = {
    labels: statistics?.serviceApplicationsByStatus?.map((d) => d.status) || [],
    datasets: [
      {
        data:
          statistics?.serviceApplicationsByStatus?.map((d) => d.count) || [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)", // Submitted - Blue
          "rgba(255, 206, 86, 0.7)", // Under Review - Yellow
          "rgba(255, 159, 64, 0.7)", // Interview Scheduled - Orange
          "rgba(75, 192, 192, 0.7)", // Approved - Teal
          "rgba(153, 102, 255, 0.7)", // Accepted - Purple
          "rgba(0, 128, 0, 0.7)", // Completed - Green
          "rgba(199, 199, 199, 0.7)", // On Hold - Gray
          "rgba(255, 99, 132, 0.7)", // Rejected - Red
          "rgba(83, 102, 255, 0.7)", // Withdrawn - Indigo
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(0, 128, 0, 1)",
          "rgba(199, 199, 199, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(83, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const dataArr = ctx.chart.data.datasets[0].data;
          const sum = dataArr.reduce((a, b) => a + b, 0);
          const percentage = ((value * 100) / sum).toFixed(1) + "%";
          return percentage;
        },
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
      },
      legend: {
        position: "right",
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);

            // For money chart
            if (
              context.datasetIndex === 0 &&
              context.chart.data.labels[context.dataIndex].includes("ETB")
            ) {
              const currencyData = statistics.monetaryDonationsByCurrency.find(
                (d) => d.currency === "ETB"
              );
              return [
                `${label}`,
                `Total: ${currencyData.total.toLocaleString()} ETB`,
                `Transactions: ${currencyData.count}`,
                `Avg: ${currencyData.avgAmount.toFixed(2)} ETB`,
                `(${percentage}%)`,
              ];
            }

            // For service chart
            if (
              context.datasetIndex === 0 &&
              context.chart.id === "serviceChart"
            ) {
              const statusData = statistics.serviceApplicationsByStatus.find(
                (d) => d.status === context.label
              );
              return [
                `${label}: ${value}`,
                statusData.avgHours
                  ? `Avg Hours: ${statusData.avgHours.toFixed(1)}/week`
                  : "",
                `(${percentage}%)`,
              ];
            }

            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm w-full h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="ngo-statistics p-6 max-w-8xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">NGO Statistics</h2>

      <div className="statistics-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 lg:mx-auto place-items-center text-center">
        <StatCard
          title="Number of Material Donations"
          value={`${statistics.materialDonations}`}
          Icon={FaBoxOpen}
        />
        <StatCard
          title="Beneficiaries"
          value={`${statistics.beneficiariesReached}`}
          Icon={FaUsers}
        />
        <StatCard
          title="Needs Posted"
          value={statistics?.totalNeedsPosted}
          Icon={FaClipboardList}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Money Donations by Currency */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Money Donations by Currency
          </h3>
          {statistics?.monetaryDonationsByCurrency?.length > 0 ? (
            <div className="h-80">
              <Pie data={moneyDonationData} options={pieOptions} />
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">
              No monetary donation data available.
            </p>
          )}
        </div>

        {/* Service Applications by Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Service Applications by Status
          </h3>
          {statistics?.serviceApplicationsByStatus?.length > 0 ? (
            <div className="h-80">
              <Pie data={serviceStatusData} options={pieOptions} />
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">
              No service application data available.
            </p>
          )}
        </div>
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
