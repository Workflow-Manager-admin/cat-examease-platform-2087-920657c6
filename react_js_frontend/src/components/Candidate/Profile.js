import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Profile management (view, update name)
 */
export default function Profile() {
  const { user, supabase } = useAuth();
  const [name, setName] = useState(user.user_metadata?.name || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ data: { name } });
      if (error) setErr(error.message);
      else setMsg("Profile updated!");
    } catch (err) {
      setErr(err.message);
    }
  };

  return (
    <div className="card" style={{maxWidth: 430}}>
      <h2 className="card-title">Profile</h2>
      <form onSubmit={handleUpdate}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={user.email} disabled />
        </div>
        {msg && <div className="chip success">{msg}</div>}
        {err && <div className="form-error">{err}</div>}
        <button className="btn">Update</button>
      </form>
    </div>
  );
}
