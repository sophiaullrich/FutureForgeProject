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
import MakeFriendsPage from "./friends-page/MakeFriendsPage.jsx";
import RewardsPage from "./rewards-page/RewardsPage";
import Settings from "./Settings.jsx";
import JoinTeamPage from "./teams-page/JoinTeamPage";
import NotificationPanel from "./notifications/NotificationPanel";
import LandingPage from "./LandingPage.jsx";

import "./App.css";

import {
  IoNotificationsOutline,
  IoPersonCircleOutline,
  IoPersonCircle,
} from "react-icons/io5";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./Firebase"; // Firestore
import { ensureProfile } from "./teams-page/ProfileService.js";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

function App() {
  const [hovered, setHovered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const profilePrevPath = useRef(null);

  // Routes where global UI (nav, icons) should be hidden
  const hideUIRoutes = ["/", "/login", "/signup", "/resetpass"];
  const shouldHideUI = hideUIRoutes.includes(
    location.pathname.toLowerCase()
  );

  useEffect(() => {
    let unsubscribeNotif = null;

    const offAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          await ensureProfile();

          const notifQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            orderBy("timestamp", "desc")
          );

          unsubscribeNotif = onSnapshot(notifQuery, (snapshot) => {
            const newNotifs = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
            setNotifications(newNotifs);
          });
        } catch (err) {
          console.error("Error ensuring profile or fetching notifications:", err);
        }
      } else {
        setNotifications([]);
        if (unsubscribeNotif) unsubscribeNotif();
      }
    });

    return () => {
      offAuth();
      if (unsubscribeNotif) unsubscribeNotif();
    };
  }, []);

  const markRead = async (id) => {
    if (!currentUser) return;
    try {
      const notifRef = doc(db, "notifications", id);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    if (!currentUser) return;
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => updateDoc(doc(db, "notifications", n.id), { read: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNotif = () => setNotifOpen((s) => !s);
  const closeNotif = () => setNotifOpen(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Wrapper to avoid whole-app crash if TeamsPage throws
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

  // --------- HIDDEN-UI ROUTES (Landing + Auth) ----------
  if (shouldHideUI) {
    return (
      <div className="fullscreen-page">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resetpass" element={<Resetpass />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </div>
    );
  }

  // --------- MAIN APP (with Navigation + Icons) ----------
  return (
    <div className="app-container">
      <NavigationBar />

      <div className="main-content-area">
        <div className="page-content-wrapper">
          <Routes>
            {/* If users try "/", keep them on Dashboard inside the main app */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/teams" element={<SafeTeamsWrapper />} />
            <Route path="/profilepage" element={<ProfilePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/join/:teamId" element={<JoinTeamPage />} />
            <Route path="/friends" element={<MakeFriendsPage />} />
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
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleNotif();
        }}
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
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {((location.pathname === "/settings") && hovered) ||
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
