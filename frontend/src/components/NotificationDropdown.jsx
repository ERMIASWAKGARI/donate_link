import { useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertCircle } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useClickOutside } from "../hooks/useClickOutside";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = ({ onNotificationClick }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    activeTab,
    changeTab,
    loadMore,
    pagination,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  // Add this useEffect to handle real-time badge updates
  useEffect(() => {
    console.log(`[Dropdown] Unread count updated to: ${unreadCount}`);
  }, [unreadCount]);

  // Modify the markAllAsRead handler
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      console.log("[Dropdown] Marking all as read");
      await markAllAsRead();
      // No need to manually update unreadCount here - it's handled by the context
    } catch (error) {
      console.error("[Dropdown] Error marking all as read:", error);
      setError(
        error.response?.status === 500
          ? "Couldn't confirm read status with server"
          : "Failed to mark notifications as read"
      );
      setTimeout(() => setError(null), 5000);
    }
  }, [markAllAsRead]);
  // Enhanced fetch with error handling
  const loadNotifications = useCallback(async () => {
    setError(null);
    try {
      await fetchNotifications();
    } catch (err) {
      console.error("Notification fetch error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        setError("Failed to load notifications. Please try again.");
      }
    }
  }, [fetchNotifications, navigate]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
        .then((permission) => {
          console.log("Notification permission:", permission);
        })
        .catch(console.error);
    }
  }, []);

  // Mark all as read when dropdown opens with error handling
  // const handleMarkAllAsRead = useCallback(async () => {
  //   try {
  //     await markAllAsRead();
  //   } catch (error) {
  //     setError(
  //       error.response?.status === 500
  //         ? "Couldn't confirm read status with server, but marked locally"
  //         : "Failed to mark notifications as read"
  //     );
  //     setTimeout(() => setError(null), 5000);
  //   }
  // }, [markAllAsRead]);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      handleMarkAllAsRead();
    }
  }, [isOpen, unreadCount, handleMarkAllAsRead]);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleToggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
    onNotificationClick?.();
  }, [onNotificationClick]);

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSingleNotificationClick = useCallback(
    async (notification) => {
      if (!notification.seen) {
        try {
          await markAsRead(notification._id);
        } catch (err) {
          console.error("Mark as read error:", err);
          if (err.response?.status === 401) {
            localStorage.removeItem("accessToken");
            navigate("/login");
          }
        }
      }
    },
    [markAsRead, navigate]
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Icon with Count Badge */}
      <motion.button
        className="relative p-2 hover:text-yellow-400 transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggleDropdown}
        aria-label="Notifications"
      >
        <Bell size={20} className="text-current" />
        {/* Only show badge if dropdown is closed and there are unread notifications */}
        {!isOpen && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({unreadCount} unread)
                  </span>
                )}
              </h3>
              <div className="flex space-x-2 items-center">
                <button
                  type="button"
                  onClick={handleCloseDropdown}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Close notifications"
                  title="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tab selector */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === "all"
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                onClick={() => changeTab("all")}
              >
                All
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === "unread"
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                onClick={() => changeTab("unread")}
              >
                Unread
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              ) : error ? (
                <div className="p-4 flex flex-col items-center text-center text-red-500">
                  <AlertCircle className="mb-2" />
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={loadNotifications}
                    className="mt-2 text-sm text-blue-500 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No {activeTab === "unread" ? "unread" : ""} notifications yet
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                        !notification.seen
                          ? "bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() =>
                        handleSingleNotificationClick(notification)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {notification.message}
                        </p>
                        {!notification.seen && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </motion.div>
                  ))}
                  {pagination.hasMore && (
                    <button
                      onClick={loadMore}
                      className="w-full py-2 text-sm text-center text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Load More"}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

NotificationDropdown.propTypes = {
  onNotificationClick: PropTypes.func,
};

NotificationDropdown.defaultProps = {
  onNotificationClick: null,
};

export default NotificationDropdown;
