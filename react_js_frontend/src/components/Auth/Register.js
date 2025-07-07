import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * PUBLIC_INTERFACE
 * Candidate registration (creates Supabase account + profile)
 */
export default function Register() {
  const { register, loading, user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  if (user) {
    navigate("/dashboard");
    return null;
  }
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault(); setErr("");
    try {
      await register(form.email, form.password, form.name);
      navigate("/dashboard");
    } catch (e) {
      setErr(e.message || "Registration failed");
    }
  };

  return (
    <div className="modal" style={{ margin: "3rem auto", maxWidth: 400 }}>
      <h2 className="card-title" style={{marginBottom: "1rem"}}>Register</h2>
      <form onSubmit={onSubmit} autoComplete="on">
        <div className="form-group">
          <label htmlFor="register-name" className="form-label">Name</label>
          <input id="register-name" className="form-input" required disabled={loading}
            type="text" name="name" value={form.name}
            onChange={onChange} autoComplete="name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-email" className="form-label">Email</label>
          <input id="register-email" className="form-input" required disabled={loading}
            type="email" name="email" value={form.email}
            onChange={onChange} autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password" className="form-label">Password</label>
          <input id="register-password" className="form-input" required disabled={loading}
            type="password" name="password" value={form.password}
            onChange={onChange} autoComplete="new-password"
          />
        </div>
        {err && <div className="form-error">{err}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
      <div className="text-sm mt2 text-end">
        Already registered? <Link to="/login" tabIndex={0}>Login here</Link>
      </div>
    </div>
  );
}
