import React from "react";
import {Link, Routes, Route } from "react-router-dom";
import TeamsPage from "./TeamsPage.jsx";
import TasksPage from "./TasksPage.jsx";
import './App.css';

function App() {
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
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
    </div>
  );}

export default App;
