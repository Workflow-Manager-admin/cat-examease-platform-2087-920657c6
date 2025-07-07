import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Superadmin dashboard for user management; allows creation of new users (candidate, admin, superadmin).
 * Only visible to users with role "superadmin".
 */
export default function SuperadminDashboard() {
  const { user, supabase, session } = useAuth();

  // User form state
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "candidate" });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== "superadmin") {
    // Redirect handled at route level, but double protection
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1 className="card-title">Access Denied</h1>
        <p>Superadmin privileges required.</p>
      </div>
    );
  }

  // Form field change handler
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErr(""); setSuccess("");
  };

  // Simple frontend validation
  function validateFields(f) {
    if (!f.name.trim()) return "Name required";
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      return "Valid email required";
    if (!f.password || f.password.length < 6)
      return "Password must be at least 6 characters";
    if (!["candidate", "admin", "superadmin"].includes(f.role))
      return "Role must be candidate, admin, or superadmin";
    return null;
  }

  // Form submit (calls backend /admin/users)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    const validationError = validateFields(form);
    if (validationError) {
      setErr(validationError);
      return;
    }
    setLoading(true);
    try {
      // API base URL: same origin or set in REACT_APP_API_URL (.env)
      const apiBase = process.env.REACT_APP_API_URL || "/api";
      const endpoint = apiBase === "/api"
        ? "/admin/users"
        : apiBase.replace(/\/+$/, "") + "/admin/users";
      // Call backend using session JWT from Supabase
      const jwt = session?.access_token;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setSuccess(`User created: ${data.user.email} (${data.user.role})`);
        setForm({ name: "", email: "", password: "", role: "candidate" });
      } else {
        setErr(data && data.error ? data.error : "Failed to add user");
      }
    } catch (ex) {
      setErr(ex.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto" }}>
      <h1 className="card-title">Superadmin: Add New User</h1>
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label" htmlFor="sa-name">Full Name</label>
            <input
              id="sa-name"
              className="form-input"
              name="name"
              type="text"
              value={form.name}
              onChange={onChange}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sa-email">Email</label>
            <input
              id="sa-email"
              className="form-input"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sa-password">Password</label>
            <input
              id="sa-password"
              className="form-input"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sa-role">Role</label>
            <select
              id="sa-role"
              className="form-input"
              name="role"
              value={form.role}
              onChange={onChange}
              required
            >
              <option value="candidate">Candidate</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          {success && <div className="chip success">{success}</div>}
          {err && <div className="form-error">{err}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
      <div className="text-muted text-sm">
        This tool allows superadmins to register new users. After account creation, the user will receive an email to log in.
      </div>
    </div>
  );
}
