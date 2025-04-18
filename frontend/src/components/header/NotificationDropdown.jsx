// NotificationDropdown.js
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from "./notificationSlice";

const NotificationDropdown = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );
  const dropdownRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        className="relative p-2 hover:text-yellow-400 transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            dispatch(markAllAsRead());
          }
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white text-black rounded-md shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-xs text-blue-500 hover:text-blue-700"
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </button>
                <button
                  onClick={() => dispatch(clearNotifications())}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      dispatch(markAsRead(notification.id));
                      // You can add navigation here if notifications have links
                      // navigate(notification.link);
                    }}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
