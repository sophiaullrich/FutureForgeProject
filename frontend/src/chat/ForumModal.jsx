import React from "react";
import "./chat.css";

const forums = [
  { id: "general", name: "General Discussion" },
  { id: "development", name: "Development" },
  { id: "jobs", name: "Developer Jobs" },
  { id: "cv", name: "CV Help" },
  { id: "conferences", name: "Conferences Auckland" },
  { id: "Job Opportunities", name: "Job Opportunities Overseas" },
  { id: "UI Design", name: "UI Design Help" },
  { id: "Web Dev", name: "Web Designer Jobs" },
];

export function ForumModal({ showForumModal, setShowForumModal, setSelectedForum }) {
  if (!showForumModal) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content forum-modal" style={{ position: "relative" }}>
        <button
          className="modal-close"
          style={{ position: "absolute", top: 18, right: 24 }}
          onClick={() => setShowForumModal(false)}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="forum-modal-title">Find Forums</h2>
        <input
          className="forum-search"
          placeholder="Search forums and topics...."
        />
        <div className="forum-list">
          {forums.map((forum) => (
            <button
              key={forum.id}
              className="forum-list-item"
              onClick={() => setSelectedForum(forum)}
            >
              {forum.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JoinForumModal({ selectedForum, setSelectedForum, addAndPersistUser, setShowForumModal }) {
  if (!selectedForum) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content join-forum-modal">
        <button className="modal-close" onClick={() => setSelectedForum(null)}>
          ×
        </button>
        <h2>{selectedForum.name}</h2>
        <p>
          A forum for discussing {selectedForum.name.toLowerCase()}.<br />
          Would you like to join?
        </p>
        <button
          className="join-forum-btn"
          onClick={() => {
            addAndPersistUser({
              id: selectedForum.id,
              name: selectedForum.name,
              email: "",
            });
            setSelectedForum(null);
            setShowForumModal(false);
          }}
        >
          Join Forum
        </button>
      </div>
    </div>
  );
}