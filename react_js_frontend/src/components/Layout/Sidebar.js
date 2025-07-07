import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Sidebar for section/module navigation
 */
export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <NavLink to="/dashboard" className="sidebar-link">🏠 Dashboard</NavLink>
      <NavLink to="/results" className="sidebar-link">📊 Results</NavLink>
      <NavLink to="/revaluation" className="sidebar-link">📝 Revaluation</NavLink>
      <NavLink to="/hallticket" className="sidebar-link">🎫 Hall Ticket</NavLink>
      <NavLink to="/schedule" className="sidebar-link">🗓️ Schedule</NavLink>
      <NavLink to="/profile" className="sidebar-link">👤 Profile</NavLink>
      {user.role === "admin" && (
        <NavLink to="/admin/dashboard" className="sidebar-link admin">⚡ Admin Panel</NavLink>
      )}
    </aside>
  );
}
