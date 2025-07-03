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
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Invite Members</h2>

        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange} />
        <input name="linkedin" placeholder="LinkedIn Profile (optional)" value={form.linkedin} onChange={handleChange} />

        <button onClick={handleInvite}>Copy Invite Link</button>

        <h3>Pending Invites</h3>
        {invites.map((invite, index) => (
          <div key={index} style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "8px 0",
            padding: "0.5rem",
            background: "#fff",
            borderRadius: "6px",
            border: "1px solid #ddd"
          }}>
            <span>{invite.name}</span>
            <span style={{ color: invite.status === "Declined" ? "red" : "blue" }}>{invite.status}</span>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
          <button style={{ background: "#2f855a" }}>Resend Invite</button>
          <button style={{ background: "#c53030" }}>Revoke Invite</button>
        </div>

        <button style={{ marginTop: "1rem" }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
