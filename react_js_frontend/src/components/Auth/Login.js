import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * PUBLIC_INTERFACE
 * Candidate and admin login form
 */
export default function Login() {
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  if (user) {
    navigate("/dashboard");
    return null;
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  };

  return (
    <div className="modal" style={{ margin: "3rem auto", maxWidth: 400 }}>
      <h2 className="card-title" style={{marginBottom: "1rem"}}>Sign In</h2>
      <form onSubmit={onSubmit} autoComplete="on">
        <div className="form-group">
          <label htmlFor="login-email" className="form-label">Email</label>
          <input id="login-email" className="form-input" required disabled={loading}
            type="email" autoFocus value={email}
            onChange={e=>setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password" className="form-label">Password</label>
          <input id="login-password" className="form-input" required disabled={loading}
            type="password" value={password}
            onChange={e=>setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {err && <div className="form-error">{err}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="text-sm mt2 text-end">
        No account? <Link to="/register" tabIndex={0}>Register here</Link>
      </div>
    </div>
  );
}
