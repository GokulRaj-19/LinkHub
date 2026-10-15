# Render Deployment Guide for LinkHub (team3-LMS)

This guide walks you through deploying LinkHub onto [Render](https://render.com).

LinkHub consists of 3 services:
1. **Managed PostgreSQL Database**
2. **Flask REST API (Python Web Service)**
3. **React 19 + Vite Frontend (Static Site or Vercel)**

---

## Method 1: Automated Blueprint Deployment (1-Click)

The repository includes a ready-to-use [`render.yaml`](../render.yaml) blueprint specification.

1. Go to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `ist-team3/team3-LMS` (or your fork).
4. Render will parse `render.yaml` and display the 3 resources:
   - `team3-lms-db` (PostgreSQL Database)
   - `team3-lms-backend` (Flask Python Web Service)
   - `team3-lms-frontend` (Vite React Static Site)
5. Click **Apply**.
6. Render will automatically provision the database, install Python requirements, run database seed, start Gunicorn, and build the Vite frontend!

---

## Method 2: Manual Dashboard Deployment (Step-by-Step)

If you prefer setting up services individually from the Render dashboard:

### Step 1: Create PostgreSQL Database
1. In Render Dashboard, click **New +** -> **PostgreSQL**.
2. **Name**: `team3-lms-db`
3. **Database**: `linkhub`
4. **User**: `linkhub_user`
5. **Plan**: Free
6. Click **Create Database**.
7. Copy the **Internal Database URL** (e.g., `postgres://linkhub_user:...@dpg-...:5432/linkhub`).

### Step 2: Deploy Backend Web Service
1. Click **New +** -> **Web Service**.
2. Connect repository: `ist-team3/team3-LMS`.
3. Configure settings:
   - **Name**: `team3-lms-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python seed.py && gunicorn run:app`
   - **Plan**: Free
4. Add **Environment Variables**:
   | Variable | Value | Notes |
   |---|---|---|
   | `FLASK_ENV` | `production` | Enables production settings |
   | `SECRET_KEY` | *(Click Generate)* | Session security |
   | `JWT_SECRET_KEY` | *(Click Generate)* | Token encryption |
   | `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* | Automatically converted to postgresql:// |
   | `CORS_ORIGINS` | `*` | Or specify frontend domain |
   | `JWT_COOKIE_SECURE` | `True` | HTTPS enabled |
5. Click **Create Web Service**.
6. When deployed, note your backend URL: e.g. `https://team3-lms-backend.onrender.com`.
   You can verify it by checking `https://team3-lms-backend.onrender.com/api/health`.

### Step 3: Deploy Frontend (Render Static Site or Vercel)

#### Option A: On Render (Static Site)
1. Click **New +** -> **Static Site**.
2. Connect repository: `ist-team3/team3-LMS`.
3. Configure:
   - **Name**: `team3-lms-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In **Redirects / Rewrites**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. In **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://team3-lms-backend.onrender.com/api`
6. Click **Create Static Site**.

#### Option B: On Vercel
1. Go to [vercel.com](https://vercel.com/) -> **Add New Project**.
2. Select `ist-team3/team3-LMS`.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://team3-lms-backend.onrender.com/api`
5. Click **Deploy**. (The included `frontend/vercel.json` ensures SPA routes like `/dashboard` refresh without 404s).

---

## Default Seed Accounts

After deployment, the database is pre-seeded with sample users:

| Email | Password | Role | Description |
|---|---|---|---|
| `admin@linkhub.dev` | `adminpassword` | Admin | Full admin privileges & audit logs |
| `priya@example.com` | `password123` | User / Squad Leader | Lead of Backend Core squad |
| `ravi@example.com` | `password123` | User | Squad member with assigned tasks |
| `meena@example.com` | `password123` | User | Squad member |
