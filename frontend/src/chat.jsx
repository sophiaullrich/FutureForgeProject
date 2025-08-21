import React, { useState, useEffect, useRef } from "react";
import { ref, push, onValue } from "firebase/database";
import { FiSearch } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import { db } from "./firebase";
import "./chat.css";

const avatarColors = [
  "linear-gradient(135deg, #4e54c8, #8f94fb)",
  "linear-gradient(135deg, #ff5858, #f09819)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #56ab2f, #a8e063)",
  "linear-gradient(135deg, #ff512f, #dd2476)",
];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  // Listen for messages in Realtime Database
  useEffect(() => {
    const messagesRef = ref(db, "messages");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data ? Object.values(data) : [];
      setMessages(loadedMessages);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to Realtime Database
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    const message = {
      text: newMessage,
      timestamp: Date.now(),
    };
    await push(ref(db, "messages"), message);
    setNewMessage("");
  };

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
          {filteredChats.map((chat, index) => (
            <div key={index} className="chat-item">
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
        {/* Messaging box */}
        <div style={{ marginTop: "32px" }}>
          <div
            style={{
              maxHeight: "220px",
              overflowY: "auto",
              marginBottom: "12px",
              background: "#fff",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #eee",
            }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: "10px" }}>
                <span>{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={sendMessage}
            style={{ display: "flex", gap: "8px" }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                background: "#222",
                color: "#fff",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;