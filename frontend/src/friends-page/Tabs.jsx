import React from "react";

export default function Tabs({ tab, counts, onTab }) {
  const T = (id, label) => (
    <button
      className={`tab ${tab === id ? "active" : ""}`}
      onClick={() => onTab(id)}
      aria-current={tab === id ? "page" : undefined}
    >
      {label}
      {counts?.[id] ? (
        <span className="badge" aria-label={`${counts[id]} items`}>
          {counts[id]}
        </span>
      ) : null}
    </button>
  );

  return (
    <div role="tablist" className="tabs">
      {T("friends", "Friends")}
      {T("requests", "Requests")}
      {T("pending", "Pending")}
    </div>
  );
}
