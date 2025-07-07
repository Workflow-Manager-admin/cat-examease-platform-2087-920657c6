import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./components/Auth/AuthContext";
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./components/Candidate/Dashboard";
import Results from "./components/Candidate/Results";
import Revaluation from "./components/Candidate/Revaluation";
import Notifications from "./components/Common/Notifications";
import HallTicket from "./components/Candidate/HallTicket";
import Schedule from "./components/Candidate/Schedule";
import Profile from "./components/Candidate/Profile";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import PageNotFound from "./components/Common/PageNotFound";
import "./App.css";

// App layout with Nav, Sidebar, Main Content, Notifications
function AppLayout() {
  const { user } = useContext(AuthContext);
  return (
    <div className="app-root">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <main className="content-area" tabIndex={-1}>
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/results" element={user ? <Results /> : <Navigate to="/login" />} />
            <Route path="/revaluation" element={user ? <Revaluation /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
            <Route path="/hallticket" element={user ? <HallTicket /> : <Navigate to="/login" />} />
            <Route path="/schedule" element={user ? <Schedule /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            {/* Admin-only route */}
            <Route path="/admin/dashboard" element={user && user.role==="admin" ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </main>
      </div>
      <Notifications fixed />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected routes */}
        <Route path="*" element={<AppLayout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
