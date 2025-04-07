import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";

const ChatContext = createContext();
const API_BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:5000";

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  const { user } = useUser();

  // Safely calculate unread count
  const calculateUnreadCount = useCallback(
    (convs) => {
      try {
        if (!Array.isArray(convs)) return 0;

        return convs.reduce((total, conv) => {
          if (
            conv?.lastMessage &&
            !conv.lastMessage.readBy?.includes(user?._id)
          ) {
            return total + 1;
          }
          return total;
        }, 0);
      } catch (error) {
        console.error("Error calculating unread count:", error);
        return 0;
      }
    },
    [user?._id]
  );

  // Initialize socket connection
  useEffect(() => {
    if (!user?._id) return undefined;

    const newSocket = io("http://localhost:5000", {
      query: { userId: user._id },
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.close();
    };
  }, [user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (message) => {
      try {
        setMessages((prev) => [...(Array.isArray(prev) ? prev : []), message]);

        setConversations((prev) => {
          if (!Array.isArray(prev)) return prev;
          return prev.map((conv) =>
            conv?._id === message?.conversationId
              ? { ...conv, lastMessage: message }
              : conv
          );
        });

        if (activeConversation?._id !== message?.conversationId) {
          setUnreadCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error handling new message:", error);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, activeConversation]);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/chat/conversations");

      // Normalize response data
      const normalizedData = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setConversations(normalizedData);
      setUnreadCount(calculateUnreadCount(normalizedData));
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
      setUnreadCount(0);
    }
  }, [calculateUnreadCount]);

  const startConversation = useCallback(async (participantId) => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/chat/conversation/${participantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!data?.conversation) {
        throw new Error(data?.message || "Failed to create conversation");
      }
      console.log("Conversation successfully created:", data.conversation._id);
      return data.conversation;
    } catch (error) {
      console.error("Conversation error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const { data } = await axios.get(`/api/chat/messages/${conversationId}`);
      const normalizedMessages = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setMessages(normalizedMessages);
      return normalizedMessages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(
    async (conversationId, content, attachments = []) => {
      if (!socket?.connected) {
        throw new Error("Socket not connected");
      }

      try {
        const { data } = await axios.post("/api/chat/messages", {
          conversationId,
          content,
          attachments,
        });

        socket.emit("sendMessage", data);
        return data;
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [socket]
  );

  const markMessagesAsRead = useCallback(async (messageIds) => {
    if (!Array.isArray(messageIds) || messageIds.length === 0) return;

    try {
      await axios.post("/api/chat/messages/read", { messageIds });
      setUnreadCount((prev) => Math.max(0, prev - messageIds.length));
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations: Array.isArray(conversations) ? conversations : [],
        activeConversation,
        messages: Array.isArray(messages) ? messages : [],
        unreadCount,
        fetchConversations,
        startConversation,
        fetchMessages,
        sendMessage,
        markMessagesAsRead,
        setActiveConversation,
        socketConnected: socket?.connected || false,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
