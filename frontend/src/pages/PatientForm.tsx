import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type PatientPayload = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  allergies: string;
  conditions: string;
  status: string;
  last_visit: string;
};

type PatientResponse = PatientPayload & {
  id: number;
  created_at?: string;
  updated_at?: string | null;
};

const BLOOD_TYPES = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUSES = [
  "Active",
  "Inactive",
  "Follow-up Required",
  "Under Treatment",
  "Discharged",
];

const emptyForm: PatientPayload = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  email: "",
  phone: "",
  address: "",
  blood_type: "",
  allergies: "",
  conditions: "",
  status: "Active",
  last_visit: "",
};

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [form, setForm] = useState<PatientPayload>(emptyForm);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;

    const loadPatient = async () => {
      try {
        setError(null);
        const res = await fetch(`http://localhost:8000/patients/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to load patient: ${res.status}`);
        }

        const data = (await res.json()) as PatientResponse;

        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          date_of_birth: data.date_of_birth ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          blood_type: data.blood_type ?? "",
          allergies: data.allergies ?? "",
          conditions: data.conditions ?? "",
          status: data.status ?? "Active",
          last_visit: data.last_visit ?? "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, isEdit]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.first_name.trim()) return "First name is required.";
    if (!form.last_name.trim()) return "Last name is required.";
    if (!form.date_of_birth) return "Date of birth is required.";
    if (!form.status) return "Status is required.";
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      blood_type: form.blood_type || null,
      allergies: form.allergies || null,
      conditions: form.conditions || null,
      last_visit: form.last_visit || null,
    };

    try {
      const res = await fetch(
        isEdit
          ? `http://localhost:8000/patients/${id}`
          : `http://localhost:8000/patients`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        let detail = `Request failed: ${res.status}`;
        try {
          const body = await res.json();
          if (body?.detail) {
            detail =
              typeof body.detail === "string"
                ? body.detail
                : JSON.stringify(body.detail);
          }
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      const saved = (await res.json()) as PatientResponse;
      navigate(`/patients/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
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
      <div style={{ marginBottom: 20 }}>
        <Link to="/patients" style={{ color: "#1976d2", textDecoration: "none" }}>
          ← Back to patients
        </Link>
      </div>

      <h1 style={{ marginBottom: 8 }}>
        {isEdit ? "Edit Patient" : "Create Patient"}
      </h1>
      <p style={{ marginTop: 0, color: "#666" }}>
        {isEdit ? "Update patient information." : "Add a new patient record."}
      </p>

      {loading && <p>Loading patient...</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {!loading && (
        <form onSubmit={onSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            <Field label="First Name">
              <input name="first_name" value={form.first_name} onChange={onChange} style={inputStyle} />
            </Field>

            <Field label="Last Name">
              <input name="last_name" value={form.last_name} onChange={onChange} style={inputStyle} />
            </Field>

            <Field label="Date of Birth">
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={onChange} style={inputStyle} />
            </Field>

            <Field label="Email">
              <input type="email" name="email" value={form.email} onChange={onChange} style={inputStyle} />
            </Field>

            <Field label="Phone">
              <input name="phone" value={form.phone} onChange={onChange} style={inputStyle} />
            </Field>

            <Field label="Blood Type">
              <select name="blood_type" value={form.blood_type} onChange={onChange} style={inputStyle}>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt || "Select blood type"}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select name="status" value={form.status} onChange={onChange} style={inputStyle}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Last Visit">
              <input type="date" name="last_visit" value={form.last_visit} onChange={onChange} style={inputStyle} />
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Address">
                <textarea name="address" value={form.address} onChange={onChange} style={textareaStyle} />
              </Field>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Conditions">
                <textarea name="conditions" value={form.conditions} onChange={onChange} style={textareaStyle} />
              </Field>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Allergies">
                <textarea name="allergies" value={form.allergies} onChange={onChange} style={textareaStyle} />
              </Field>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button type="submit" disabled={saving} style={primaryButtonStyle}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Patient"}
            </button>

            <Link to="/patients" style={secondaryButtonStyle}>
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 80,
  resize: "vertical",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: "#1976d2",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#374151",
  textDecoration: "none",
  fontWeight: 600,
};