import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Revaluation application form (with file upload & payment integration placeholder)
 */
export default function Revaluation() {
  const { user, supabase } = useAuth();
  const [form, setForm] = useState({ exam_name: "", reason: "", file: null });
  const [status, setStatus] = useState("");
  const [prev, setPrev] = useState([]);
  const [err, setErr] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    // Show previous revaluations
    const fetchPrev = async () => {
      const { data } = await supabase.from("revaluations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4);
      setPrev(data || []);
    };
    fetchPrev();
  }, [user, supabase]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  // PUBLIC_INTERFACE
  const handleReval = async e => {
    e.preventDefault();
    setStatus(""); setErr("");
    try {
      let uploadUrl;
      if (form.file) {
        // Upload document to Supabase Storage
        const filePath = `revaluation/${user.id}/${Date.now()}-${form.file.name}`;
        let { error: uploadError } = await supabase.storage.from("documents").upload(filePath, form.file);
        if (uploadError) throw uploadError;
        uploadUrl = filePath;
      }
      // Insert reval request row
      const { error } = await supabase.from("revaluations").insert([{
        user_id: user.id,
        exam_name: form.exam_name,
        reason: form.reason,
        document_url: uploadUrl,
        status: "pending"
      }]);
      if (error) throw error;
      setStatus("Revaluation request submitted!");
      setForm({ exam_name: "", reason: "", file: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setErr(err.message);
    }
  };

  // Stub for payment integration
  const handlePay = async () => {
    setPayLoading(true);
    setTimeout(() => {
      setPayLoading(false);
      alert("Payment gateway integration to be done here.");
    }, 1100);
  };

  return (
    <div>
      <h2 className="card-title">Apply for Revaluation</h2>
      <form className="card" onSubmit={handleReval} style={{maxWidth: 500, marginBottom: 32}}>
        <div className="form-group">
          <label className="form-label">Exam Name</label>
          <input className="form-input" name="exam_name" value={form.exam_name} required onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea className="form-input" name="reason" required value={form.reason} onChange={handleChange} rows={3} />
        </div>
        <div className="form-group">
          <label className="form-label">Supporting Document</label>
          <input className="form-input" ref={fileInputRef} name="file" type="file" accept=".pdf,.png,.jpg" onChange={handleChange} />
        </div>
        {status && <div className="chip success">{status}</div>}
        {err && <div className="form-error">{err}</div>}
        <button className="btn" type="submit">Submit Revaluation</button>
        <button type="button" className="btn secondary" onClick={handlePay} disabled={payLoading} style={{marginLeft:10}}>
          {payLoading ? "Processing..." : "Pay Fee"}
        </button>
      </form>
      <div>
        <h3 style={{marginBottom:6}}>Previous Applications</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Exam</th>
              <th>Date</th>
              <th>Status</th>
              <th>Document</th>
            </tr>
          </thead>
          <tbody>
            {prev.map(row => (
              <tr key={row.id}>
                <td>{row.exam_name}</td>
                <td>{row.created_at && (new Date(row.created_at)).toLocaleString()}</td>
                <td><span className={"chip "+(row.status)}>{row.status}</span></td>
                <td>
                  {row.document_url ? (
                    <a href={supabase.storage.from("documents").getPublicUrl(row.document_url).data?.publicUrl || "#"} target="_blank" rel="noopener noreferrer">View</a>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
