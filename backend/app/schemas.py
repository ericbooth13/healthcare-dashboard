from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class PatientBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date

    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    blood_type: Optional[str] = Field(default=None, max_length=3)
    allergies: Optional[str] = None
    conditions: Optional[str] = None

    status: str = Field(min_length=1, max_length=50)
    last_visit: Optional[date] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None

    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    blood_type: Optional[str] = Field(default=None, max_length=3)
    allergies: Optional[str] = None
    conditions: Optional[str] = None

    status: Optional[str] = Field(default=None, min_length=1, max_length=50)
    last_visit: Optional[date] = None


class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PatientListResponse(BaseModel):
    items: list[PatientResponse]
    page: int
    page_size: int
    total: int


class PatientNoteCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)

class PatientNoteResponse(BaseModel):
    id: int
    patient_id: int
    content: str
    created_at: datetime

class Config:
    from_attributes = True
    
class PatientSummaryResponse(BaseModel):
    patient_id: int
    summary: str