# REIINN-ventory

Inventory management system for REIINN. Features: gate pass requests, scheduling, deliveries, procurement, deployed equipment monitoring, and more.

## Project Status

Phase 1 complete: Repository setup with folder structure ready for Vite + MongoDB + Vercel.

## Connect to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `reiinn-ventory`)
2. Add the remote and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/reiinn-ventory.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username or organization.

## MongoDB Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (see [docs/MONGODB_SETUP.md](docs/MONGODB_SETUP.md) for details)
2. Copy `.env.example` to `.env.local` and set your `MONGODB_URI` and `JWT_SECRET`
3. Run `npm run seed` to create admin/staff users (admin/admin123, staff/staff123)
4. For production: add `MONGODB_URI` and `JWT_SECRET` to Vercel Environment Variables

## Local Development

**Full-stack (Vite + API + MongoDB):**

```bash
npm install
npm run seed          # First time: seed users
npm run dev:full      # Runs vercel dev - frontend + API
```

Then open http://localhost:3000 (login: admin/admin123 or staff/staff123)

**Frontend only (no API, uses localStorage fallback):**

```bash
npm run dev
```

Then open http://localhost:5173 (login: admin/admin123 or staff/staff123)

**Legacy PowerShell server:**

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Then open http://localhost:8080/mylogin.html
