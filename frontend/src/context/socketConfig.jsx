// src/hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const useSocket = () => {
  const { user } = useUser();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    // Only create socket if it doesn't exist
    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL, {
        query: { userId: user._id },
        transports: ["websocket"],
        auth: {
          token: localStorage.getItem("accessToken"),
        },
        reconnection: true, // Enable reconnection
        reconnectionAttempts: 5, // Limit reconnection attempts
        reconnectionDelay: 1000, // Delay between attempts
      });

      // Handle connection errors
      socketRef.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id]);

  return socketRef.current;
};

export default useSocket;
