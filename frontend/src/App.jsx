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

function App() {
  return (
    <div className="app-container"> {/* Overall container for the entire application */}
      <NavigationBar /> 

      <div className="main-content-area"> {/* Contains header, tabs, and page content */}
        <header className="app-header"> {/* Top section next to the navbar */}
          <div className="top-nav-links">
          </div>
          <div className="header-icons"> {/* Bell and user profile icons */}
            {/* Placeholder for bell icon */}
            <span role="img" aria-label="notifications">🔔</span>
            {/* Placeholder for user profile icon - move to bottom */}
            <span role="img" aria-label="user profile">👤</span> 
          </div>
        </header>

        {/* This is where your routed content (TasksPage, TeamsPage, etc.) will render */}
        <div className="page-content-wrapper">
          <Routes>
            <Route path="/" element={<h1>Welcome to your Dashboard!</h1>} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;