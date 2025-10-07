import React, { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { IoNotificationsOutline, IoPersonCircleOutline, IoPersonCircle } from "react-icons/io5";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import NavigationBar from "../NavigationBar.jsx";
import NotificationPanel from "../notifications/NotificationPanel.jsx";
import { useAuth } from "../context/AuthContext";

const Spinner = () => <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

export default function ProtectedLayout() {
  const { currentUser, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const profilePrevPath = React.useRef(null);

  // Notifications subscription
  useEffect(() => {
    if (!currentUser) return;

    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const newNotifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(newNotifs);
    }, (error) => console.error("Notifications error:", error));

    return () => unsubscribe();
  }, [currentUser]);

  const markRead = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => updateDoc(doc(db, "notifications", n.id), { read: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  }, [notifications]);

  const handleNotificationClick = (notification) => {
    markRead(notification.id);
    switch (notification.type) {
      case "friendRequest": navigate("/friends"); break;
      case "teamInvite":
      case "teamJoined": navigate("/teams"); break;
      case "task": navigate(`/tasks?notifId=${notification.notifId}&taskId=${notification.taskId}`); break;
      default: navigate("/dashboard");
    }
    setNotifOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <Spinner />;

  return (
    <div className="protected-layout">
      <div className="app-container">
        <NavigationBar />
        <main className="main-content-area">
          <div className="page-content-wrapper">
            <Outlet context={{ currentUser }} />
          </div>
        </main>
      </div>

      <div className="notif-icon" onClick={() => setNotifOpen(prev => !prev)} role="button" tabIndex={0} aria-label="Open notifications">
        <IoNotificationsOutline size={45} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </div>

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onNotificationClick={handleNotificationClick}
      />

      <div
        className="profile-icon"
        onClick={() => {
          if (location.pathname === "/profilepage") navigate(profilePrevPath.current || "/dashboard");
          else { profilePrevPath.current = location.pathname; navigate("/profilepage"); }
        }}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {((location.pathname === "/settings") && hovered) || (location.pathname !== "/settings" && !hovered) ? (
          <IoPersonCircleOutline size={45} color="#252B2F" />
        ) : (
          <IoPersonCircle size={45} color="#252B2F" />
        )}
      </div>
    </div>
  );
}
