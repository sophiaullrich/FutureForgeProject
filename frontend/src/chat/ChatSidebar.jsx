import React from "react";
import { FiSearch } from "react-icons/fi";
import { IoChevronForward, IoSearchSharp } from "react-icons/io5";
import { avatarColors } from "./chatUtils";
import "./chat.css";

const hasUnread = (setLike, id) =>
  setLike instanceof Set &&
  typeof setLike.has === "function" &&
  setLike.has(id);
const ChatSidebar = ({
  searchQuery,
  setSearchQuery,
  loadingUsers,
  displayChats,
  selectedChat,
  setSelectedChat,
  setShowForumModal,
  unreadChats,
  onOpenChat,
}) => (
  <div className="chat-sidebar">
    <div className="sidebar-title-bar">
      <button
        className="sidebar-title-bar forum-bar-btn"
        onClick={() => setShowForumModal(true)}
      >
        <h1 className="sidebar-title">Find Forums</h1>
        <IoChevronForward className="sidebar-arrow" />
      </button>
    </div>
    <div className="search-box elevated">
      <input
        type="text"
        placeholder="Search for people, chats and forums..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <IoSearchSharp className="search-icon" />
    </div>
    <div className="chat-list">
      {loadingUsers && <div>Loading users...</div>}
      {displayChats.map((chat, index) => (
        <div
          key={chat.id || index}
          className="chat-item"
          onClick={() => onOpenChat(chat)}
          style={{ cursor: "pointer" }}
        >
          <div
            className="chat-avatar"
            style={{
              background: avatarColors[index % avatarColors.length],
            }}
          />
          <div className="chat-info">
            <h3 className="chat-name">
              {chat.name}
              {chat.id && hasUnread(unreadChats, chat.id) ? (
                <span className="chat-dot" />
              ) : null}
            </h3>
            <p className="chat-preview">{chat.preview}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ChatSidebar;
