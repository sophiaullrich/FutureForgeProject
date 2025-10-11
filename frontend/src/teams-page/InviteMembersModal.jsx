// InviteMembersModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { listProfiles } from "./ProfileService";
import { auth, db } from "../Firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { IoCloseCircleOutline, IoChevronForward } from "react-icons/io5";

export default function InviteMembersModal({ onClose, teams = [], onInvite }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
  });
  const [mode, setMode] = useState("internal"); // internal and external
  const [profiles, setProfiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userQuery, setUserQuery] = useState("");
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
      const filtered = all.filter((p) => p.id !== currentUid && !p.disabled);
      setProfiles(filtered);
    })();
  }, [currentUid]);

  useEffect(() => {
    if (teams.length > 0) {
      setSelectedTeamId(teams[0].docId || teams[0].id);
    }
  }, [teams]);

  const filteredProfiles = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((u) => {
      const name = (u.displayName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [profiles, userQuery]);

  const handleInvite = async () => {
    if (!auth.currentUser?.uid) return alert("Please sign in.");
    if (!selectedTeamId) return alert("Please select a team.");

    const link = `${window.location.origin}/join/${selectedTeamId}`;
    setInviteLink(link);

    let emailToInvite = "";
    if (mode === "internal" && selectedUser) {
      emailToInvite = (selectedUser.email || "").trim().toLowerCase();
    } else if (mode === "external" && form.email.trim()) {
      emailToInvite = form.email.trim().toLowerCase();
    } else {
      return alert("Please select a user or enter a valid email.");
    }

    const teamObj =
      teams.find((t) => (t.docId || t.id) === selectedTeamId) || null;
    if (!teamObj || teamObj.ownerId !== auth.currentUser.uid) {
      alert("Only the team owner can send invites.");
      return;
    }

    try {
      await onInvite?.({ teamId: selectedTeamId, email: emailToInvite });
    } catch (err) {
      console.error("Invite write failed via service:", err);
      alert(
        /permission/i.test(String(err?.message))
          ? "Insufficient permissions: only the team owner can invite, or check your Firestore rules."
          : err?.message || "Failed to create invite."
      );
      return;
    }

    if (mode === "internal" && selectedUser?.id) {
      const notifRef = doc(collection(db, "notifications"));
      try {
        await setDoc(notifRef, {
          userId: selectedUser.id,
          type: "invite",
          title: "New team invite",
          message: `You've been invited to join the team "${
            teamObj?.name || "a team"
          }".`,
          teamId: selectedTeamId,
          read: false,
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Notification write failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        console.log("Clipboard failed. here's your link:", link);
      }
    }

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
        <button className="modal-close" onClick={onClose} aria-label="close">
          <IoCloseCircleOutline size={45} />
        </button>
        <h2 className="invite-title">Invite Members</h2>

        <label className="select-team-label">Select a Team:</label>
        <select
          className="select-team-dropdown"
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
        >
          {teams.map((team) => (
            <option key={team.docId || team.id} value={team.docId || team.id}>
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
            Invite Existing User
          </button>
          <button
            className={mode === "external" ? "active" : ""}
            onClick={() => {
              setMode("external");
              setSelectedUser(null);
            }}
          >
            Invite By Link
          </button>
        </div>

        <div className="invite-form">
          {mode === "external" && (
            <>
              <input
                className="invite-input"
                name="email"
                placeholder="Email address"
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
            placeholder="Phone number (optional)"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            className="invite-input"
            name="linkedin"
            placeholder="Linkedin profile (optional)"
            value={form.linkedin}
            onChange={handleChange}
          />

          <button
            className="invite-link-btn"
            onClick={handleInvite}
            disabled={mode === "internal" ? !selectedUser : !form.email.trim()}
          >
            <span>Send Invite</span>
            <IoChevronForward size={20} />
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

            <div className="search-row">
              <span className="search-icon">🔎</span>
              <input
                className="search-input"
                placeholder="Search by name or email…"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>

            <div className="invites-list scrollable-list">
              {filteredProfiles.length === 0 ? (
                <p className="tasks-empty">no users match your search.</p>
              ) : (
                filteredProfiles.map((user) => {
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <div
                      key={user.id}
                      className={`invite-row ${isSelected ? "selected" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedUser(user);
                      }}
                      style={{ cursor: "pointer", pointerEvents: "auto" }}
                    >
                      <div className="invite-left">
                        <span className="avatar-dot" />
                        <span className="invite-name">
                          {user.displayName || user.email}
                        </span>
                      </div>
                      <span className="invite-status pending">
                        {user.email}
                      </span>
                    </div>
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
                  ? "The invite link was copied to your clipboard."
                  : "A notification was sent to the user."}
              </p>

              {inviteLink && (
                <div className="overlay-email-preview">
                  <p>
                    <strong>email preview:</strong>
                  </p>
                  <p>
                    <em>subject:</em> you've been invited to join a team on
                    gobearai
                  </p>
                  <p>
                    <em>body:</em> click the link to join the team: <br />
                    <code>{inviteLink}</code>
                  </p>
                  <button onClick={handleCopyLink}>copy link again</button>
                </div>
              )}

              <button
                className="overlay-ok"
                onClick={() => setShowSentOverlay(false)}
              >
                ok
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
