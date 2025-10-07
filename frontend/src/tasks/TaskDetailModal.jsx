import React from "react";

export default function TaskDetailModal({ task, onClose }) {
  if (!task) return null;

  return (
    <div className="task-popup-overlay">
      <div className="task-popup-form">
        <h2>Task Details</h2>

        <p>
          <strong>Name:</strong> {task.name}
        </p>
        <p>
          <strong>Due:</strong>{" "}
          {task.due ? new Date(task.due).toLocaleDateString() : "No due date"}
        </p>
        <p>
          <strong>Description:</strong>{" "}
          {task.description && task.description.trim() !== ""
            ? task.description
            : "No description"}
        </p>
        <p>
          <strong>Team:</strong> {task.team || "Private Task"}
        </p>
        <p>
          <strong>Assigned To:</strong>{" "}
          {task.assignedUsers?.map((u) => u.displayName).join(", ") || "No one"}
        </p>

        <button className="popup-submit-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
