import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Top navigation bar for branding and user actions.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <span className="navbar-brand">CAT ExamEase</span>
      {user && (
        <div className="navbar-links" aria-label="Primary">
          <NavLink to="/dashboard" className="navbar-link">Dashboard</NavLink>
          <NavLink to="/results" className="navbar-link">Results</NavLink>
          <NavLink to="/revaluation" className="navbar-link">Revaluation</NavLink>
          <NavLink to="/schedule" className="navbar-link">Schedule</NavLink>
          <NavLink to="/profile" className="navbar-link">Profile</NavLink>
          {user.role === "admin" && (
            <NavLink to="/admin/dashboard" className="navbar-link">Admin</NavLink>
          )}
        </div>
      )}
      <div className="navbar-user">
        {!user ? (
          <>
            <NavLink to="/login" className="navbar-btn btn">Login</NavLink>
            <NavLink to="/register" className="navbar-btn btn secondary">Register</NavLink>
          </>
        ) : (
          <>
            <span className="text-sm" aria-label="user name">{user.email}</span>
            <button className="navbar-btn" onClick={handleLogout} type="button">Log out</button>
          </>
        )}
      </div>
    </nav>
  );
}
