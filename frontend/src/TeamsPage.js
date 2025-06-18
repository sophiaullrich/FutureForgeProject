import React, { useState } from "react";

const dummyTeam = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" }
];

export default function TeamsPage() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");

  const handleInvite = (e) => {
    e.preventDefault();
    alert(`Pretending to invite: ${email}`);
    setEmail("");
    setShowForm(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Your Teams
      </h1>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {dummyTeam.map((member) => (
          <li
            key={member.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px"
            }}
          >
            <img
              src={member.avatar}
              alt={member.name}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                marginRight: "15px"
              }}
            />
            <span>{member.name}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#2563EB",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        {showForm ? "Cancel" : "Invite User"}
      </button>

      {showForm && (
        <form onSubmit={handleInvite} style={{ marginTop: "20px" }}>
          <input
            type="email"
            placeholder="Enter user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#22C55E",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Send Invite
          </button>
        </form>
      )}
    </div>
  );
}
