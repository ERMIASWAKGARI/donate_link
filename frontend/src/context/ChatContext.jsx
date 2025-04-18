import axios from "axios";
import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSocket } from "./SocketContext";
import { useUser } from "./UserContext";

const ChatContext = createContext();
const API_BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:5000";

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);
  const [typingStatus, setTypingStatus] = useState({});
  const typingTimeoutRef = useRef(null);
  const currentConversationId = useRef(null);

  const { user } = useUser();
  const { isConnected, on, off, emit } = useSocket();

  // Enhanced unread count calculation (keep existing)
  const calculateUnreadCount = useCallback(
    (convs) => {
      try {
        if (!Array.isArray(convs)) return 0;

        const currentUserId = user?._id?.toString();

        const count = convs.reduce((total, conv) => {
          const lastMessage = conv?.lastMessage;

          // Skip if no last message
          if (!lastMessage) return total;

          // Get sender ID - handle both populated object and raw ID
          const senderId =
            lastMessage.sender?._id?.toString() ||
            lastMessage.sender?.toString();

          // Skip if we can't determine sender
          if (!senderId) {
            console.warn(
              "Could not determine sender for message:",
              lastMessage._id
            );
            return total;
          }

          // Message is unread if:
          // 1. Current user didn't send it
          // 2. Current user hasn't read it
          const isUnread =
            senderId !== currentUserId &&
            !lastMessage.readBy?.includes(currentUserId);

          console.log(`[Unread Calc] Conv ${conv._id}:`, {
            lastMsgId: lastMessage._id,
            sender: senderId,
            isUnread,
            currentUser: currentUserId,
            readBy: lastMessage.readBy,
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

  // Enhanced socket event listeners using the new SocketContext
  useEffect(() => {
    if (!isConnected) return undefined;

    const handleNewMessage = (message) => {
      console.log("[Socket] New message received:", {
        id: message._id,
        sender: message.sender?._id,
        isCurrentUser: message.sender?._id.toString() !== user?._id.toString(),
        currentConversation: activeConversation?._id,
        messageConversation: message.conversationId?._id,
      });

      if (!message?.sender) return;

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

    // Register event handlers using the new socket context
    on("newMessage", handleNewMessage);
    on("unreadUpdate", handleUnreadUpdate);
    on("typing", handleTyping);

    return () => {
      off("newMessage", handleNewMessage);
      off("unreadUpdate", handleUnreadUpdate);
      off("typing", handleTyping);
    };
  }, [isConnected, activeConversation, user?._id, on, off]);

  // Add a ref to track the current conversation

  useEffect(() => {
    if (isConnected && activeConversation?._id) {
      // Only join if we're not already in this conversation
      if (currentConversationId.current !== activeConversation._id) {
        console.log("Joining conversation:", activeConversation._id);
        emit("joinConversation", activeConversation._id);
        currentConversationId.current = activeConversation._id;
      }
    }
  }, [isConnected, activeConversation?._id, emit]);

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

      const conversationsData = data?.message?.conversations || [];

      if (!Array.isArray(conversationsData)) {
        throw new Error("Invalid conversations data format");
      }

      // Ensure lastMessage.sender is properly formatted
      const normalizedConversations = conversationsData.map((conv) => {
        if (conv.lastMessage) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              // Normalize sender to always be an object with _id
              sender: conv.lastMessage.sender?._id
                ? conv.lastMessage.sender
                : { _id: conv.lastMessage.sender },
            },
          };
        }
        return conv;
      });

      setConversations(normalizedConversations);
      setUnreadCount(calculateUnreadCount(normalizedConversations));
      return normalizedConversations;
    } catch (error) {
      console.error("Fetch error:", error);
      setConversationsError(error);
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

        if (isConnected) {
          console.log("[Send] Emitting via socket");
          emit("sendMessage", responseMessage);
        }

        return responseMessage;
      } catch (error) {
        console.error("Send message error:", error);
        throw error;
      }
    },
    [isConnected, emit, user?._id]
  );

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
      if (!isConnected || !conversationId) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      emit("typing", { conversationId, isTyping });

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          emit("typing", { conversationId, isTyping: false });
        }, 3000);
      }
    },
    [isConnected, emit]
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
        socket,
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
        socketConnected: isConnected,
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
