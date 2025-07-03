// src/teams-page/TeamDetailsModal.jsx
import React from "react";

export default function TeamDetailsModal({ onClose }) {
  const team = {
    name: "Team Marketing",
    description: "We’re working on marketing career challenges for students.",
    members: ["Sophia Ullrich", "Willie Dong", "William Cao", "Diya Topiwala"],
    tasks: [
      { title: "Write pitch post", due: "June 30", assigned: "Sophia" },
      { title: "Create logo", due: "July 2", assigned: "William" },
      { title: "Design carousel", due: "July 5", assigned: "Diya" },
    ],
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{team.name}</h2>
        <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>{team.description}</p>

        <h3>Members</h3>
        <ul style={{ marginBottom: "1rem" }}>
          {team.members.map((member, index) => (
            <li key={index}>👤 {member}</li>
          ))}
        </ul>

        <h3>Tasks</h3>
        <ul>
          {team.tasks.map((task, index) => (
            <li key={index} style={{ marginBottom: "8px" }}>
              <strong>{task.title}</strong> <br />
              Due: {task.due} <br />
              Assigned to: {task.assigned}
            </li>
          ))}
        </ul>

        <button style={{ marginTop: "1rem" }}>Add New Task</button>
        <button style={{ marginTop: "1rem" }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
