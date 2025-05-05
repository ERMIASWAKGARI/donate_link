import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import NewsletterForm from "./NewsletterForm";
import ContentPreview from "./ContentPreview";
import axiosInstance from "../../../api/api";
import Table from "../../../ui/table";
import Modal from "../../../ui/modal";
import { FaEdit, FaRegTrashAlt, FaPaperPlane } from "react-icons/fa";
import Pagination from "../../../ui/pagination";
import { toast } from "react-toastify";

export default function NewsletterManager() {
  const columns = ["SUBJECT", "CONTENT", "STATUS", "RECIPIENTS", "ACTION"];

  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [query, setQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [newsletterToSend, setNewsletterToSend] = useState(null);
  const [sending, setSending] = useState(false);

  const fetchNewsletters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await axiosInstance.get("/newsletters", {
        params: { page, limit, search: query },
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseData = res.data;
      setNewsletters(responseData.data || []);
      setTotalPages(responseData.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Error fetching newsletters");
      setNewsletters([]);

      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
    } else {
      fetchNewsletters();
    }
  }, [page, query, limit]);

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("accessToken");
        await axiosInstance.delete(`/newsletters/${confirmDelete}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await fetchNewsletters();
        setConfirmDelete(null);
        toast.success("Newsletter deleted successfully");
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting newsletter");
        toast.error(err.response?.data?.message || "Error deleting newsletter");
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      }
    }
  };

  const handleSendConfirmation = (id) => {
    setNewsletterToSend(id);
  };

  const handleSend = async () => {
    if (newsletterToSend) {
      setSending(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axiosInstance.post(
          `/newsletters/${newsletterToSend}/send`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await fetchNewsletters();
        setNewsletterToSend(null);
        toast.success(response.data.message || "Newsletter sent successfully");
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error sending newsletter";
        setError(errorMessage);
        toast.error(errorMessage);

        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      } finally {
        setSending(false);
      }
    }
  };

  const handleEdit = (id) => {
    setSelectedId(id);
  };

  const handleCloseModal = () => {
    setSelectedId(null);
    setIsCreating(false);
    setConfirmDelete(null);
    setNewsletterToSend(null);
  };

  const handleUpdate = () => {
    fetchNewsletters();
  };

  const [mappedNewsletters, setMappedNewsletters] = useState([]);

  useEffect(() => {
    const mapped = newsletters.map((newsletter) => ({
      SUBJECT: newsletter.subject,
      STATUS: (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            newsletter.status === "sent"
              ? "bg-green-100 text-green-800"
              : newsletter.status === "scheduled"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {newsletter.status?.toUpperCase() || "DRAFT"}
        </span>
      ),
      CONTENT: <ContentPreview content={newsletter.content} maxLength={150} />,
      RECIPIENTS: newsletter.recipients?.length || 0,
      ACTION: (
        <Action
          newsletterId={newsletter._id}
          status={newsletter.status}
          onDelete={() => setConfirmDelete(newsletter._id)}
          onEdit={handleEdit}
          onSend={() => handleSendConfirmation(newsletter._id)}
        />
      ),
    }));
    setMappedNewsletters(mapped);
  }, [newsletters]);

  const handleCreate = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 mt-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Newsletter Management
        </h1>
        <button
          type="button"
          onClick={handleCreate}
          className="bg-primary h-min text-white px-4 py-2 rounded"
        >
          Create Newsletter
        </button>
      </div>

      <Table
        error={error}
        loading={loading}
        data={mappedNewsletters}
        columns={columns}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <Modal
        isOpen={isCreating || selectedId !== null}
        onClose={handleCloseModal}
      >
        <NewsletterForm
          mode={isCreating ? "create" : "edit"}
          newsletterId={selectedId}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      </Modal>

      <Modal isOpen={confirmDelete !== null} onClose={handleCloseModal}>
        <div className="p-8 dark:bg-darkCard rounded bg-white">
          <p>Are you sure you want to delete this newsletter?</p>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Yes, Delete
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={newsletterToSend !== null} onClose={handleCloseModal}>
        <div className="p-8 dark:bg-darkCard rounded bg-white">
          <p>Are you sure you want to send this newsletter?</p>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={handleSend}
              className={`bg-teal-700 text-white px-4 py-2 rounded ${
                sending ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={sending}
            >
              {sending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Yes, Send"
              )}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Action({ newsletterId, status, onDelete, onEdit, onSend }) {
  return (
    <div className="flex items-center gap-3 justify-center mx-auto">
      {status === "draft" && (
        <FaPaperPlane
          onClick={() => onSend(newsletterId)}
          className="cursor-pointer text-blue-500 hover:text-blue-700"
          title="Send"
        />
      )}
      <FaEdit
        onClick={() => onEdit(newsletterId)}
        className="cursor-pointer text-ternary hover:text-primary"
        title="Edit"
      />
      <FaRegTrashAlt
        onClick={onDelete}
        className="cursor-pointer text-red-500 hover:text-red-700"
        title="Delete"
      />
    </div>
  );
}

Action.propTypes = {
  newsletterId: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["draft", "scheduled", "sent"]).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
};
