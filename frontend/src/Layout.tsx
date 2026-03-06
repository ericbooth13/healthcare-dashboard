import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const navLinkStyle = (path: string): React.CSSProperties => ({
    display: "block",
    padding: "10px 12px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    color: location.pathname.startsWith(path) ? "#1976d2" : "#374151",
    backgroundColor: location.pathname.startsWith(path) ? "#eef6ff" : "transparent",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f6f8fb",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <header
        style={{
          height: 64,
          backgroundColor: "#1976d2",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18 }}>Healthcare Dashboard</div>
        <nav style={{ fontSize: 14, opacity: 0.95 }}>
          Patient Management System
        </nav>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <aside
          style={{
            backgroundColor: "white",
            borderRight: "1px solid #e5e7eb",
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 12,
            }}
          >
            Navigation
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link to="/patients" style={navLinkStyle("/patients")}>
              Patients
            </Link>
          </div>
        </aside>

        <main style={{ padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}