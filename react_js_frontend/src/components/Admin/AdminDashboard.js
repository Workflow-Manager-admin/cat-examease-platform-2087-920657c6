import React, { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Admin dashboard: validation, analytics, workflow management.
 */
export default function AdminDashboard() {
  const { supabase } = useAuth();
  const [counts, setCounts] = useState({});
  const [pendingRevals, setPendingRevals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setErr("");
      try {
        const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
        const { count: resultCount } = await supabase.from("results").select("*", { count: "exact", head: true });
        const { data: pendingRevs } = await supabase.from("revaluations").select("*").eq("status", "pending").order("created_at", { ascending: false });
        setCounts({ users: userCount, results: resultCount });
        setPendingRevals(pendingRevs || []);
      } catch (e) { setErr("Failed to load stats"); }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const handleStatusUpdate = async (id, status) => {
    setLoading(true);
    await supabase.from("revaluations").update({ status }).eq("id", id);
    setPendingRevals(pendingRevals.map(r => r.id === id ? { ...r, status } : r));
    setLoading(false);
  };

  return (
    <div>
      <h1 className="card-title">Admin Dashboard</h1>
      {err && <div className="form-error">{err}</div>}
      <div className="card" style={{display:"flex",gap:"2em",marginBottom:22}}>
        <div>
          <div className="card-meta">Registered Candidates</div>
          <div style={{fontSize:"1.3em",fontWeight:700}}>{counts.users ?? "--"}</div>
        </div>
        <div>
          <div className="card-meta">Results Published</div>
          <div style={{fontSize:"1.3em",fontWeight:700}}>{counts.results ?? "--"}</div>
        </div>
      </div>
      <h2 className="card-title">Pending Revaluation Requests</h2>
      {loading && <div className="text-muted">Updating...</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Exam</th>
            <th>Reason</th>
            <th>Document</th>
            <th>Date</th>
            <th>Status</th>
            <th>Workflow</th>
          </tr>
        </thead>
        <tbody>
          {pendingRevals.map(row => (
            <tr key={row.id}>
              <td>{row.user_id}</td>
              <td>{row.exam_name}</td>
              <td>{row.reason}</td>
              <td>
                {row.document_url ? (
                  <a href={supabase.storage.from("documents").getPublicUrl(row.document_url).data?.publicUrl || "#"} target="_blank" rel="noopener noreferrer">View</a>
                ) : "-"}
              </td>
              <td>{row.created_at && (new Date(row.created_at)).toLocaleString()}</td>
              <td><span className={"chip "+row.status}>{row.status}</span></td>
              <td>
                <button className="btn" disabled={row.status!=="pending"} onClick={()=>handleStatusUpdate(row.id, "approved")}>Approve</button>
                <button className="btn secondary" disabled={row.status!=="pending"} onClick={()=>handleStatusUpdate(row.id, "rejected")}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!pendingRevals.length && <div className="text-muted">No pending requests.</div>}
    </div>
  );
}
