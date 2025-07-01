import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import './App.css';
import TeamsPage from "./teams-page/TeamsPage.jsx";
import TasksPage from "./TasksPage.jsx";

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
    <div className="App">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/tasks">Tasks</Link>
          </li>
          <li>
            <Link to="/teams">Teams</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Welcome to your Home Page!</h1>} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/teams" element={<SafeTeamsWrapper />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </div>
  );
}

export default App;
