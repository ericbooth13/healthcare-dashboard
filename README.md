# Healthcare Dashboard

A full-stack healthcare patient management dashboard built with **FastAPI**, **PostgreSQL**, and **React + TypeScript**.

The application allows users to:

- View patient records
- Search and paginate large datasets
- View detailed patient profiles
- Add and delete clinical notes
- Generate patient summaries
- Create and edit patient records

This project demonstrates a maintainable full-stack architecture with a Dockerized FastAPI backend, PostgreSQL database, and a modern React + TypeScript frontend.
The application is fully containerized with Docker Compose, allowing the entire stack to run with a single command.

---

# UI Preview

### Patient Dashboard

<img src="dashboard.jpg" width="900"/>

### Patient Detail

<img src="patient_details.jpg" width="900"/>

### Create Patient

<img src="create_patient.jpg" width="900"/>

### Edit Patient

<img src="edit_patient.jpg" width="900"/>

---

# Tech Stack

## Backend

- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- Alembic (database migrations)
- Docker / Docker Compose

## Frontend

- React
- TypeScript
- Vite
- React Router

---

# Architecture Notes

- **FastAPI** provides rapid API development with built-in OpenAPI documentation.
- **PostgreSQL + Alembic** allow the database schema to be recreated reliably.
- **Vite** was chosen for fast frontend development and build speed.
- The patient list API supports **pagination, search, and sorting** for scalability.
- Clinical notes and summary generation are implemented as **separate API resources** to keep the backend modular.
- A lightweight **request logging middleware** provides basic observability during development.
- The frontend is built with Vite and served via **Nginx in a Docker container** for production-style deployment.

---

# Features

## Backend API

- RESTful patient CRUD API
- Pagination, sorting, and search
- Clinical notes endpoints
- Generated patient summary endpoint
- Seeded realistic patient data
- Swagger/OpenAPI documentation
- Dockerized backend services
- Database migrations with Alembic
- API request logging middleware

## Frontend Dashboard

- Responsive patient table view
- Search functionality
- Pagination controls
- Patient detail view
- Clinical notes display
- Add/delete note workflow
- Generated patient summary view
- Create patient form
- Edit patient form
- Routing with React Router
- API integration with FastAPI
- Dockerized frontend served via Nginx

---

# Project Structure

```
healthcare-dashboard
│
├── backend
│   ├── app
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── seed.py
│   │
│   ├── alembic
│   ├── Dockerfile
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend
│   ├── src
│   │   ├── App.tsx
│   │   ├── Layout.tsx
│   │   └── pages
│   │       ├── Patients.tsx
│   │       ├── PatientDetail.tsx
│   │       ├── PatientForm.tsx
│   │       └── NotFound.tsx
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── README.md
├── .env.example
│
├── dashboard.jpg
├── patient_details.jpg
├── create_patient.jpg
└── edit_patient.jpg
```

---

# Running the Project

## Run the Full Stack with Docker

From the project root:

```bash
docker compose up --build
```

This starts:

Frontend:

```
http://localhost:3000
```

Backend API:

```
http://localhost:8000
```

API Documentation:

```
http://localhost:8000/docs
```

---

# Frontend Development Mode (Optional)

If you want to run the frontend in development mode with Vite:

```bash
cd frontend
npm install
npm run dev
```

Vite typically runs at:

```
http://localhost:5173
```

If that port is already in use, it may automatically select another port such as:

```
http://localhost:5174
```

---

# API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| GET | /patients | List patients with pagination |
| GET | /patients/{id} | Get patient by ID |
| POST | /patients | Create patient |
| PUT | /patients/{id} | Update patient |
| DELETE | /patients/{id} | Delete patient |
| GET | /patients/{id}/notes | List notes for a patient |
| POST | /patients/{id}/notes | Add a note |
| DELETE | /patients/{id}/notes/{note_id} | Delete a note |
| GET | /patients/{id}/summary | Generate patient summary |

---

# Query Parameters

The `GET /patients` endpoint supports:

| Parameter | Description |
|------|------|
| page | Page number |
| page_size | Records per page |
| q | Search by first name, last name, or email |
| sort | Sort field |
| order | asc / desc |

Example request:

```
/patients?page=1&page_size=10&q=john
```

---

# Seed Data

On application startup, the backend seeds the database with **20 realistic patient records**, including:

- medical conditions
- allergies
- blood types
- visit history
- patient statuses

Seeding is **idempotent**, meaning it will not duplicate data if records already exist.

---

# Notes

- The backend runs inside **Docker containers** to provide reproducible local development.
- **Alembic migrations** allow the schema to be recreated from scratch.
- The frontend communicates with the API using the **patients, notes, and summary endpoints**.
- **Request logging middleware** provides request timing and status logging.

---

# Future Improvements

Potential enhancements:

- Column sorting controls in the UI
- Advanced search filters
- Authentication and role-based access
- Environment-based API configuration
- Real-time updates for clinical notes
- Confirmation dialogs before destructive actions