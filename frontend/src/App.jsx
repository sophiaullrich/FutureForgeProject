<<<<<<< HEAD
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
=======
// import React from "react";
// import {Link, Routes, Route } from "react-router-dom";
// import TeamsPage from "./TeamsPage.jsx";
// import TasksPage from "./TasksPage.jsx";
// import './App.css';

// function App() {
//   return (
//       <div className="App">
//         <nav>
//           <ul>
//             <li>
//               <Link to="/">Home</Link>
//             </li>
//             <li>
//               <Link to="/tasks">Tasks</Link>
//             </li>
//             <li>
//               <Link to="/teams">Teams</Link>
//             </li>
//           </ul>
//         </nav>

//         <Routes>
//           <Route path="/" element={<h1>Welcome to your Home Page!</h1>} />
//           <Route path="/tasks" element={<TasksPage />} />
//           <Route path="/teams" element={<TeamsPage />} />
//           <Route path="*" element={<h2>404 - Page Not Found</h2>} />
//         </Routes>
//     </div>
//   );}

// export default App;
// frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TasksPage from './TasksPage.jsx';
import TeamsPage from './TeamsPage.jsx';
import NavigationBar from './NavigationBar.jsx'; 
import './App.css'; // <--- Ensure your main app CSS is imported
import { IoNotificationsOutline, IoNotifications } from "react-icons/io5";
import { IoPersonCircleOutline, IoPersonCircle } from "react-icons/io5";

function App() {
  return (
    <div className="app-container"> {/* Overall container for the entire application */}
      <NavigationBar /> 

      <div className="main-content-area"> {/* Contains header, tabs, and page content */}
        {/* Routed content (TasksPage, TeamsPage, etc.) will render here */}
        <div className="page-content-wrapper">
          <Routes>
            <Route path="/" element={<h1>Welcome to your Dashboard!</h1>} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </div>
      </div>

      {/* Notifications Icon */}
        <div className='notif-icon'>
          <IoNotificationsOutline size={45}/>
        </div>
      {/* Profile Icon */}
        <div className='profile-icon'>
          <IoPersonCircleOutline size={45}/>
        </div>
>>>>>>> 4c616fa372dc2877897269fdefa4915199720906
    </div>
  );
}

export default App;