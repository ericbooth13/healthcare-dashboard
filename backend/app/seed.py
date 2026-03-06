from datetime import date, timedelta
import random

from faker import Faker
from sqlalchemy.orm import Session

from . import models

fake = Faker()

STATUSES = ["Active", "Inactive", "Pending", "Follow-up Required", "Under Treatment","Discharged"]
BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
MEDICAL_CONDITIONS = [
    "Hypertension",
    "Type 2 Diabetes",
    "Asthma",
    "Hyperlipidemia",
    "Coronary Artery Disease",
    "Chronic Kidney Disease",
    "COPD",
    "Hypothyroidism",
    "Osteoarthritis",
    "GERD",
    "Depression",
    "Generalized Anxiety Disorder",
    "Migraine",
    "Sleep Apnea",
    "Obesity",
    "Anemia",
    "Atrial Fibrillation",
    "Chronic Back Pain",
    "Peripheral Neuropathy",
    "Psoriasis",
    "Rheumatoid Arthritis",
    "Irritable Bowel Syndrome",
    "Vitamin D Deficiency",
    "Gout",
    "Prediabetes",
    "Insomnia",
    "Chronic Sinusitis",
    "Seasonal Allergies",
    "Heart Failure",
    "Osteoporosis",
]
ALLERGIES = [
    "Penicillin",
    "Amoxicillin",
    "Sulfa Drugs",
    "Aspirin",
    "Ibuprofen",
    "Codeine",
    "Latex",
    "Peanuts",
    "Tree Nuts",
    "Shellfish",
    "Eggs",
    "Milk",
    "Soy",
    "Wheat",
    "Dust Mites",
    "Pollen",
    "Pet Dander",
    "Insect Stings",
    "Mold",
    "Contrast Dye",
]

def seed_patients(db: Session, count: int = 20) -> None:
    existing = db.query(models.Patient).count()
    if existing >= count:
        return

    patients_to_create = count - existing

    for _ in range(patients_to_create):
        first = fake.first_name()
        last = fake.last_name()
        dob = fake.date_of_birth(minimum_age=18, maximum_age=90)

        if random.random() < 0.15:
            last_visit = None
        else:
            last_visit = date.today() - timedelta(days=random.randint(1, 730))

        sample_allergies = random.sample(ALLERGIES, k=random.randint(0, 2))
        allergies = ", ".join(sample_allergies) if sample_allergies else "None"
        conditions = ", ".join(random.sample(MEDICAL_CONDITIONS, k=random.randint(1, 2)))

        patient = models.Patient(
            first_name=first,
            last_name=last,
            date_of_birth=dob,
            email=f"{first.lower()}.{last.lower()}@example.com",
            phone=fake.phone_number(),
            address=fake.address().replace("\n", ", "),
            blood_type=random.choice(BLOOD_TYPES),
            allergies=allergies,
            conditions=conditions,
            status=random.choice(STATUSES),
            last_visit=last_visit,
        )
        db.add(patient)

    db.commit()