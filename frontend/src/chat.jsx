import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import "./chat.css";
import FriendsService from "./friends-page/FriendsService"; // <-- Import the service

const BACKEND_URL = "http://localhost:5001/api/chat/messages";
const USER_SEARCH_URL = "http://localhost:5001/api/users/search";

const avatarColors = [
  "linear-gradient(135deg, #4e54c8, #8f94fb)",
  "linear-gradient(135deg, #ff5858, #f09819)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #56ab2f, #a8e063)",
  "linear-gradient(135deg, #ff512f, #dd2476)",
];

// Utility to sanitize chat names for Firebase keys
function sanitizeChatKey(name) {
  return name.replace(/[.#$[\]]/g, "_");
}

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const messagesEndRef = useRef(null);

  const chatList = [
    { name: "Sophia", preview: "Hey what..." },
    { name: "Developer Forum", preview: "Yes" },
    { name: "Team Marketing", preview: "No it's..." },
    { name: "William", preview: "Whats up?" },
    { name: "Willie", preview: "hii" },
  ];

  const filteredChats = chatList.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch messages from backend
  useEffect(() => {
    fetch(BACKEND_URL)
      .then((res) => res.json())
      .then((data) => {
        const loadedMessages = data ? Object.values(data) : [];
        setMessages(loadedMessages);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const chatKey = sanitizeChatKey(selectedChat.name);
    fetch(`${BACKEND_URL}/${encodeURIComponent(chatKey)}`)
      .then((res) => res.json())
      .then((data) => {
        const loadedMessages = data ? Object.values(data) : [];
        setMessages(loadedMessages);
      });
  }, [selectedChat]);

  // Fetch users from FriendsService when searchQuery changes
  useEffect(() => {
    let ignore = false;
    if (searchQuery.trim() === "") {
      setUserResults([]);
      return;
    }
    setLoadingUsers(true);
    FriendsService.search(searchQuery)
      .then((data) => {
        if (!ignore) setUserResults(data);
      })
      .finally(() => {
        if (!ignore) setLoadingUsers(false);
      });
    return () => { ignore = true; };
  }, [searchQuery]);

  // Send message to backend for selected chat
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedChat) return;
    const chatKey = sanitizeChatKey(selectedChat.name);
    await fetch(`${BACKEND_URL}/${encodeURIComponent(chatKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newMessage }),
    });
    setNewMessage("");
    // Refetch messages after sending
    fetch(`${BACKEND_URL}/${encodeURIComponent(chatKey)}`)
      .then((res) => res.json())
      .then((data) => {
        const loadedMessages = data ? Object.values(data) : [];
        setMessages(loadedMessages);
      });
  };

  // Modal component
  const MessageModal = ({ open, onClose, chat }) => {
    if (!open) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
          <h2>Chat with {chat.name}</h2>
          <div className="messages-display">
            {messages.map((msg, idx) => {
              // For demo: treat every other message as "me" or "them"
              const isMe = msg.from === "me" || (!msg.from && idx % 2 === 0);
              return (
                <div
                  key={idx}
                  className={`message-row ${isMe ? "message-me" : "message-them"}`}
                >
                  <span className="message-bubble">{msg.text}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="messaging-form">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="messaging-input"
            />
            <button type="submit" className="messaging-send-btn">
              Send
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Use userResults if searching, otherwise show chatList
  const displayChats =
    searchQuery.trim() === ""
      ? chatList
      : userResults.map((user) => ({
          name: user.name,
          preview: user.email || "",
          id: user.id,
          isFriend: user.isFriend,
          pendingOutgoing: user.pendingOutgoing,
          pendingIncoming: user.pendingIncoming,
        }));

  return (
    <div className="chat-app">
      <div className="chat-sidebar">
        <div className="sidebar-title-bar">
          <h1 className="sidebar-title">Find Forums</h1>
          <IoIosArrowForward className="sidebar-arrow" />
        </div>
        <div className="search-box elevated">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for people, chats and forums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="chat-list">
          {loadingUsers && <div>Loading users...</div>}
          {displayChats.map((chat, index) => (
            <div
              key={chat.id || index}
              className="chat-item"
              onClick={() => {
                // Only set if different to avoid unnecessary modal re-renders
                if (!selectedChat || selectedChat.name !== chat.name) {
                  setSelectedChat(chat);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div
                className="chat-avatar"
                style={{
                  background: avatarColors[index % avatarColors.length],
                }}
              />
              <div className="chat-info">
                <h3 className="chat-name">{chat.name}</h3>
                <p className="chat-preview">{chat.preview}</p>
                {chat.isFriend && <span className="friend-badge">Friend</span>}
                {chat.pendingOutgoing && (
                  <span className="pending-badge">Request Sent</span>
                )}
                {chat.pendingIncoming && (
                  <span className="pending-badge">Requested You</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <MessageModal
        open={!!selectedChat}
        onClose={() => setSelectedChat(null)}
        chat={selectedChat || {}}
      />
    </div>
  );
};

export default Chat;