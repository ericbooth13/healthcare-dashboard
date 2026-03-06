import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          background: "white",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
        }}
      >
        <h1>404</h1>
        <p>Page not found.</p>
        <Link to="/patients">Go to patients</Link>
      </div>
    </div>
  );
}