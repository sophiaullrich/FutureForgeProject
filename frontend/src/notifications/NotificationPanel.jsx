import React, { useEffect, useRef } from "react";
import "./NotificationPanel.css";
import { IoClose, IoCheckmarkDoneOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const formatTimestamp = (ts) => {
  if (!ts) return "";

  let date;
  if (ts.toDate) {
    date = ts.toDate();
  } else if (ts._seconds != null) {
    date = new Date(ts._seconds * 1000 + ts._nanoseconds / 1000000);
  } else {
    date = new Date(ts);
  }

  if (isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function NotificationPanel({
  open,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
}) {
  const panelRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    function handleClick(e) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  const handleNotificationClick = (n) => {
    onMarkRead(n.id);

    if (n.type === "task" && n.taskId) {
      navigate(`/tasks?notifId=${n.notifId}&taskId=${n.taskId}`);
    } else if (n.type === "team" && n.teamId) {
      navigate(`/teams?notifId=${n.notifId}&teamId=${n.teamId}`);
    } 

    onClose();
  };

  return (
    <>
      <div
        className={`notif-overlay ${open ? "open" : ""}`}
        aria-hidden={!open}
      />
      <aside
        ref={panelRef}
        className={`notification-panel ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        <div className="panel-header">
          <h3>Notifications</h3>
          <div className="panel-actions">
            <button
              className="mark-all-btn"
              onClick={onMarkAllRead}
              title="Mark all as read"
            >
              <IoCheckmarkDoneOutline size={16} /> Mark all
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <IoClose size={20} />
            </button>
          </div>
        </div>

        <div className="panel-body">
          {notifications.length === 0 && (
            <div className="empty">You're all caught up!</div>
          )}

          {notifications.map((n) => {
            const dueDate =
              n.taskDue && !isNaN(new Date(n.taskDue).getTime())
                ? ` (Due: ${new Date(n.taskDue).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })})`
                : "";

            return (
              <div
                key={n.id}
                className={`notif-item ${n.read ? "read" : "unread"}`}
                onClick={() => handleNotificationClick(n)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNotificationClick(n);
                }}
              >
                <div className="notif-left">
                  <div className="notif-title" style={{ fontWeight: "bold" }}>
                    {n.title}
                    {dueDate}
                  </div>
                  <div className="notif-meta">{n.message}</div>
                </div>
                <div className="notif-right">
                  <div className="notif-time">
                    {formatTimestamp(n.timestamp)}
                  </div>
                  {!n.read && <span className="unread-dot" />}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
