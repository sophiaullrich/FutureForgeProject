// modal for inviting members to a team
import React, { useState, useEffect } from "react";
import { listProfiles } from "./ProfileService";
import { auth, db } from "../Firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";

export default function InviteMembersModal({ onClose, teams = [], onInvite }) {
  // form fields
  const [form, setForm] = useState({ name: "", email: "", phone: "", linkedin: "" });
  const [mode, setMode] = useState("internal"); // internal or external
  const [profiles, setProfiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [showSentOverlay, setShowSentOverlay] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  // current user id
  const currentUid = auth.currentUser?.uid;

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // load user profiles
  useEffect(() => {
    (async () => {
      const all = await listProfiles();
      const filtered = all.filter((p) => p.id !== currentUid && !p.disabled);
      setProfiles(filtered);
    })();
  }, [currentUid]);

  // default select first team
  useEffect(() => {
    if (teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams]);

  // send invite
  const handleInvite = async () => {
    if (!selectedTeamId) return alert("please select a team.");

    const link = `${window.location.origin}/join/${selectedTeamId}`;
    setInviteLink(link);

    let emailToInvite = "";

    if (mode === "internal" && selectedUser) {
      emailToInvite = selectedUser.email;
    } else if (mode === "external" && form.email.trim()) {
      emailToInvite = form.email.trim().toLowerCase();
    } else {
      return alert("please select a user or enter a valid email.");
    }

    // save invite in team subcollection
    const inviteRef = doc(db, `teams/${selectedTeamId}/invites/${emailToInvite}`);
    await setDoc(inviteRef, {
      name: selectedUser?.displayName || form.name || "",
      email: emailToInvite,
      phone: form.phone || "",
      linkedin: form.linkedin || "",
      createdAt: new Date(),
    });

    // internal user notification
    if (mode === "internal" && selectedUser?.id) {
      const notifRef = doc(collection(db, "notifications"));
      await setDoc(notifRef, {
        userId: selectedUser.id,
        type: "invite",
        title: "new team invite",
        message: `you’ve been invited to join the team "${teams.find(t => t.id === selectedTeamId)?.name || "a team"}".`,
        teamId: selectedTeamId,
        read: false,
        timestamp: serverTimestamp(),
      });
    } else {
      // copy link for external users
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        console.log("clipboard failed. here’s your link:", link);
      }
    }

    await onInvite?.({ teamId: selectedTeamId, email: emailToInvite });
    setShowSentOverlay(true);
  };

  // copy invite link again
  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert("link copied to clipboard.");
    }
  };

  // render modal ui
  return (
    <div className="modal-backdrop">
      <div className="invite-modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="close">✕</button>
        <h2 className="invite-title">invite members</h2>

        <label className="select-team-label">select a team:</label>
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
          <button
            className={mode === "internal" ? "active" : ""}
            onClick={() => {
              setMode("internal");
              setSelectedUser(null);
              setForm((f) => ({ ...f, email: "" }));
            }}
          >
            invite existing user
          </button>
          <button
            className={mode === "external" ? "active" : ""}
            onClick={() => {
              setMode("external");
              setSelectedUser(null);
            }}
          >
            invite by link
          </button>
        </div>

        <div className="invite-form">
          {mode === "external" && (
            <>
              <input
                className="invite-input"
                name="email"
                placeholder="email address"
                value={form.email}
                onChange={handleChange}
              />
              <input
                className="invite-input"
                name="name"
                placeholder="name (optional)"
                value={form.name}
                onChange={handleChange}
              />
            </>
          )}
          <input
            className="invite-input"
            name="phone"
            placeholder="phone number (optional)"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            className="invite-input"
            name="linkedin"
            placeholder="linkedin profile (optional)"
            value={form.linkedin}
            onChange={handleChange}
          />

          <button
            className="invite-link-btn"
            onClick={handleInvite}
            disabled={mode === "internal" ? !selectedUser : !form.email.trim()}
          >
            <span>send invite</span>
            <span className="arrow">›</span>
          </button>

          <p className="invite-help">
            {mode === "internal"
              ? "select an existing user below to invite them to your team."
              : "enter an email address to generate an invite link."}
          </p>
        </div>

        {mode === "internal" && (
          <>
            <h3 className="pending-title">select a user to invite</h3>
            <div className="invites-list">
              {profiles.length === 0 ? (
                <p className="tasks-empty">no users available to invite.</p>
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
              <h4 className="overlay-title">invite sent!</h4>
              <p className="overlay-sub">
                {mode === "external"
                  ? "the invite link was copied to your clipboard."
                  : "a notification was sent to the user."}
              </p>

              {inviteLink && (
                <div className="overlay-email-preview">
                  <p><strong>email preview:</strong></p>
                  <p><em>subject:</em> you've been invited to join a team on gobearai</p>
                  <p><em>body:</em> click the link to join the team: <br />
                    <code>{inviteLink}</code>
                  </p>
                  <button onClick={handleCopyLink}>copy link again</button>
                </div>
              )}

              <button className="overlay-ok" onClick={() => setShowSentOverlay(false)}>
                ok
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
