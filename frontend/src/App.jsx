import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import TasksPage from "./TasksPage.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Resetpass from "./Resetpass.jsx";
import TeamsPage from "./teams-page/TeamsPage.jsx"; // note: corrected path
import NavigationBar from "./NavigationBar.jsx";
import DashboardPage from "./dashboard/DashboardPage.jsx";
import RewardsPage from './rewards-page/RewardsPage';
import NotificationPanel from './notifications/NotificationPanel';
import "./App.css";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";
import { database } from './Firebase'; 
import { ref, onValue, update } from "firebase/database";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);


  /*
  retrieves data from the path /notifications on firebase.
  data needs to be pushed to firebase on other components/files 
  for it to be displayed on the notifications panel such as:

  const sendNotification = () => {
  const notifRef = ref(database, 'notifications');
  push(notifRef, {
    title: "New Task",
    message: "Create Visuals",
    timestamp: Date.now(),
    read: false
  });
};
  */
  useEffect(() => {
    const notificationsRef = ref(database, 'notifications'); 
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notifArray = Object.entries(data).map(([id, notif]) => ({
        id,
        ...notif,
        time: new Date(notif.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        }),
      }));

        setNotifications(notifArray);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const markRead = (id) => {
    const notifRef = ref(database, `notifications/${id}`);
    update(notifRef, { read: true }).catch(console.error);
  };

  const markAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        const notifRef = ref(database, `notifications/${n.id}`);
        update(notifRef, { read: true }).catch(console.error);
      }
    });
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/Resetpass" element={<Resetpass />} />
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
          if (e.key === 'Enter' || e.key === ' ') toggleNotif();
        }}
      >
        <IoNotificationsOutline size={45} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </div>

      {/* Profile Icon */}
      <div className="profile-icon">
        <IoPersonCircleOutline size={45} />
      </div>

      <NotificationPanel
        open={notifOpen}
        onClose={closeNotif}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </div>
  );
}

export default App;
