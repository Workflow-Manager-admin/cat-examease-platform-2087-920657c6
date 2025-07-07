import React, { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Download hall ticket (browser print-style)
 */
export default function HallTicket() {
  const { user, supabase } = useAuth();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      const { data } = await supabase.from("halltickets").select("*").eq("user_id", user.id).single();
      setTicket(data);
    };
    fetchTicket();
  }, [user, supabase]);

  const handleDownload = () => {
    const el = document.getElementById("hallticket-print");
    if (!el) return;
    const win = window.open("", "PRINT", "width=720,height=900");
    win.document.write(`
      <html><head><title>Hall Ticket</title></head><body>
      ${el.innerHTML}
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  if (!ticket)
    return <div className="card">No hall ticket generated yet.</div>;
  return (
    <div>
      <h2 className="card-title">Hall Ticket</h2>
      <button className="btn" onClick={handleDownload}>Download / Print</button>
      <div className="card" id="hallticket-print" style={{marginTop:"1.3em",maxWidth:520}}>
        <h3>CAT Examination Hall Ticket</h3>
        <div>Name: {user.user_metadata?.name}</div>
        <div>Email: {user.email}</div>
        <div>Exam: {ticket.exam_name}</div>
        <div>Date: {ticket.exam_date && (new Date(ticket.exam_date)).toLocaleString()}</div>
        <div>Centre: {ticket.centre}</div>
        <div>Ticket# <b>{ticket.ticket_number}</b></div>
        <div>Status: <span className={"chip "+ticket.status}>{ticket.status}</span></div>
      </div>
    </div>
  );
}
