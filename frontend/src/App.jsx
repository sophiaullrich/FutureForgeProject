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
import "./App.css";
import { IoNotificationsOutline, IoPersonCircleOutline, IoPersonCircle } from "react-icons/io5";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase";
import { ensureProfile } from "./teams-page/ProfileService.js";

function App() {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profilePrevPath = useRef(null);

  // Routes where global UI should be hidden
  const hideUIRoutes = ["/login", "/signup", "/resetpass"];
  const shouldHideUI = hideUIRoutes.includes(location.pathname.toLowerCase());

  useEffect(() => {
    const off = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await ensureProfile();
        }
      } catch (e) {
        console.error("ensureProfile failed:", e);
      }
    });
    return () => off();
  }, []);

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

  return (
    <div className="app-container">
      {/* Only show NavigationBar + icons if not on login/signup/reset */}
      {!shouldHideUI && (
        <>
          <NavigationBar />

          {/* Notifications Icon */}
          <div className="notif-icon">
            <IoNotificationsOutline size={45} />
          </div>

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
            {(location.pathname === "/settings" && hovered) ||
            (location.pathname !== "/settings" && !hovered) ? (
              <IoPersonCircleOutline size={45} color="#252B2F" />
            ) : (
              <IoPersonCircle size={45} color="#252B2F" />
            )}
          </div>
        </>
      )}

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
            <Route path="/resetpass" element={<Resetpass />} />
            <Route path="/profilepage" element={<ProfilePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/join/:teamId" element={<JoinTeamPage />} />
            <Route path="/friends" element={<MakeFriendsPage />} />
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
