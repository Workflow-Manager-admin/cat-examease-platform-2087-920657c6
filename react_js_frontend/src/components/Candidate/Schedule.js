import React, { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Schedule view; shows upcoming and past exams.
 */
export default function Schedule() {
  const { user, supabase } = useAuth();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      const { data } = await supabase.from("schedule").select("*").order("exam_date");
      setSchedules(data || []);
    };
    fetchSchedule();
  }, [supabase]);

  return (
    <div>
      <h2 className="card-title">Exam Schedule</h2>
      {!schedules.length && <div className="text-muted">No schedule published yet.</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Date & Time</th>
            <th>Duration</th>
            <th>Venue</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(ev => (
            <tr key={ev.id}>
              <td>{ev.exam_name}</td>
              <td>{ev.exam_date && (new Date(ev.exam_date)).toLocaleString()}</td>
              <td>{ev.duration ?? "-"} min</td>
              <td>{ev.venue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
