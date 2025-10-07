// modal for adding a new task
import React, { useState } from "react";

export default function AddTaskModal({ onClose, onAdd, members = [] }) {
  // form fields
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");

  // handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !assignee.trim()) {
      alert("please fill out all fields.");
      return;
    }
    onAdd?.({ name: title.trim(), dueDate, assignedTo: assignee.trim() });
    onClose?.();
  };

  // styles (inline so it works anywhere)
  const overlay = {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,.55)",
    zIndex: 2000,
  };
  const card = {
    width: "min(780px, 92vw)",
    background: "#efe9d9",
    border: "3px solid #98b0d8",
    borderRadius: 10,
    boxShadow: "0 12px 28px rgba(0,0,0,.25)",
    padding: "16px 18px 18px",
  };
  const label = { color: "#6b8fb8", fontWeight: 700, marginBottom: 6 };
  const input = {
    width: "100%",
    background: "#fff",
    border: "1.5px solid #2b2d63",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
  };
  const row = {
    display: "flex",
    gap: 12,
    marginTop: 12,
    justifyContent: "center",
  };
  const cta = {
    width: "min(360px, 90%)",
    background: "#e7eefb",
    color: "#2b2d63",
    border: "3px solid #98b0d8",
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 700,
    cursor: "pointer",
  };
  const close = {
    position: "absolute",
    top: 10,
    right: 14,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "#2b2d63",
  };

  // render modal
  return (
    <div style={overlay}>
      <div style={{ position: "relative" }}>
        <button aria-label="close" onClick={onClose} style={close}>
          ×
        </button>
        <div style={card}>
          {/* simple form layout */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "contents" }}>
              <div style={label}>task name</div>
              <div style={label}>due date</div>
              <div style={label}>assigned to</div>

              <input
                style={input}
                placeholder="enter task name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                style={input}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              {/* use dropdown if members exist */}
              {members.length ? (
                <select
                  style={input}
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                >
                  <option value="" disabled>
                    select name
                  </option>
                  {members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  style={input}
                  placeholder="assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                />
              )}
            </div>

            <div style={row}>
              <button type="submit" style={cta}>
                add new task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
