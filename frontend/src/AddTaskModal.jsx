import React, { useState } from "react";

export default function AddTaskModal({ onClose, onAdd, members = [] }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !assignee.trim()) {
      alert("Please fill out all fields.");
      return;
    }
    onAdd?.({ name: title.trim(), dueDate, assignedTo: assignee.trim() });
    onClose?.();
  };

  // ——— styles (scoped here so you don’t need TeamsPage.css) ———
  const overlay = {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "rgba(0,0,0,.55)", zIndex: 2000,
  };
  const card = {
    width: "min(780px, 92vw)",
    background: "#efe9d9",
    border: "3px solid #98b0d8",
    borderRadius: 10,
    boxShadow: "0 12px 28px rgba(0,0,0,.25)",
    padding: "16px 18px 18px",
  };
  const grid = {
    display: "grid",
    gridTemplateColumns: "1fr 220px 220px",
    gap: 12,
    alignItems: "end",
  };
  const label = { color: "#6b8fb8", fontWeight: 700, marginBottom: 6 };
  const input = {
    width: "100%", background: "#fff",
    border: "1.5px solid #2b2d63", borderRadius: 8,
    padding: "10px 12px", fontSize: 14,
  };
  const row = { display: "flex", gap: 12, marginTop: 12, justifyContent: "center" };
  const cta = {
    width: "min(360px, 90%)",
    background: "#e7eefb", color: "#2b2d63",
    border: "3px solid #98b0d8", borderRadius: 10,
    padding: "12px 16px", fontWeight: 700, cursor: "pointer",
  };
  const close = {
    position: "absolute", top: 10, right: 14,
    background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#2b2d63",
  };

  return (
    <div style={overlay}>
      <div style={{ position: "relative" }}>
        <button aria-label="Close" onClick={onClose} style={close}>×</button>
        <div style={card}>
          {/* 3-column form like the mock */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "contents" }}>
              <div style={label}>Task Name</div>
              <div style={label}>Due Date</div>
              <div style={label}>Assigned To</div>

              <input
                style={input}
                placeholder="Enter Task Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                style={input}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              {/* If members were passed, use a select. Otherwise fall back to free text. */}
              {members.length ? (
                <select
                  style={input}
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                >
                  <option value="" disabled>Select Name</option>
                  {members.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <input
                  style={input}
                  placeholder="Assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                />
              )}
            </div>

            <div style={row}>
              <button type="submit" style={cta}>Add New Task</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
