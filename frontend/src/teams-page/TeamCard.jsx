// src/teams-page/TeamCard.jsx
import React from "react";

export default function TeamCard({ name }) {
  return (
    <button style={{
      background: "#fffbea",
      padding: "1rem",
      borderRadius: "6px",
      border: "2px solid #a3bffa",
      textAlign: "left",
      fontWeight: "bold"
    }}>
      {name} &nbsp; →
    </button>
  );
}
