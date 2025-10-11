// modal for adding a new task
import React, { useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

export default function AddTaskModal({ onClose, onAdd, members = [] }) {
  // form fields
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !assignee.trim()) {
      alert("please fill out all fields.");
      return;
    }
    onAdd?.({ name: title.trim(), dueDate, assignedTo: assignee.trim() });
    onClose?.();
  };

  // ---- Styles ----
  const overlay = {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,.55)",
    zIndex: 2000,
  };

  const shell = { position: "relative" };

  const closeBtn = {
    position: "absolute",
    top: 10,
    right: 14,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    lineHeight: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const card = {
    width: "min(780px, 92vw)",
    maxHeight: "80vh",
    background: "#F3E7D3",
    border: "4px solid #6096BA",
    borderRadius: 10,
    boxShadow: "0 12px 28px rgba(0,0,0,.25)",
    padding: "16px 18px 18px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };

  // scrollable body
  const body = { overflowY: "auto", paddingRight: 4 };

  // 3-column grid
  const grid = {
    display: "grid",
    gridTemplateColumns: "1fr 220px 220px",
    columnGap: 12,
    rowGap: 10,
    alignItems: "end",
  };

  const label = {
    color: "#6096ba",
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 4,
  };

  const inputBase = {
    width: "100%",
    height: 40,
    background: "#fff",
    border: "1.5px solid #2b2d63",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 16,
    boxSizing: "border-box",
  };

  const row = { display: "flex", justifyContent: "center", marginTop: 16 };

  const cta = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "min(255px, 80%)",
    height: 38,
    background: "#f3e7d3",
    color: "#6096ba",
    border: "3px solid #6096ba",
    borderRadius: 5,
    padding: "0 18px",
    fontWeight: 700,
    fontSize: 20,
    cursor: "pointer",
  };

  return (
    <div style={overlay}>
      <div style={shell}>
        <button aria-label="close" onClick={onClose} style={closeBtn}>
          <IoCloseCircleOutline size={45} color="#252b2f" />
        </button>

        <div style={card}>
          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            <div style={body}>
              <div style={grid}>
                {/* Labels */}
                <div style={label}>Task Name</div>
                <div style={label}>Due Date</div>
                <div style={label}>Assigned To</div>

                {/* Inputs */}
                <input
                  style={inputBase}
                  placeholder="Enter Task Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <input
                  style={inputBase}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />

                {members.length ? (
                  <select
                    style={inputBase}
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Name
                    </option>
                    {members.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    style={inputBase}
                    placeholder="Assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div style={row}>
              <button type="submit" style={cta}>
                Add New Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
