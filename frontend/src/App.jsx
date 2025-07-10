import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TasksPage from './TasksPage.jsx';
//import TeamsPage from './teams-page/TeamsPage.jsx'; // note: corrected path
import TeamsPage from './TeamsPage.jsx';
import NavigationBar from './NavigationBar.jsx'; 
import './App.css';
import { IoNotificationsOutline } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";

function App() {
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
            <Route path="/" element={<h1>Welcome to your Dashboard!</h1>} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/teams" element={<SafeTeamsWrapper />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </div>
      </div>

      {/* Notifications Icon */}
      <div className="notif-icon">
        <IoNotificationsOutline size={45} />
      </div>

      {/* Profile Icon */}
      <div className="profile-icon">
        <IoPersonCircleOutline size={45} />
      </div>
    </div>
  );
}

export default App;
