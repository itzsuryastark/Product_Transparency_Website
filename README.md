# Product Transparency Website

Monorepo scaffold for a Product Transparency Website with a React + TypeScript frontend, an Express + Prisma backend (PostgreSQL), and a Python FastAPI AI microservice for dynamic question generation. Includes PDF report generation and basic JWT authentication.

## Structure

- `frontend/` – React + TypeScript app (Vite) with a multi-step form scaffold and TailwindCSS
- `backend/` – Node.js Express API with Prisma (PostgreSQL), JWT auth, and PDF generation
- `ai-service/` – Python FastAPI microservice exposing `/generate-questions` (mock LLM)
- `design/` – Placeholder for design exports

## Requirements

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

Optional: Docker & docker-compose for local dev

## Quickstart (Local Dev)

1. Create environment files from samples and fill values

   - `cp backend/.env.example backend/.env`
   - `cp ai-service/.env.example ai-service/.env` (optional)

2. Install dependencies

   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
   - AI service: `cd ai-service && pip install -r requirements.txt`

3. Initialize database (PostgreSQL)

   - Ensure `DATABASE_URL` in `backend/.env` points to your Postgres instance
   - `cd backend && npx prisma migrate dev --name init`

4. Run services

   - Backend API: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`
   - AI service: `cd ai-service && uvicorn main:app --reload --host 0.0.0.0 --port 8001`

5. Endpoints
   - Auth: `POST /auth/login`
   - Products: `POST /products`, `GET /products/:id`
   - Reports: `POST /reports` (returns a PDF file)
   - AI Service: `POST /generate-questions`

## Features

- Multi-step form with dynamic questions from the AI service
- Basic JWT login (company-level)
- Prisma schema for `products`, `questions`, `reports`
- PDF generation for report downloads

## Docker (optional)

This repo can include a `docker-compose.yml` to orchestrate Postgres and services. Add your preferred setup as needed.

## Security

This scaffold is for development. Review, harden, and productionize before deploying (secrets management, CORS, HTTPS, logging, rate limiting, etc.).
