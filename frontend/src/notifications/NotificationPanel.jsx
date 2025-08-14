import React, { useEffect, useRef } from 'react';
import './NotificationPanel.css';
import { IoClose, IoCheckmarkDoneOutline } from 'react-icons/io5';

export default function NotificationPanel({
  open,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
}) {
  const panelRef = useRef();

  // use the esc key to close panel
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // click outside the panel to close
  useEffect(() => {
    function handleClick(e) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  return (
    <>
      <div className={`notif-overlay ${open ? 'open' : ''}`} aria-hidden={!open} />
      <aside
        ref={panelRef}
        className={`notification-panel ${open ? 'open' : ''}`}
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

          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${n.read ? 'read' : 'unread'}`}
              onClick={() => onMarkRead(n.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onMarkRead(n.id);
              }}
            >
              <div className="notif-left">
                <div className="notif-title">{n.title}</div>
                <div className="notif-meta">{n.message}</div>
              </div>
              <div className="notif-right">
                <div className="notif-time">{n.time}</div>
                {!n.read && <span className="unread-dot" />}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}