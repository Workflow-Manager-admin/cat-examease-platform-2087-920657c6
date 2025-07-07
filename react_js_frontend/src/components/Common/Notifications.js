import React, { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Notification bell and floating notification area. 
 * For MVP, polls notifications from Supabase every 30s (real-time subscribe could replace).
 */
export default function Notifications({ fixed = false }) {
  const { user, supabase } = useAuth();
  const [notes, setNotes] = useState([]);
  const [visible, setVisible] = useState(false);

  // Poll notifications if logged in
  useEffect(() => {
    let interval;
    if (user) {
      const fetchNotes = async () => {
        const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6);
        setNotes(data || []);
      };
      fetchNotes();
      interval = setInterval(fetchNotes, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [user,supabase]);

  if (!user) return null;
  return (
    <>
      {fixed && (
        <button className="btn outline" style={{position: "fixed", bottom: 18, right: 18, zIndex: 120}}
          onClick={()=>setVisible(x=>!x)}
          aria-label="Show notifications"
        >
          🔔 Notifications ({notes.length || 0})
        </button>
      )}
      {(visible || !fixed) && (
        <div style={{
          position: fixed ? "fixed" : "static",
          bottom: 60, right: 16, maxWidth: 340, zIndex: 120,
          background: "#fff", borderRadius: 8, boxShadow: "0 3px 12px #00336622", padding: "1rem 1.2rem"
        }}>
          <h4 style={{margin: "0 0 0.7em"}}>Notifications</h4>
          {!notes.length && <div className="text-muted">No notifications.</div>}
          <ul style={{paddingLeft: 0, listStyle: "none"}}>
            {notes.map(n => (
              <li key={n.id} style={{marginBottom: 9}}>
                <span className={"chip "+(n.type||"info")}>{n.type || "info"}</span>
                {n.message}
                <span className="text-muted" style={{fontSize: "0.88em", marginLeft: 7}}>
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          {fixed && <button className="btn outline" style={{marginTop: 10}} onClick={()=>setVisible(false)}>Close</button>}
        </div>
      )}
    </>
  );
}
