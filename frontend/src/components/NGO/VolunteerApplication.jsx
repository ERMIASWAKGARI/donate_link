// components/applications/ApplicationsDashboard.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DataTable from "../../ui/DataTable";
import Badge from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import ApplicationDetailModal from "./ApplicationDetailModal";
import NeedsSelector from "./NeedsSelector";

const VolunteerApplications = () => {
  const { ngoId } = useParams();
  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  // Fetch NGO needs
  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const { data } = await axios.get(`/api/ngos/${ngoId}/needs`);
        setNeeds(data.needs);
        if (data.needs.length > 0) {
          setSelectedNeed(data.needs[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch needs");
      }
    };
    fetchNeeds();
  }, [ngoId]);

  // Fetch applications when need changes
  useEffect(() => {
    if (!selectedNeed) return;

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `/api/needs/${selectedNeed}/applications`,
          {
            params: {
              status: filters.status !== "all" ? filters.status : undefined,
              search: filters.search || undefined,
            },
          }
        );
        setApplications(data.applications);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [selectedNeed, filters]);

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await axios.patch(`/api/applications/${applicationId}`, { status });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const bulkUpdateStatus = async (applicationIds, status) => {
    try {
      await axios.patch("/api/applications/bulk", {
        ids: applicationIds,
        status,
      });
      setApplications((prev) =>
        prev.map((app) =>
          applicationIds.includes(app._id) ? { ...app, status } : app
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to bulk update");
    }
  };

  const columns = [
    {
      header: "Volunteer",
      accessor: "volunteer",
      sortable: true,
      cell: ({ volunteer }) => (
        <div className="flex items-center">
          <Avatar src={volunteer.profilePicture} name={volunteer.name} />
          <div className="ml-3">
            <p className="font-medium text-gray-900">{volunteer.name}</p>
            <p className="text-sm text-gray-500">{volunteer.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Skills",
      accessor: "skills",
      cell: ({ skills }) => (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 3).map((skill) => (
            <Badge key={skill} color="blue">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge color="gray">+{skills.length - 3}</Badge>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      cell: ({ status }) => (
        <Badge
          color={
            status === "approved"
              ? "green"
              : status === "rejected"
              ? "red"
              : "yellow"
          }
        >
          {status}
        </Badge>
      ),
    },
    {
      header: "Applied",
      accessor: "appliedAt",
      sortable: true,
      cell: ({ appliedAt }) => new Date(appliedAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateApplicationStatus(row._id, "approved");
            }}
            className="text-green-600 hover:text-green-900"
            disabled={row.status === "approved"}
          >
            Approve
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateApplicationStatus(row._id, "rejected");
            }}
            className="text-red-600 hover:text-red-900"
            disabled={row.status === "rejected"}
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  const bulkActions = [
    {
      label: "Approve Selected",
      action: (ids) => bulkUpdateStatus(ids, "approved"),
    },
    {
      label: "Reject Selected",
      action: (ids) => bulkUpdateStatus(ids, "rejected"),
    },
  ];

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Volunteer Applications
          </h1>

          <NeedsSelector
            needs={needs}
            selectedNeed={selectedNeed}
            onSelectNeed={setSelectedNeed}
          />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search volunteers..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <select
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No applications found for this need</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={applications}
            onRowClick={setSelectedApplication}
            selectable
            bulkActions={bulkActions}
          />
        )}
      </div>

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusUpdate={updateApplicationStatus}
        />
      )}
    </div>
  );
};

export default VolunteerApplications;
