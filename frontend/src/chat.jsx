import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiArrowUp } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import "./chat.css";
import FriendsService from "./friends-page/FriendsService";
import { auth } from "./Firebase";

const BACKEND_URL = "http://localhost:5001/api/chat/messages";
const USER_SEARCH_URL = "http://localhost:5001/api/users/search";

const avatarColors = [
  "linear-gradient(135deg, #4e54c8, #8f94fb)",
  "linear-gradient(135deg, #ff5858, #f09819)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #56ab2f, #a8e063)",
  "linear-gradient(135deg, #ff512f, #dd2476)",
];

function sanitizeChatKey(name) {
  return name.replace(/[.#$[\]]/g, "_");
}

const MessageModal = React.memo(({ 
  open, 
  onClose, 
  chat, 
  messages, 
  newMessage, 
  setNewMessage, 
  sendMessage 
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}:${minutes}${ampm}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content chat-modal-large">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="chat-modal-title">{chat.name}</h2>
        <div className="messages-display chat-messages-bg">
          {messages.map((msg, idx) => {
            const isMe = msg.from === auth.currentUser?.uid;
            const showTime =
              idx === 0 ||
              (messages[idx].timestamp &&
                Math.abs(
                  messages[idx].timestamp - messages[idx - 1].timestamp
                ) > 1000 * 60 * 30);

            return (
              <React.Fragment key={idx}>
                {showTime && msg.timestamp && (
                  <div className="chat-timestamp">
                    {formatTime(msg.timestamp)}
                  </div>
                )}
                <div
                  className={`message-row-flex ${
                    isMe ? "message-row-me" : "message-row-them"
                  }`}
                >
                  {!isMe && (
                    <div
                      className="chat-avatar chat-avatar-bubble"
                      style={{
                        background: avatarColors[0],
                      }}
                    />
                  )}
                  <span className="message-bubble-bubble">{msg.text}</span>
                  {isMe && (
                    <div
                      className="chat-avatar chat-avatar-bubble"
                      style={{
                        background: avatarColors[1],
                      }}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-row">
          <form id="chat-send-form" onSubmit={sendMessage} className="messaging-form chat-input-bar" autoComplete="off">
            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="messaging-input chat-input"
            />
            <button type="submit" className="chat-send-inside" aria-label="Send">
              <FiArrowUp size={18} />
            </button>
          </form>
         </div>
      </div>
    </div>
  );
});

function getChatKey(userId1, userId2) {
  // Always sort IDs so the key is the same for both users
  return [userId1, userId2].sort().join("_");
}

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [messagedUsers, setMessagedUsers] = useState([]);

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

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat || !auth.currentUser) return;
    const myId = auth.currentUser.uid;
    const otherId = selectedChat.id;
    const chatKey = getChatKey(myId, otherId);

    fetch(`${BACKEND_URL}/${encodeURIComponent(chatKey)}`)
      .then((res) => res.json())
      .then((data) => {
        let loadedMessages = data ? Object.values(data) : [];
        // Only show messages between me and the selected user
        loadedMessages = loadedMessages.filter(
          (msg) =>
            (msg.from === myId && msg.to === otherId) ||
            (msg.from === otherId && msg.to === myId)
        );
        setMessages(loadedMessages);
      });
  }, [selectedChat]);

  // Fetch users from FriendsService for searching user to message
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
  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedChat || !auth.currentUser) return;
    const myId = auth.currentUser.uid;
    const otherId = selectedChat.id;
    const chatKey = getChatKey(myId, otherId);

    await fetch(`${BACKEND_URL}/${encodeURIComponent(chatKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newMessage, from: myId, to: otherId }),
    });
    setNewMessage("");

    // Add to messagedUsers if not already present
    setMessagedUsers((prev) => {
      if (prev.find((u) => u.id === selectedChat.id)) return prev;
      return [...prev, selectedChat];
    });

    // Refetch messages after sending
    fetch(`${BACKEND_URL}/${encodeURIComponent(chatKey)}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server error: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        const loadedMessages = data ? Object.values(data) : [];
        setMessages(loadedMessages);
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err.message);
        setMessages([]);
      });
  }, [newMessage, selectedChat]);

  const allChats = [
    ...chatList,
    ...messagedUsers.filter(
      (u) => !chatList.some((c) => c.id === u.id || c.name === u.name)
    ),
  ];

  // Use userResults if searching, otherwise show chatList
  const displayChats =
    searchQuery.trim() === ""
      ? allChats
      : userResults.map((user) => ({
          name: user.name,
          preview: user.email || "",
          id: user.id,
          isFriend: user.isFriend
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
              </div>
            </div>
          ))}
        </div>
      </div>
      <MessageModal
        open={!!selectedChat}
        onClose={() => setSelectedChat(null)}
        chat={selectedChat}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default Chat;