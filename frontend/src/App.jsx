import React, { useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation} from "react-router-dom";
import TasksPage from "./TasksPage.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Resetpass from "./Resetpass.jsx";
import TeamsPage from "./teams-page/TeamsPage.jsx"; // note: corrected path
import NavigationBar from "./NavigationBar.jsx";
import DashboardPage from "./dashboard/DashboardPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import RewardsPage from './rewards-page/RewardsPage';
import Settings from './Settings.jsx'
import "./App.css";
import { IoNotificationsOutline,  IoPersonCircleOutline, IoPersonCircle } from "react-icons/io5";


function App() {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profilePrevPath = useRef(null);

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
            <Route path="/ProfilePage" element={<ProfilePage />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </div>
      </div>

      {/* Notifications Icon */}
      <div className="notif-icon">
        <IoNotificationsOutline size={45} />
      </div>

      {/* Profile Icon */}
      <div
        className="profile-icon"
        onClick={() => {
          if (location.pathname === "/ProfilePage") {
            navigate(profilePrevPath.current || "/dashboard");
          } else {
            profilePrevPath.current = location.pathname;
            navigate("/ProfilePage");
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

    </div>
  );
}

export default App;
