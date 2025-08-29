import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import TasksPage from "./TasksPage.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Resetpass from "./Resetpass.jsx";
import TeamsPage from "./teams-page/TeamsPage.jsx";
import NavigationBar from "./NavigationBar.jsx";
import DashboardPage from "./dashboard/DashboardPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import RewardsPage from "./rewards-page/RewardsPage";
import Settings from "./Settings.jsx";
import JoinTeamPage from "./teams-page/JoinTeamPage";
import NotificationPanel from './notifications/NotificationPanel';
import "./App.css";

import { IoNotificationsOutline, IoPersonCircleOutline, IoPersonCircle } from "react-icons/io5";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase";
import { ensureProfile } from "./teams-page/ProfileService.js";

function App() {
  const [hovered, setHovered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const profilePrevPath = useRef(null);

  const hideUIRoutes = ["/login", "/signup", "/resetpass"];
  const shouldHideUI = hideUIRoutes.includes(location.pathname.toLowerCase());
  
  useEffect(() => {
    const off = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await ensureProfile();
          await fetchNotifications(user);
        } catch (err) {
          console.error("Error ensuring profile or fetching notifications:", err);
        }
      } else {
        setNotifications([]); 
      }
    });
    return () => off();
  }, []);

  const fetchNotifications = async (user) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:5000/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      await Promise.all(
        notifications.filter(n => !n.read).map(n =>
          fetch(`http://localhost:5000/notifications/${n.id}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNotif = () => setNotifOpen(s => !s);
  const closeNotif = () => setNotifOpen(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const SafeTeamsWrapper = () => {
    try {
      return <TeamsPage />;
    } catch (error) {
      console.error("TeamsPage crashed:", error);
      return (
        <div style={{ padding: "2rem", color: "red" }}>
          <h2>Error loading TeamsPage</h2>
          <p>{error.message}</p>
        </div>
      );
    }
  };

  if (shouldHideUI) {
    return (
      <div className="fullscreen-page">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resetpass" element={<Resetpass />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">
      <NavigationBar />

      <div className="main-content-area">
        <div className="page-content-wrapper">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/teams" element={<SafeTeamsWrapper />} />
            <Route path="/profilepage" element={<ProfilePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/join/:teamId" element={<JoinTeamPage />} />
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </div>
      </div>

      {/* Notifications Icon */}
      <div
        className="notif-icon"
        onClick={toggleNotif}
        role="button"
        aria-label="Open notifications"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleNotif(); }}
      >
        <IoNotificationsOutline size={45} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </div>

      <NotificationPanel
        open={notifOpen}
        onClose={closeNotif}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />

      {/* Profile Icon */}
      <div
        className="profile-icon"
        onClick={() => {
          if (location.pathname === "/profilepage") {
            navigate(profilePrevPath.current || "/dashboard");
          } else {
            profilePrevPath.current = location.pathname;
            navigate("/profilepage");
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {(location.pathname === "/settings" && hovered) ||
        (location.pathname !== "/settings" && !hovered) ? (
          <IoPersonCircleOutline size={45} color="#252B2F" />
        ) : (
          <IoPersonCircle size={45} color="#252B2F" />
        )}
      </div>
    </div>
  );
}

export default App;
