import React, { useState } from "react";

export default function InviteMembersModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
  });

  const [invites] = useState([
    { name: "William Cao", status: "Declined" },
    { name: "Willie Dong", status: "Pending" },
    { name: "Marcos Figueiredo", status: "Pending" },
  ]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleInvite = async () => {
    const link = "https://app.example.com/join/abc123"; // wire real link later
    try {
      await navigator.clipboard.writeText(link);
      alert("Invite link copied to clipboard!");
    } catch {
      alert(link);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="invite-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="invite-title">Invite Members</h2>

        <div className="invite-form">
          <input
            className="invite-input"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            className="invite-input"
            name="phone"
            placeholder="Phone Number (optional)"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            className="invite-input"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="invite-input"
            name="linkedin"
            placeholder="LinkedIn Profile (optional)"
            value={form.linkedin}
            onChange={handleChange}
          />

          <button className="invite-link-btn" onClick={handleInvite}>
            <span>Copy Invite Link</span>
            <span className="arrow">›</span>
          </button>
          <p className="invite-help">
            Share this link to let others join your team!
          </p>
        </div>

        <h3 className="pending-title">Pending Invites</h3>

        <div className="invites-list">
          {invites.map(({ name, status }) => (
            <div className="invite-row" key={name}>
              <div className="invite-left">
                <span className="avatar-dot" />
                <span className="invite-name">{name}</span>
              </div>
              <span
                className={
                  status === "Declined"
                    ? "invite-status declined"
                    : "invite-status pending"
                }
              >
                {status}
              </span>
            </div>
          ))}
        </div>

        <div className="invite-actions">
          <button className="resend-btn">Resend Invite</button>
          <button className="revoke-btn">Revoke Invite</button>
        </div>
      </div>
    </div>
  );
}
