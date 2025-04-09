import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);
  const [typingStatus, setTypingStatus] = useState({});
  const typingTimeoutRef = useRef(null);

  const { user } = useUser();

  // Enhanced unread count calculation (keep existing)
  const calculateUnreadCount = useCallback(
    (convs) => {
      try {
        if (!Array.isArray(convs)) return 0;

        const count = convs.reduce((total, conv) => {
          const lastMessage = conv?.lastMessage;

          // Add proper null checks
          const isUnread =
            lastMessage &&
            lastMessage.sender &&
            !lastMessage.readBy?.includes(user?._id) &&
            lastMessage.sender._id !== user?._id;

          console.log(`[Unread Calc] Conv ${conv._id}:`, {
            lastMsgId: lastMessage?._id,
            sender: lastMessage?.sender?._id,
            isUnread,
            currentUser: user?._id,
          });

          return isUnread ? total + 1 : total;
        }, 0);

        console.log(`[Unread Calc] Total unread: ${count}`);
        return count;
      } catch (error) {
        console.error("Error calculating unread count:", error);
        return 0;
      }
    },
    [user?._id]
  );
  // Keep existing useEffect for unread count
  useEffect(() => {
    if (conversations) {
      const count = calculateUnreadCount(conversations);
      setUnreadCount(count);
    }
  }, [conversations, calculateUnreadCount]);

  // Enhanced socket initialization
  useEffect(() => {
    if (!user?._id) return undefined;

    const newSocket = io(API_BASE_URL, {
      query: { userId: user._id },
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("userOnline", user._id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Enhanced socket event listeners
  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (message) => {
      console.log("[Socket] New message received:", {
        id: message._id,
        sender: message.sender?._id,
        isCurrentUser: message.sender?._id.toString() !== user?._id.toString(),
        currentConversation: activeConversation?._id,
        messageConversation: message.conversationId?._id,
      });
      if (!message?.sender) return; // Add this line
      try {
        if (activeConversation?._id === message?.conversationId?._id) {
          setMessages((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            message,
          ]);
        }

        setConversations((prev) => {
          if (!Array.isArray(prev)) return prev;
          return prev.map((conv) =>
            conv?._id === message?.conversationId?._id
              ? {
                  ...conv,
                  lastMessage: message || conv.lastMessage, // Fallback
                }
              : conv
          );
        });

        const shouldIncrement =
          activeConversation?._id !== message?.conversationId?._id &&
          message?.sender?._id !== user?._id;

        console.log("[Socket] Should increment unread?", shouldIncrement);

        if (shouldIncrement) {
          setUnreadCount((prev) => {
            console.log(
              "[Socket] Incrementing unread from",
              prev,
              "to",
              prev + 1
            );
            return prev + 1;
          });
        }
      } catch (error) {
        console.error("Error handling new message:", error);
      }
    };

    const handleUnreadUpdate = ({ conversationId, increment }) => {
      if (activeConversation?._id !== conversationId) {
        setUnreadCount((prev) => Math.max(0, prev + increment));
      }
    };

    const handleTyping = ({ userId, isTyping }) => {
      if (userId !== user._id) {
        setTypingStatus((prev) => ({ ...prev, [userId]: isTyping }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("unreadUpdate", handleUnreadUpdate);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("unreadUpdate", handleUnreadUpdate);
      socket.off("typing", handleTyping);
    };
  }, [socket, activeConversation, user?._id]);

  // Add conversation room joining
  useEffect(() => {
    if (socket && activeConversation?._id) {
      socket.emit("joinConversation", activeConversation._id);
    }
  }, [socket, activeConversation]);

  // Enhanced fetchConversations with loading state and error handling
  const fetchConversations = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) return;

    setIsLoadingConversations(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/chat/conversations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Updated data extraction to match backend response
      const conversationsData = data?.message?.conversations || [];

      if (!Array.isArray(conversationsData)) {
        throw new Error("Invalid conversations data format");
      }

      console.log("Fetched conversations:", conversationsData); // Debug log

      setConversations(conversationsData);
      setUnreadCount(calculateUnreadCount(conversationsData));
      return conversationsData;
    } catch (error) {
      console.error("Fetch error:", error);
      setConversationsError(error);
      // Don't reset conversations state here
      throw error;
    } finally {
      setIsLoadingConversations(false);
    }
  }, [calculateUnreadCount]);

  // Automatically fetch conversations when user changes
  useEffect(() => {
    if (user?._id) {
      fetchConversations();
    }
  }, [user?._id, fetchConversations]);

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

      // Update conversations list with the new conversation
      setConversations((prev) => {
        const exists = prev.some((conv) => conv._id === data.conversation._id);
        return exists ? prev : [data.conversation, ...prev];
      });

      return data.conversation;
    } catch (error) {
      console.error("Conversation error:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      if (user?._id) {
        try {
          // Fetch conversations first
          await fetchConversations();

          // If there are conversations but none active, set the first one as active
          if (conversations.length > 0 && !activeConversation) {
            setActiveConversation(conversations[0]);
          }
        } catch (error) {
          console.error("Failed to initialize chat:", error);
        }
      }
    };

    initializeChat();
  }, [user?._id, fetchConversations]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/chat/messages/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Extract messages from the correct path in the response
      const messagesData = data?.message?.messages || [];

      // Ensure we have an array and sort by createdAt
      const normalizedMessages = Array.isArray(messagesData)
        ? messagesData
        : [];
      const sortedMessages = normalizedMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setMessages(sortedMessages);
      return sortedMessages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
      throw error;
    }
  }, []);
  const sendMessage = useCallback(
    async (conversationId, content, attachments = []) => {
      console.log("[Send] Attempting to send message...");
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/chat/messages`,
          { conversationId, content, attachments },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const responseMessage = data.message || data.data?.message;
        console.log("[Send] Message sent successfully:", {
          id: responseMessage._id,
          sender: responseMessage.sender?._id,
          isCurrentUser: responseMessage.sender?._id === user?._id,
        });

        if (!responseMessage) {
          throw new Error(data?.message || "Failed to send message");
        }

        // Update local state (no unread count change)
        setMessages((prev) => [...prev, responseMessage]);
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId
              ? { ...conv, lastMessage: responseMessage }
              : conv
          )
        );

        if (socket) {
          console.log("[Send] Emitting via socket");
          socket.emit("sendMessage", responseMessage);
        }

        return responseMessage;
      } catch (error) {
        console.error("Send message error:", error);
        throw error;
      }
    },
    [socket]
  );
  // In your ChatContext
  const markMessagesAsRead = useCallback(
    async (messageIds) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0 || !user?._id)
        return;

      // Double-check: Filter out any messages sent by the user (defensive programming)
      const incomingMessageIds = messages
        .filter(
          (msg) =>
            messageIds.includes(msg._id) &&
            msg.sender?._id !== user._id && // ✅ Exclude user's own messages
            !msg.readBy?.includes(user._id) // Only unread messages
        )
        .map((msg) => msg._id);

      if (incomingMessageIds.length === 0) return;

      try {
        await axios.post(
          `${API_BASE_URL}/api/chat/messages/read`,
          { messageIds: incomingMessageIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        // Update state
        setMessages((prev) =>
          prev.map((msg) =>
            incomingMessageIds.includes(msg._id)
              ? { ...msg, readBy: [...(msg.readBy || []), user._id] }
              : msg
          )
        );

        // Safely decrement unread count
        setUnreadCount((prev) => Math.max(0, prev - incomingMessageIds.length));

        // Update conversations
        setConversations((prev) =>
          prev.map((conv) => {
            const lastMsg = conv.lastMessage;
            if (
              lastMsg &&
              incomingMessageIds.includes(lastMsg._id) &&
              !lastMsg.readBy?.includes(user._id)
            ) {
              return {
                ...conv,
                lastMessage: {
                  ...lastMsg,
                  readBy: [...(lastMsg.readBy || []), user._id],
                },
              };
            }
            return conv;
          })
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [user?._id, messages]
  );
  const handleTyping = useCallback(
    (conversationId, isTyping) => {
      if (!socket || !conversationId) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socket.emit("typing", { conversationId, isTyping });

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("typing", { conversationId, isTyping: false });
        }, 3000);
      }
    },
    [socket]
  );
  return (
    <ChatContext.Provider
      value={{
        conversations: Array.isArray(conversations) ? conversations : [],
        activeConversation,
        messages: Array.isArray(messages) ? messages : [],
        unreadCount,
        isLoadingConversations,
        conversationsError,
        fetchConversations,
        startConversation,
        fetchMessages,
        sendMessage,
        markMessagesAsRead,
        setActiveConversation: (conversation) => {
          if (
            conversation?.lastMessage &&
            !conversation.lastMessage.readBy?.includes(user?._id) &&
            conversation.lastMessage.sender?._id !== user?._id // ✅ Exclude user's own messages
          ) {
            markMessagesAsRead([conversation.lastMessage._id]);
          }
          setActiveConversation(conversation);
        },
        socketConnected: socket?.connected || false,

        typingStatus,
        handleTyping,
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
