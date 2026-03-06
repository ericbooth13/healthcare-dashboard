from fastapi import FastAPI, Depends, HTTPException, Response, Request
from sqlalchemy import text, or_
from sqlalchemy.orm import Session
from typing import Optional, Literal
from .database import get_db, SessionLocal
from . import models, schemas
from .seed import seed_patients
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(title="Healthcare Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = (time.time() - start_time) * 1000

    print(
        f"{request.method} {request.url.path} "
        f"{response.status_code} "
        f"{process_time:.2f}ms"
    )

    return response

def build_patient_summary(patient: models.Patient, notes: list[models.PatientNote]) -> str:
    first_name = patient.first_name
    last_name = patient.last_name
    full_name = f"{first_name} {last_name}"

    blood_type = patient.blood_type or "unknown blood type"
    conditions = patient.conditions or "no recorded conditions"
    allergies = patient.allergies or "no recorded allergies"

    narrative_parts = [
        f"{full_name} is a patient with blood type {blood_type}.",
        f"Recorded conditions include {conditions}.",
        f"Recorded allergies include {allergies}.",
    ]

    if patient.last_visit:
        narrative_parts.append(
            f"The most recent documented visit was on {patient.last_visit.strftime('%B %d, %Y')}."
        )

    if notes:
        recent_notes = notes[:3]
        note_text = " ".join(note.content.strip() for note in recent_notes if note.content.strip())
        if note_text:
            narrative_parts.append(f"Recent clinical notes: {note_text}")
    else:
        narrative_parts.append("There are no clinical notes recorded yet.")

    return " ".join(narrative_parts)

@app.get("/patients/{patient_id}/summary", response_model=schemas.PatientSummaryResponse)
def get_patient_summary(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    notes = (
        db.query(models.PatientNote)
        .filter(models.PatientNote.patient_id == patient_id)
        .order_by(models.PatientNote.created_at.desc())
        .all()
    )

    summary = build_patient_summary(patient, notes)

    return {
        "patient_id": patient_id,
        "summary": summary,
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"db": "ok"}

@app.get("/patients", response_model=schemas.PatientListResponse)
def list_patients(
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 20,
    sort: str = "id",
    order: Literal["asc", "desc"] = "asc",
    q: Optional[str] = None,
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)

    query = db.query(models.Patient)

    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Patient.first_name.ilike(like),
                models.Patient.last_name.ilike(like),
                models.Patient.email.ilike(like),
            )
        )

    sort_map = {
        "id": models.Patient.id,
        "first_name": models.Patient.first_name,
        "last_name": models.Patient.last_name,
        "status": models.Patient.status,
        "last_visit": models.Patient.last_visit,
        "date_of_birth": models.Patient.date_of_birth,
        "created_at": models.Patient.created_at,
    }
    sort_col = sort_map.get(sort, models.Patient.id)

    if order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    # Pagination
    offset = (page - 1) * page_size
    total = query.count()

    patients = query.offset(offset).limit(page_size).all()

    return {
        "items": patients,
        "page": page,
        "page_size": page_size,
        "total": total
    }

@app.get("/patients/{patient_id}", response_model=schemas.PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.post("/patients", response_model=schemas.PatientResponse, status_code=201)
def create_patient(payload: schemas.PatientCreate, db: Session = Depends(get_db)):
    patient = models.Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@app.put("/patients/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(patient_id: int, payload: schemas.PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)
    return patient

@app.delete("/patients/{patient_id}", status_code=204)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    db.delete(patient)
    db.commit()
    return Response(status_code=204)

@app.get("/patients/{patient_id}/notes", response_model=list[schemas.PatientNoteResponse])
def list_patient_notes(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    notes = (
        db.query(models.PatientNote)
        .filter(models.PatientNote.patient_id == patient_id)
        .order_by(models.PatientNote.created_at.desc())
        .all()
    )
    return notes


@app.post("/patients/{patient_id}/notes", response_model=schemas.PatientNoteResponse, status_code=201)
def create_patient_note(
    patient_id: int,
    payload: schemas.PatientNoteCreate,
    db: Session = Depends(get_db),
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    note = models.PatientNote(
        patient_id=patient_id,
        content=payload.content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@app.delete("/patients/{patient_id}/notes/{note_id}", status_code=204)
def delete_patient_note(patient_id: int, note_id: int, db: Session = Depends(get_db)):
    note = (
        db.query(models.PatientNote)
        .filter(
            models.PatientNote.id == note_id,
            models.PatientNote.patient_id == patient_id,
        )
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return Response(status_code=204)

@app.on_event("startup")
def startup_seed():
    db = SessionLocal()
    try:
        seed_patients(db, count=20)
    finally:
        db.close()