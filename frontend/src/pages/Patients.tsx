import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  status: string;
  conditions: string | null;
  allergies: string | null;
  blood_type: string | null;
  last_visit: string | null;
};

type PatientListResponse = {
  items: Patient[];
  page: number;
  page_size: number;
  total: number;
};

const PAGE_SIZE = 10;

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
          sort: "last_name",
          order: "asc",
        });

        if (search) {
          params.set("q", search);
        }

        const res = await fetch(
          `http://localhost:8000/patients?${params.toString()}`
        );

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data: PatientListResponse = await res.json();
        setPatients(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [page, search]);

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        background: "white",
        padding: 32,
        borderRadius: 16,
        boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Healthcare Dashboard</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Patient Management Overview
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by first name, last name, or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            padding: "10px 12px",
            minWidth: 320,
            border: "1px solid #ccc",
            borderRadius: 8,
            fontSize: 14,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ color: "#555", fontSize: 14 }}>
            Showing {patients.length} of {total} patients
          </div>

          <Link
            to="/patients/new"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "#1976d2",
              color: "white",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            + New Patient
          </Link>
        </div>
      </div>

      {loading && <p>Loading patients...</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#fafafa",
                  zIndex: 1,
                }}
              >
                <tr style={{ textAlign: "left" }}>
                  <th style={thStyle}>Patient</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Blood Type</th>
                  <th style={thStyle}>Conditions</th>
                  <th style={thStyle}>Allergies</th>
                  <th style={thStyle}>Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td style={tdStyle} colSpan={6}>
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.id}
                      style={{ borderTop: "1px solid #eee" }}
                    >
                      <td style={tdStyle}>
                        <Link
                          to={`/patients/${patient.id}`}
                          style={{
                            fontWeight: 600,
                            color: "#1976d2",
                            textDecoration: "none",
                          }}
                        >
                          {patient.first_name} {patient.last_name}
                        </Link>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor: getStatusColor(patient.status),
                            color: "white",
                          }}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td style={tdStyle}>{patient.blood_type ?? "—"}</td>
                      <td style={tdStyle}>{patient.conditions ?? "None"}</td>
                      <td style={tdStyle}>{patient.allergies ?? "None"}</td>
                      <td style={tdStyle}>
                        {patient.last_visit
                          ? new Date(patient.last_visit).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 14, color: "#555" }}>
              Page {page} of {totalPages}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={buttonStyle(page === 1)}
              >
                Previous
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={buttonStyle(page >= totalPages)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 14,
  verticalAlign: "top",
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #ccc",
  backgroundColor: disabled ? "#f3f3f3" : "#fff",
  color: disabled ? "#999" : "#111",
  cursor: disabled ? "not-allowed" : "pointer",
});

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "#2e7d32";
    case "Under Treatment":
      return "#1976d2";
    case "Follow-up Required":
      return "#ed6c02";
    case "Inactive":
      return "#757575";
    case "Discharged":
      return "#5e35b1";
    default:
      return "#555";
  }
}