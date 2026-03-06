from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)

    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)

    address = Column(String(255), nullable=True)

    blood_type = Column(String(3), nullable=True)
    allergies = Column(Text, nullable=True)   
    conditions = Column(Text, nullable=True)  

    status = Column(String(50), nullable=False, index=True)
    last_visit = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class PatientNote(Base):
    __tablename__ = "patient_notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient = relationship("Patient")