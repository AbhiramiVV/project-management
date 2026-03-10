# Mini Project Management System

A full-stack project management application built with **FastAPI**, **PostgreSQL**, and **Next.js**. It includes JWT-based authentication, role-based access control (RBAC), pagination, search filtering, clean architecture, unit tests, and Docker support.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Python 3.11, FastAPI, SQLAlchemy (async), Alembic |
| Database   | PostgreSQL                        |
| Frontend   | Next.js 14 (App Router), Redux Toolkit (RTK Query) |
| Auth       | JWT (python-jose + bcrypt)        |
| DevOps     | Docker, Docker Compose            |
| Testing    | pytest, pytest-asyncio            |
| Packaging  | uv                                |

---

## Architecture Explanation

This project follows a **Clean / Layered Architecture**:

```
app/
├── api/           # FastAPI routers (interface adapters)
│   ├── auth.py    # Login / JWT token issuing
│   ├── users.py
│   ├── projects.py
│   ├── tasks.py
│   └── dependencies.py  # Auth guards (get_current_user, get_current_admin_user)
├── services/      # Business logic layer
│   ├── user_service.py
│   ├── project_service.py
│   └── task_service.py
├── repositories/  # Data access layer (DB abstraction)
│   ├── base.py    # Generic BaseRepository (get, create, update, delete, count)
│   ├── user.py
│   ├── project.py
│   └── task.py
├── models/        # SQLAlchemy ORM models
│   ├── user.py
│   ├── project.py
│   └── task.py
├── schemas/       # Pydantic schemas for validation & serialization
│   └── schemas.py
├── core/          # Config, security, custom exceptions
└── db/            # Database engine & session management

frontend/          # Next.js frontend
├── src/app/       # App router pages (login, projects, tasks, users)
└── src/store/     # RTK Query API slice
```

Flow: `Request → Router (api/) → Service (services/) → Repository (repositories/) → DB`

---

## ER Diagram

```
┌─────────────────────┐       ┌──────────────────────────┐       ┌─────────────────────────────┐
│        Users         │       │         Projects          │       │           Tasks              │
├─────────────────────┤       ├──────────────────────────┤       ├─────────────────────────────┤
│ id         (UUID) PK│──┐    │ id          (UUID) PK     │──┐    │ id           (UUID) PK       │
│ name       (str)    │  │    │ name        (str)         │  │    │ title        (str)           │
│ email      (str)    │  └───►│ created_by  (UUID) FK     │  └───►│ project_id   (UUID) FK       │
│ password_hash(str)  │       │ description (text)        │       │ assigned_to  (UUID) FK ──►Users│
│ role       (enum)   │       │ created_at  (datetime)    │       │ description  (text)          │
│ created_at          │       │ updated_at  (datetime)    │       │ status  (todo/in_progress/   │
│ updated_at          │       └──────────────────────────┘       │         completed)           │
└─────────────────────┘                                          │ due_date     (datetime)      │
                                                                  │ created_at   (datetime)      │
                                                                  │ updated_at   (datetime)      │
                                                                  └─────────────────────────────┘
```

---

## Features

### Backend
- ✅ JWT Authentication (login → token → protected endpoints)
- ✅ Role-Based Access Control: `admin` can do everything; `developer` sees/updates only their tasks
- ✅ Full CRUD for Users, Projects and Tasks
- ✅ Task filtering by `project_id`, `status`, `assigned_to`, and free-text search (`q`)
- ✅ Pagination on all listing endpoints (`skip` / `limit` with total count response)
- ✅ Proper HTTP status codes and structured error responses
- ✅ Input validation via Pydantic schemas
- ✅ DB transactions via SQLAlchemy async sessions
- ✅ Clean layered architecture (API → Service → Repository)
- ✅ Unit tests with pytest

### Frontend
- ✅ Login page with JWT-based auth
- ✅ Projects listing with search and pagination
- ✅ Task listing with search and pagination
- ✅ Create task modal (admin only)
- ✅ Developer can toggle status of their own tasks
- ✅ Team management page (admin only)
- ✅ Role-based UI (admin vs developer views)

### Bonus
- ✅ Docker + Docker Compose setup
- ✅ Swagger / OpenAPI documentation (auto-generated at `/docs`)
- ✅ Role-based access control (RBAC)
- ✅ Unit tests (pytest)
- ✅ Clean architecture pattern

---

## Setup Instructions

### Prerequisites
- Docker & Docker Compose installed, OR
- Python 3.11+ and PostgreSQL installed locally

---

### Option 1: Docker (Recommended — Zero Config)

```bash
# 1. Clone the repository
git clone <repo-url>
cd project-management

# 2. Copy the environment variables
cp .env.example .env

# 3. Start all services (API + DB + Frontend)
docker-compose up --build
```

| Service  | URL                         |
|----------|-----------------------------|
| API      | http://localhost:8000        |
| Swagger  | http://localhost:8000/docs   |
| Frontend | http://localhost:3000        |

---

### Option 2: Local Development

#### Backend

```bash
# Install uv (if not installed)
pip install uv

# Install dependencies
uv sync

# Set up environment
cp .env.example .env
# Edit .env with your local PostgreSQL credentials

# Run DB migrations
alembic upgrade head

# Start the backend
uv run uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000 → points to API via Next.js rewrites.

---

## Environment Variables

See `.env.example` for all required variables:

```env
ENVIRONMENT=development
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=project_management
POSTGRES_HOST=db           # use 'localhost' for local dev, 'db' for docker
POSTGRES_PORT=5432

DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/project_management
```

---

## First Admin User

After starting the app for the first time, create an admin user via the API (registration is open):

```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email": "admin@example.com", "password": "admin123", "role": "admin"}'
```

Then login:
```bash
curl -X POST http://localhost:8000/auth/login \
  -F "username=admin@example.com" \
  -F "password=admin123"
```

---

## API Documentation

Full interactive documentation is available at **http://localhost:8000/docs** (Swagger UI).

### Base URL
```
http://localhost:8000
```

### Authentication

All endpoints (except `POST /users` and `POST /auth/login`) require a Bearer token:

```
Authorization: Bearer <access_token>
```

---

### Endpoints Summary

#### Auth
| Method | Endpoint       | Description           | Auth |
|--------|----------------|-----------------------|------|
| POST   | /auth/login    | Login, get JWT token  | ❌   |

#### Users
| Method | Endpoint   | Description                  | Auth  | Role  |
|--------|------------|------------------------------|-------|-------|
| POST   | /users     | Create user                  | ❌    | Open  |
| GET    | /users     | List users (paginated)       | ✅    | Any   |
| GET    | /users/me  | Get current logged-in user   | ✅    | Any   |

#### Projects
| Method | Endpoint          | Description                      | Auth | Role  |
|--------|-------------------|----------------------------------|------|-------|
| POST   | /projects         | Create project                   | ✅   | Admin |
| GET    | /projects         | List projects (paginated+search) | ✅   | Any   |
| PUT    | /projects/{id}    | Update project                   | ✅   | Admin |
| DELETE | /projects/{id}    | Delete project                   | ✅   | Admin |

#### Tasks
| Method | Endpoint                  | Description                        | Auth | Role         |
|--------|---------------------------|------------------------------------|------|--------------|
| POST   | /tasks                    | Create task                        | ✅   | Admin        |
| GET    | /tasks                    | List tasks (paginated+filter+search)| ✅  | Any (filtered by role) |
| PUT    | /tasks/{id}/assign        | Assign task to user                | ✅   | Admin        |
| PUT    | /tasks/{id}/status        | Update task status                 | ✅   | Admin/assigned developer |

### Query Parameters (Listing Endpoints)

| Parameter    | Type   | Description                          |
|--------------|--------|--------------------------------------|
| `q`          | string | Free-text search (name/title/email)  |
| `skip`       | int    | Offset for pagination (default: 0)   |
| `limit`      | int    | Page size (default: 20, max: 100)    |
| `project_id` | UUID   | Filter tasks by project (tasks only) |
| `status`     | enum   | Filter by status (tasks only)        |
| `assigned_to`| UUID   | Filter by assignee (tasks only)      |

### Paginated Response Shape

```json
{
  "items": [ ... ],
  "total": 42,
  "page": 1,
  "size": 20
}
```

---

## Running Tests

```bash
pytest tests/
```

Tests cover the core business logic of `TaskService` (status update permissions, role-based filtering).

---

## Project Structure

```
project-management/
├── app/                    # FastAPI application
│   ├── api/                # Route handlers
│   ├── core/               # Config, security, exceptions
│   ├── db/                 # Database session
│   ├── models/             # SQLAlchemy models
│   ├── repositories/       # DB access layer
│   ├── schemas/            # Pydantic schemas
│   └── services/           # Business logic
├── frontend/               # Next.js frontend
│   └── src/
│       ├── app/            # Pages (login, projects, tasks, users)
│       └── store/          # RTK Query API slice
├── tests/                  # Unit tests
├── alembic/                # DB migration scripts
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## Design Decisions

- **Repository Pattern**: A generic `BaseRepository` provides `get`, `get_multi`, `create`, `update`, `delete`, and `count` — extended by entity-specific repositories for filtering.
- **RBAC enforced at 2 layers**: API layer (guard dependencies) and Service layer (business rules). Developers only see their assigned tasks.
- **Async SQLAlchemy**: All DB operations are fully async for high concurrency.
- **Pydantic v2**: All input is validated and output is serialized through schemas, preventing over-posting and data leakage.
- **Pagination**: All listing endpoints return `{ items, total, page, size }` making it easy to build UI pagination.
