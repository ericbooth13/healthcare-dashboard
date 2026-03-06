import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  blood_type: string | null;
  allergies: string | null;
  conditions: string | null;
  status: string;
  last_visit: string | null;
};

type Note = {
  id: number;
  patient_id: number;
  content: string;
  created_at: string;
};

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const res = await fetch(`http://localhost:8000/patients/${id}`);
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const data = (await res.json()) as Patient;
        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    const loadNotes = async () => {
      try {
        const res = await fetch(`http://localhost:8000/patients/${id}/notes`);
        if (!res.ok) return;
        const data = await res.json();
        setNotes(data);
      } catch {
        console.error("Failed to load notes");
      }
    };

    const loadSummary = async () => {
      try {
        const res = await fetch(`http://localhost:8000/patients/${id}/summary`);
        if (!res.ok) return;
        const data = await res.json();
        setSummary(data.summary);
      } catch {
        console.error("Failed to load summary");
      }
    };

    loadPatient();
    loadNotes();
    loadSummary();
  }, [id]);

  return (
    <div>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "white",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
        }}
      >
        <Link
          to="/patients"
          style={{ color: "#1976d2", textDecoration: "none" }}
        >
          ← Back to patients
        </Link>

        {loading && <p style={{ marginTop: 20 }}>Loading patient...</p>}
        {error && (
          <p style={{ color: "crimson", marginTop: 20 }}>Error: {error}</p>
        )}

        {patient && (
          <div style={{ marginTop: 20 }}>
            <h1 style={{ marginBottom: 8 }}>
              {patient.first_name} {patient.last_name}
            </h1>
            <p style={{ marginTop: 0, color: "#666" }}>{patient.status}</p>

            <div style={{ marginTop: 12, marginBottom: 8 }}>
              <Link
                to={`/patients/${patient.id}/edit`}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "#1976d2",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-block",
                  cursor: "pointer",
                }}
              >
                Edit Patient
              </Link>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
              <div>
                <strong>Date of Birth:</strong>{" "}
                {new Date(patient.date_of_birth).toLocaleDateString()}
              </div>
              <div>
                <strong>Blood Type:</strong> {patient.blood_type ?? "—"}
              </div>
              <div>
                <strong>Email:</strong> {patient.email ?? "—"}
              </div>
              <div>
                <strong>Phone:</strong> {formatPhone(patient.phone)}
              </div>
              <div>
                <strong>Address:</strong> {patient.address ?? "—"}
              </div>
              <div>
                <strong>Conditions:</strong> {patient.conditions ?? "None"}
              </div>
              <div>
                <strong>Allergies:</strong> {patient.allergies ?? "None"}
              </div>
              <div>
                <strong>Last Visit:</strong>{" "}
                {patient.last_visit
                  ? new Date(patient.last_visit).toLocaleDateString()
                  : "—"}
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                marginTop: 24,
                marginBottom: 8,
              }}
            />

            <h2 style={{ marginTop: 40 }}>Patient Summary</h2>

            <div
              style={{
                padding: 16,
                border: "1px solid #e8edf3",
                borderRadius: 10,
                background: "#f8fafc",
                lineHeight: 1.6,
                color: "#374151",
              }}
            >
              {summary || "No summary available."}
            </div>

            <h2 style={{ marginTop: 40 }}>Clinical Notes</h2>

            <div style={{ marginBottom: 16 }}>
              <textarea
                placeholder="Add a clinical note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  fontFamily:
                    "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                  fontSize: 14,
                  resize: "vertical",
                }}
              />

              <button
                style={{
                  marginTop: 10,
                  padding: "10px 16px",
                  fontWeight: 600,
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#1976d2",
                  color: "white",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  if (!noteInput.trim()) return;

                  const res = await fetch(
                    `http://localhost:8000/patients/${id}/notes`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: noteInput }),
                    }
                  );

                  if (!res.ok) {
                    console.error("Failed to create note");
                    return;
                  }

                  const newNote = await res.json();
                  setNotes([newNote, ...notes]);
                  setNoteInput("");
                }}
              >
                Add Note
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {notes.length === 0 ? (
                <p style={{ color: "#666" }}>No notes yet.</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: 14,
                      border: "1px solid #e8edf3",
                      borderRadius: 10,
                      background: "#f8fafc",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        {new Date(note.created_at).toLocaleString()}
                      </div>

                      <button
                        onClick={async () => {
                          const res = await fetch(
                            `http://localhost:8000/patients/${id}/notes/${note.id}`,
                            {
                              method: "DELETE",
                            }
                          );

                          if (!res.ok) {
                            console.error("Failed to delete note");
                            return;
                          }

                          setNotes(notes.filter((n) => n.id !== note.id));
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          background: "white",
                          color: "#b42318",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    <div
                      style={{
                        fontFamily:
                          "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                        fontSize: 14,
                      }}
                    >
                      {note.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatPhone(phone: string | null) {
  if (!phone) return "—";

  const digits = phone.replace(/\D/g, "").slice(0, 10);

  if (digits.length !== 10) return phone;

  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  return `(${area}) ${prefix}-${line}`;
}