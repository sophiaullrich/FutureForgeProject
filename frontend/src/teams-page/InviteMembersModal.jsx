// src/teams-page/InviteMembersModal.jsx
import React, { useState } from "react";

export default function InviteMembersModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
  });

  const [invites, setInvites] = useState([
    { name: "William Cao", status: "Declined" },
    { name: "Willie Dong", status: "Pending" },
    { name: "Marcos Figueiredo", status: "Pending" },
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInvite = () => {
    console.log("Invite link generated for:", form);
    alert("Invite link copied to clipboard!");
  };

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="modal-overlay" style={overlayStyle}>
        <div className="invite-modal" style={modalStyle}>
          <button className="close-button" onClick={onClose} style={closeBtn}>✕</button>
          <h2 style={titleStyle}>Invite Members</h2>

          <div className="invite-form" style={formSection}>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={inputStyle} />
            <input name="phone" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange} style={inputStyle} />
            <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} style={inputStyle} />
            <input name="linkedin" placeholder="LinkedIn Profile (optional)" value={form.linkedin} onChange={handleChange} style={inputStyle} />
            <button className="invite-button" onClick={handleInvite} style={inviteBtn}>Copy Invite Link ➤</button>
            <p style={{ fontSize: "0.8rem", color: "#555", marginTop: "4px" }}>Share this link to let others join your team!</p>
          </div>

          <div className="pending-invites">
            <h3 style={subheadingStyle}>Pending Invites</h3>
            {invites.map((invite, index) => (
              <div
                key={index}
                style={{
                  ...inviteItem,
                  backgroundColor: invite.status === "Declined" ? "#fef2f2" : "#edf2f7",
                  borderLeft: `8px solid ${invite.status === "Declined" ? "#e53e3e" : "#2b6cb0"}`
                }}
              >
                <span>{invite.name}</span>
                <span style={{
                  color: invite.status === "Declined" ? "#e53e3e" : "#2b6cb0",
                  fontWeight: "bold"
                }}>{invite.status}</span>
              </div>
            ))}
          </div>

          <div className="action-buttons" style={actionBtnRow}>
            <button style={greenBtn}>Resend Invite</button>
            <button style={redBtn}>Revoke Invite</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const overlayStyle = {
  background: "#f8f6ef",
  padding: "2rem",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "600px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  position: "relative",
};

const modalStyle = {
  width: "100%",
};

const titleStyle = {
  marginBottom: "1rem",
};

const formSection = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.5rem",
  marginBottom: "1rem",
};

const inputStyle = {
  padding: "0.5rem",
  borderRadius: "5px",
  border: "1px solid #ccc",
  width: "100%",
};

const inviteBtn = {
  backgroundColor: "#2b2d63",
  color: "#fff",
  border: "none",
  padding: "0.75rem",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "1rem",
  gridColumn: "1 / -1",
};

const subheadingStyle = {
  marginTop: "1rem",
  marginBottom: "0.5rem",
};

const inviteItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.6rem",
  borderRadius: "6px",
  marginBottom: "0.5rem",
};

const actionBtnRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "1rem",
};

const greenBtn = {
  backgroundColor: "#2f855a",
  color: "#fff",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
};

const redBtn = {
  backgroundColor: "#c53030",
  color: "#fff",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
};

const closeBtn = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
};
