import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useChat } from "../context/ChatContext";
import { useUser } from "../context/UserContext";
import {
  FiSend,
  FiX,
  FiSmile,
  FiSearch,
  FiMessageSquare,
  FiChevronLeft,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { motion } from "framer-motion";

const ChatModal = ({ onClose, showChatModal }) => {
  const {
    conversations,
    activeConversation,
    messages,
    fetchConversations,
    fetchMessages,
    markMessagesAsRead,
    sendMessage,
    setActiveConversation,
    isLoadingConversations,
  } = useChat();

  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleResize = useCallback(() => {
    setIsMobileView(window.innerWidth < 768);
  }, []);

  // Main initialization effect
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (!showChatModal || !user?._id) return;

      try {
        const loadedConversations = await fetchConversations();

        if (isMounted) {
          if (loadedConversations?.length > 0 && !activeConversation) {
            console.log(
              "Setting initial conversation:",
              loadedConversations[0]
            );
            setActiveConversation(loadedConversations[0]);
          }

          if (activeConversation?._id) {
            await fetchMessages(activeConversation._id);
            scrollToBottom();
          }
        }
      } catch (error) {
        console.error("Chat initialization failed:", error);
      }
    };

    if (showChatModal) {
      initializeChat();
    }

    return () => {
      isMounted = false;
    };
  }, [showChatModal, user?._id]);

  // Handle conversation changes
  useEffect(() => {
    if (!activeConversation?._id) return;

    const loadMessages = async () => {
      try {
        await fetchMessages(activeConversation._id);
        scrollToBottom();
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();
  }, [activeConversation?._id, fetchMessages, scrollToBottom]);

  // In your ChatModal component

  useEffect(() => {
    if (showChatModal && activeConversation?._id) {
      const handleMarkAsRead = async () => {
        try {
          const unreadMessages = messages.filter(
            (msg) =>
              msg.sender && // Check sender exists
              !msg.readBy?.includes(user._id) &&
              msg.sender._id !== user._id
          );

          if (unreadMessages.length > 0) {
            await markMessagesAsRead(unreadMessages.map((msg) => msg._id));
            await fetchConversations(); // Refresh conversations to update unread count
          }
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      };

      handleMarkAsRead();
    }
  }, [
    showChatModal,
    activeConversation,
    messages,
    user._id,
    markMessagesAsRead,
    fetchConversations,
  ]);
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Window resize handler
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Modal visibility and outside click handler
  useEffect(() => {
    setIsVisible(true);

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (showChatModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showChatModal, onClose]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation || isSending) return;

    setIsSending(true);

    try {
      const result = await sendMessage(activeConversation._id, message);

      setMessage(""); // Clear the input
      console.log("Message clearly successfully:", result);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Send failed:", error.message);
      // Optionally show error to user
      // toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const filteredConversations = (conversations || []).filter((conv) => {
    const otherParticipant = conv.participants?.find((p) => p._id !== user._id);
    return otherParticipant?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation);
    if (isMobileView) {
      document.getElementById("conversation-list").classList.add("hidden");
      document.getElementById("chat-area").classList.remove("hidden");
    }
  };

  const handleBackToConversations = () => {
    document.getElementById("conversation-list").classList.remove("hidden");
    document.getElementById("chat-area").classList.add("hidden");
  };

  return (
    <motion.div
      ref={modalRef}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-white z-[100] h-[80vh] flex flex-col transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-semibold">Messages</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-teal-700 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div
          id="conversation-list"
          className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
            isMobileView && activeConversation ? "hidden" : ""
          }`}
        >
          <div className="p-3 border-b border-gray-200 relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const otherParticipant = conv.participants.find(
                  (p) => p._id !== user._id
                );

                // Safest unread check with all possible guards
                const unreadMessages =
                  conv.lastMessage &&
                  conv.lastMessage.sender && // Check sender exists
                  conv.lastMessage.sender._id !== user._id &&
                  Array.isArray(conv.lastMessage.readBy) &&
                  !conv.lastMessage.readBy.includes(user._id);
                return (
                  <div
                    key={conv._id}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      activeConversation?._id === conv._id ? "bg-teal-50" : ""
                    }`}
                    onClick={() => handleConversationClick(conv)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={`http://localhost:5000/uploads/${otherParticipant?.profilePicture.replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt={otherParticipant?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {unreadMessages && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-teal-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {otherParticipant?.name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          id="chat-area"
          className={`flex-1 flex flex-col ${
            isMobileView && !activeConversation ? "hidden" : ""
          }`}
        >
          {activeConversation ? (
            <>
              <div className="p-3 border-b border-gray-200 flex items-center bg-gray-50">
                {isMobileView && (
                  <button
                    onClick={handleBackToConversations}
                    className="mr-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                )}
                <div className="flex items-center">
                  <img
                    src={
                      activeConversation.participants.find(
                        (p) => p._id !== user._id
                      )?.profilePicture
                        ? `http://localhost:5000/uploads/${activeConversation.participants
                            .find((p) => p._id !== user._id)
                            .profilePicture.replace(/\\/g, "/")}`
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">
                      {
                        activeConversation.participants.find(
                          (p) => p._id !== user._id
                        )?.name
                      }
                    </h3>
                    <p className="text-xs text-gray-500">
                      {activeConversation.participants.find(
                        (p) => p._id !== user._id
                      )?.role === "ngo"
                        ? "NGO"
                        : "Volunteer"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    // Skip rendering if message is invalid
                    if (!msg.sender) return null;

                    return (
                      <div
                        key={msg._id}
                        className={`mb-4 flex ${
                          msg.sender._id === user._id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender._id === user._id
                              ? "bg-teal-100 text-black"
                              : "bg-white text-gray-800 border border-gray-200"
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <div className="flex justify-end items-center mt-1">
                            <span
                              className={`text-xs ${
                                msg.sender._id === user._id
                                  ? "text-teal-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {msg.sender._id === user._id && (
                              <span className="ml-1">
                                {msg.readBy?.length > 1 ? (
                                  <span className="text-teal-100 text-xs">
                                    ✓✓
                                  </span>
                                ) : (
                                  <span className="text-teal-100 text-xs">
                                    ✓
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200 bg-white relative">
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-0 z-10">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      width="100%"
                      height={350}
                    />
                  </div>
                )}
                <div className="flex items-center">
                  <button
                    className="p-2 text-gray-500 hover:text-teal-500 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <FiSmile size={20} />
                  </button>
                  {/*  */}
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 mx-2 text-gray-700 bg-white"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:bg-teal-300 transition-colors"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                  >
                    {isSending ? (
                      <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full" /> // Add a spinner component
                    ) : (
                      <FiSend size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-6">
                <FiMessageSquare
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900">
                  Select a conversation
                </h3>
                <p className="mt-2 text-gray-500">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

ChatModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  showChatModal: PropTypes.bool.isRequired,
};

export default ChatModal;
