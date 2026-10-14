# LinkHub Flask 3.x REST API Backend

Production-ready REST API for LinkHub v2.0 with personal vault, team workspaces, Kanban tasks, and instant theme tokens.

## Tech Stack & Architecture
- **Framework:** Flask 3.x with Application Factory (`create_app`)
- **Database:** PostgreSQL 16+ / SQLite (zero-setup fallback) with SQLAlchemy 2.0 & Flask-SQLAlchemy
- **Authentication:** Flask-Bcrypt (password hashing), Flask-JWT-Extended (HTTP-only cookies + Bearer token)
- **Constraint Compliance:** Strict under 200 lines per file across all modules

## Project Structure
```
backend/
├── app/
│   ├── __init__.py           # create_app factory & error handlers
│   ├── config.py             # Base, Dev, Prod, Test configs
│   ├── extensions.py         # db, bcrypt, jwt, migrate, cors
│   ├── models/               # SQLAlchemy 2.0 mapped entities
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── saved_link.py
│   │   ├── team.py
│   │   ├── team_link.py
│   │   ├── task.py
│   │   └── audit_log.py
│   ├── routes/               # Modular blueprints (<200 lines)
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── links.py
│   │   ├── categories.py
│   │   ├── teams.py
│   │   ├── team_members.py
│   │   ├── team_links.py
│   │   ├── tasks.py
│   │   └── admin.py
│   └── utils/                # Rate limiter, audit logging, decorators
├── tests/                    # Comprehensive pytest test suite (22 tests)
├── seed.py                   # Initial demo accounts & squad data
├── run.py                    # Server launcher
├── Dockerfile                # Multi-stage production container
└── requirements.txt
```

## Quick Start

### 1. Set Up Virtual Environment & Dependencies
```bash
# In backend directory
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Seed Database
```bash
python seed.py
```
This sets up demo accounts (`priya@example.com`, `ravi@example.com`, `meena@example.com`, `admin@linkhub.dev`) and demo data for the "Platform Squad".

### 3. Run Development Server
```bash
python run.py
```
Server runs at `http://127.0.0.1:5000/`. Health check is available at `GET /api/health`.

### 4. Run Test Suite
```bash
pytest -v
```
All 22 unit & integration tests validate authentication, URL normalization, duplicate checks, pinned sort, team join rate limiting, Kanban task idempotency, and category dependency deletion.
