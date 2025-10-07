import React from "react";
import { Routes, Route } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout.jsx";
import ProtectedLayout from "./layouts/ProtectedLayout.jsx";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./LandingPage.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Resetpass from "./Resetpass.jsx";

import DashboardPage from "./dashboard/DashboardPage.jsx";
import TasksPage from "./tasks/TasksPage.jsx";
import TeamsPage from "./teams-page/TeamsPage.jsx";
import JoinTeamPage from "./teams-page/JoinTeamPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import Settings from "./Settings.jsx";
import RewardsPage from "./rewards-page/RewardsPage.jsx";
import MakeFriendsPage from "./friends-page/MakeFriendsPage.jsx";
import FriendRequestsPage from "./friends-page/FriendRequestsPage.jsx";
import PendingRequestsPage from "./friends-page/PendingRequestsPage.jsx";
import Chat from "./chat.jsx"; // Add this import

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resetpass" element={<Resetpass />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/join/:teamId" element={<JoinTeamPage />} />
          <Route path="/profilepage" element={<ProfilePage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/friends" element={<MakeFriendsPage />} />
          <Route path="/friends/requests" element={<FriendRequestsPage />} />
          <Route path="/friends/pending" element={<PendingRequestsPage />} />
          <Route path="/chat" element={<Chat />} /> {/* Add this line */}
        </Route>

        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
