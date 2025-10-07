import React, { useState, useEffect } from "react";
import { listProfiles } from "./ProfileService";
import { auth, db } from "../Firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";

export default function InviteMembersModal({ onClose, teams = [], onInvite }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", linkedin: "" });
  const [mode, setMode] = useState("internal");
  const [profiles, setProfiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [showSentOverlay, setShowSentOverlay] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const currentUid = auth.currentUser?.uid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    (async () => {
      const all = await listProfiles();
      const filtered = all.filter(
        (p) => p.id !== currentUid && !p.disabled
      );
      setProfiles(filtered);
    })();
  }, [currentUid]);

  useEffect(() => {
    if (teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams]);

  const handleInvite = async () => {
    if (!selectedTeamId) return alert("Please select a team.");
  
    const link = `${window.location.origin}/join/${selectedTeamId}`;
    setInviteLink(link);
  
    let emailToInvite = "";
  
    if (mode === "internal" && selectedUser) {
      emailToInvite = selectedUser.email;
    } else if (mode === "external" && form.email.trim()) {
      emailToInvite = form.email.trim().toLowerCase();
    } else {
      return alert("Please select a user or enter a valid email.");
    }
  
    const inviteRef = doc(db, `teams/${selectedTeamId}/invites/${emailToInvite}`);
    await setDoc(inviteRef, {
      name: selectedUser?.displayName || form.name || "",
      email: emailToInvite,
      phone: form.phone || "",
      linkedin: form.linkedin || "",
      createdAt: new Date(),
    });
  
    if (mode === "internal" && selectedUser?.id) {
      const notifRef = doc(collection(db, "notifications"));
      await setDoc(notifRef, {
        userId: selectedUser.id,
        type: "invite",
        title: "New Team Invite",
        message: `You’ve been invited to join the team "${teams.find(t => t.id === selectedTeamId)?.name || "a team"}".`,
        teamId: selectedTeamId,
        read: false,
        timestamp: serverTimestamp(),
      });
    } else {
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        console.log("Clipboard failed. Here's your link:", link);
      }
    }
  
    await onInvite?.({ teamId: selectedTeamId, email: emailToInvite });
  
    setShowSentOverlay(true);
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert("Link copied to clipboard.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="invite-modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="invite-title">Invite Members</h2>

        <label className="select-team-label">Select a Team:</label>
        <select
          className="select-team-dropdown"
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <div className="invite-mode-toggle">
          <button className={mode === "internal" ? "active" : ""} onClick={() => {
            setMode("internal");
            setSelectedUser(null);
            setForm((f) => ({ ...f, email: "" }));
          }}>
            Invite Existing User
          </button>
          <button className={mode === "external" ? "active" : ""} onClick={() => {
            setMode("external");
            setSelectedUser(null);
          }}>
            Invite by link
          </button>
        </div>

        <div className="invite-form">
          {mode === "external" && (
            <>
              <input
                className="invite-input"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />
              <input
                className="invite-input"
                name="name"
                placeholder="Name (optional)"
                value={form.name}
                onChange={handleChange}
              />
            </>
          )}
          <input
            className="invite-input"
            name="phone"
            placeholder="Phone Number (optional)"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            className="invite-input"
            name="linkedin"
            placeholder="LinkedIn Profile (optional)"
            value={form.linkedin}
            onChange={handleChange}
          />

          <button
            className="invite-link-btn"
            onClick={handleInvite}
            disabled={mode === "internal" ? !selectedUser : !form.email.trim()}
          >
            <span>Send Invite</span>
            <span className="arrow">›</span>
          </button>

          <p className="invite-help">
            {mode === "internal"
              ? "Select an existing user below to invite them to your team."
              : "Enter an email address to generate an invite link."}
          </p>
        </div>

        {mode === "internal" && (
          <>
            <h3 className="pending-title">Select a User to Invite</h3>
            <div className="invites-list">
              {profiles.length === 0 ? (
                <p className="tasks-empty">No users available to invite.</p>
              ) : (
                profiles.map((user) => {
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      className={`invite-row ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="invite-left">
                        <span className="avatar-dot" />
                        <span className="invite-name">{user.displayName}</span>
                      </div>
                      <span className="invite-status pending">{user.email}</span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {showSentOverlay && (
          <div className="overlay-backdrop">
            <div className="overlay-card success">
              <h4 className="overlay-title">Invite Sent!</h4>
              <p className="overlay-sub">
                {mode === "external"
                  ? "The invite link was copied to your clipboard."
                  : "A notification was sent to the user."}
              </p>

              {inviteLink && (
                <div className="overlay-email-preview">
                  <p><strong>Email Preview:</strong></p>
                  <p><em>Subject:</em> You've been invited to join a team on GoBearAI</p>
                  <p><em>Body:</em> Click the link to join the team: <br />
                    <code>{inviteLink}</code>
                  </p>
                  <button onClick={handleCopyLink}>Copy Link Again</button>
                </div>
              )}

              <button className="overlay-ok" onClick={() => setShowSentOverlay(false)}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
