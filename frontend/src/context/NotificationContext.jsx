/* eslint-disable react/prop-types */
import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocket } from "./SocketContext";
import { useUser } from "./UserContext";

const NotificationContext = createContext();
const API_BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:5000";
const NOTIFICATIONS_PER_PAGE = 10;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    hasMore: true,
  });

  const { isConnected, on, off } = useSocket();
  const { user } = useUser();

  const fetchNotifications = useCallback(
    async (page = 1, tab = activeTab) => {
      if (!user?._id) return;

      setIsLoading(true);
      try {
        const params = {
          page,
          limit: NOTIFICATIONS_PER_PAGE,
          seen: tab === "unread" ? "false" : undefined,
        };

        const { data } = await axios.get(`${API_BASE_URL}/api/notification`, {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const { notifications: fetched, unreadCount: count } = data.data;

        setNotifications((prev) =>
          page === 1 ? fetched : [...prev, ...fetched]
        );
        setUnreadCount(count || 0);
        setPagination((prev) => ({
          ...prev,
          page,
          total: data.data.total,
          hasMore: data.data.hasMore,
        }));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user?._id, activeTab]
  );

  useEffect(() => {
    if (user?._id) {
      fetchNotifications(1, activeTab);
    }
  }, [user?._id, activeTab, fetchNotifications]);

  const changeTab = useCallback(
    (tab) => {
      setActiveTab(tab);
      setNotifications([]);
      setPagination({ page: 1, total: 0, hasMore: true });

      // Defer to wait for state update
      setTimeout(() => {
        fetchNotifications(1, tab);
      }, 0);
    },
    [fetchNotifications]
  );

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !isLoading) {
      fetchNotifications(pagination.page + 1);
    }
  }, [fetchNotifications, pagination, isLoading]);

  const markAsRead = useCallback(async (id) => {
    if (!id) {
      console.error("No notification ID provided");
      return;
    }
    console.log("Marking notification as read:", id);

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/notification/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Update state based on API response
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, seen: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }, []);

  const markMultipleAsRead = useCallback(async (ids) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/notification/mark-read`,
        { notificationIds: ids },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n._id) ? { ...n, seen: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/notification/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
      setUnreadCount(0);
      setActiveTab("all");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  useEffect(() => {
    if (!isConnected || !user?._id) return;

    const handleNewNotification = (notification) => {
      // Ensure the notification has a proper ID
      console.log("New notification received:", notification.id);
      const completeNotification = {
        ...notification,
        _id: notification.id || `temp_${Date.now()}`,
        seen: false,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => {
        // Remove any existing temp notifications
        const filtered = prev.filter((n) => !n._id.startsWith("temp_"));
        // Add new notification at the top
        return [completeNotification, ...filtered];
      });

      setUnreadCount((prev) => prev + 1);
      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));
    };

    on("notification", handleNewNotification);

    return () => {
      off("notification", handleNewNotification);
    };
  }, [isConnected, user?._id, on, off]);

  useEffect(() => {
    if (!isConnected || !user?._id) {
      console.log("[NotificationContext] Socket not connected or no user ID");
      return;
    }

    console.log(
      "[NotificationContext] Setting up socket listeners for user:",
      user._id
    );

    const handleNotificationUpdate = (data) => {
      console.log("[NotificationContext] Received notificationUpdate:", data);

      setNotifications((prev) => {
        const filtered = prev.filter((n) => n._id !== data.notification._id);
        return [data.notification, ...filtered];
      });

      setUnreadCount(data.unreadCount);
      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));
    };

    on("notificationUpdate", handleNotificationUpdate);

    return () => {
      console.log("[NotificationContext] Cleaning up socket listeners");
      off("notificationUpdate", handleNotificationUpdate);
    };
  }, [isConnected, user?._id, on, off]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        activeTab,
        pagination,
        fetchNotifications,
        markAsRead,
        markMultipleAsRead,
        markAllAsRead,
        changeTab,
        loadMore,
        setNotifications,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
