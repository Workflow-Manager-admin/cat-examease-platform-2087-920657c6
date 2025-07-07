import React, { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Result viewing; download scorecard as PDF (browser print-to-pdf).
 */
export default function Results() {
  const { user, supabase } = useAuth();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase.from("results")
        .select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) setError("Could not fetch results");
      setResults(data || []);
    };
    if (user) fetchResults();
  }, [user, supabase]);

  const handleDownload = (row) => {
    const printContent = document.getElementById("scorecard-" + row.id);
    if (!printContent) return;
    const printWindow = window.open("", "PRINT", "width=720,height=900");
    printWindow.document.write(`
      <html><head><title>Scorecard</title>
      <link rel="stylesheet" href="/index.css" />
      </head><body>
      ${printContent.innerHTML}
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 650);
  };

  return (
    <div>
      <h2 className="card-title">Exam Results</h2>
      {error && <div className="form-error">{error}</div>}
      {!results.length && <div className="text-muted">No result data yet.</div>}
      <table className="table" aria-label="Result table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Date</th>
            <th>Score</th>
            <th>Status</th>
            <th>Scorecard</th>
          </tr>
        </thead>
        <tbody>
          {results.map(row => (
            <tr key={row.id}>
              <td>{row.exam_name}</td>
              <td>{row.date ? (new Date(row.date)).toLocaleDateString() : "--"}</td>
              <td>{row.score ?? "--"}</td>
              <td>
                <span className={"chip "+(row.status || "info")}>{row.status}</span>
              </td>
              <td>
                <button className="btn outline" onClick={()=>handleDownload(row)}>Download PDF</button>
                <div style={{display:"none"}}>
                  <div id={"scorecard-"+row.id}>
                    <h2>CAT Exam Scorecard</h2>
                    <div>Name: {user.user_metadata?.name}</div>
                    <div>Email: {user.email}</div>
                    <div>Exam: {row.exam_name}</div>
                    <div>Date: {row.date ? (new Date(row.date)).toLocaleString() : ""}</div>
                    <div>Score: <strong>{row.score}</strong></div>
                    <div>Status: {row.status}</div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
