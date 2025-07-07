import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Generic 404 page, accessible
 */
export default function PageNotFound() {
  return (
    <div className="modal" style={{ margin: "4rem auto", maxWidth: 440, textAlign: "center" }}>
      <h2 className="card-title">Page Not Found</h2>
      <div style={{fontSize: "4rem"}} aria-hidden={true}>🚫</div>
      <p className="mb2">Sorry, we couldn't find that page.</p>
      <Link to="/dashboard" className="btn">Back to Dashboard</Link>
    </div>
  );
}
