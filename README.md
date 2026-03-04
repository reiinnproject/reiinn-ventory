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

## Local Development

**Vite (recommended - hot reload):**

```bash
npm install
npm run dev
```

Then open http://localhost:5173 (login: admin/admin123 or staff/staff123)

**Legacy PowerShell server:**

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Then open http://localhost:8080/mylogin.html
