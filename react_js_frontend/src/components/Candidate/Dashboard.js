import React, { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Candidate dashboard with personal status cards.
 */
export default function Dashboard() {
  const { user, supabase } = useAuth();
  const [results, setResults] = useState([]);
  const [nextExam, setNextExam] = useState(null);
  const [revalStatus, setRevalStatus] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: resultsData } = await supabase.from("results")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(2);
      setResults(resultsData || []);
      const { data: scheduleData } = await supabase.from("schedule")
        .select("*").gt("exam_date", new Date().toISOString()).order("exam_date").limit(1);
      setNextExam(scheduleData && scheduleData[0]);
      const { data: revalData } = await supabase.from("revaluations")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      setRevalStatus(revalData && revalData[0]);
    };
    if (user) fetchAll();
  }, [user, supabase]);

  return (
    <div>
      <h1 className="card-title">Welcome, {user?.user_metadata?.name || user.email}</h1>
      <div style={{display:"flex",gap: "1.3em", flexWrap: "wrap", marginBottom:"2em"}}>
        <div className="card" style={{minWidth: 240, flex: 1}}>
          <div className="card-meta">Latest Score</div>
          <div style={{fontSize: "2rem", color:"var(--color-accent)", fontWeight:600}}>
            {results[0]?.score ?? "--"}
          </div>
          <span className="chip info">{results[0]?.exam_name || "No result"}</span>
        </div>
        <div className="card" style={{minWidth: 240, flex: 1}}>
          <div className="card-meta">Next Exam</div>
          <div style={{fontSize: "1.5rem"}}>{nextExam?.exam_name ?? "–"}</div>
          <span className="text-muted text-sm">{nextExam ? (new Date(nextExam.exam_date)).toLocaleString() : "No upcoming schedule"}</span>
        </div>
        <div className="card" style={{minWidth: 240, flex: 1}}>
          <div className="card-meta">Revaluation Status</div>
          <div style={{fontWeight:600}}>
            {revalStatus?.status
              ? <span className={"chip "+(revalStatus.status)}>{revalStatus.status}</span>
              : <span className="text-muted">No request</span>}
          </div>
        </div>
      </div>
      <div>
        <h2>Quick Actions</h2>
        <a href="/results" className="btn" style={{ marginRight: 8 }}>View Scorecard</a>
        <a href="/revaluation" className="btn secondary" style={{ marginRight: 8 }}>Revaluation</a>
        <a href="/hallticket" className="btn outline">Download Hall Ticket</a>
      </div>
    </div>
  );
}
