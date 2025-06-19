import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TeamsPage from "./TeamsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/teams" element={<TeamsPage />} />
      </Routes>
    </Router>
  );
}

