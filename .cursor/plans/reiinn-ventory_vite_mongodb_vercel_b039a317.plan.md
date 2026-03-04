---
name: REIINN-ventory Vite MongoDB Vercel
overview: Restructure REIINN-ventory as a Vite + vanilla JS app with separate HTML view files, MongoDB backend via Vercel Serverless Functions, and a Git repository ready for Vercel deployment from the start.
todos:
  - id: 1-1
    content: Run git init and create .gitignore (node_modules, dist, .env, .env.local, .vercel)
    status: completed
  - id: 1-2
    content: Create Vite project with vanilla template (npm create vite@latest)
    status: completed
  - id: 1-3
    content: Configure vite.config.js for multi-page build (index.html + app.html)
    status: completed
  - id: 1-4
    content: Create folder structure (public/, public/views/, src/, src/modules/, src/styles/, api/, lib/)
    status: completed
  - id: 1-5
    content: Create vercel.json and .env.example
    status: completed
  - id: 2-1
    content: Create index.html with login form (logo, username, password, login button)
    status: completed
  - id: 2-2
    content: Create app.html with sidebar,
    status: completed
  - id: 2-3
    content: Extract dashboard view to public/views/dashboard.html
    status: completed
  - id: 2-4
    content: Extract inventory view (list + registry) to public/views/inventory.html
    status: completed
  - id: 2-5
    content: Extract scheduling view to public/views/scheduling.html
    status: completed
  - id: 2-6
    content: Extract deliveries view to public/views/deliveries.html
    status: completed
  - id: 2-7
    content: Extract procurement view to public/views/procurement.html
    status: completed
  - id: 2-8
    content: Extract gatepass view to public/views/gatepass.html
    status: completed
  - id: 2-9
    content: Extract deployment view to public/views/deployment.html
    status: completed
  - id: 2-10
    content: Copy logo.png to public/ and add descModal to app.html
    status: completed
  - id: 3-1
    content: Create src/styles/variables.css with :root tokens
    status: completed
  - id: 3-2
    content: Create src/styles/layout.css (body, sidebar, content-section, cards)
    status: completed
  - id: 3-3
    content: Create src/styles/components.css (forms, tables, modals, pills, buttons)
    status: completed
  - id: 3-4
    content: Create src/api.js with get/post/put/delete and Authorization header
    status: completed
  - id: 3-5
    content: Create src/auth.js (getToken, setToken, logout, isAuthenticated)
    status: completed
  - id: 3-6
    content: Create src/router.js with hash-based routing and view loading
    status: completed
  - id: 3-7
    content: Create src/main.js for login page (form handler, redirect)
    status: completed
  - id: 3-8
    content: Create src/app.js (auth guard, router init, default view)
    status: completed
  - id: 3-9
    content: Create src/modules/dashboard.js with init() and render logic
    status: completed
  - id: 3-10
    content: Create src/modules/inventory.js with init() and render logic
    status: completed
  - id: 3-11
    content: Create src/modules/scheduling.js with init() and render logic
    status: completed
  - id: 3-12
    content: Create src/modules/deliveries.js with init() and render logic
    status: completed
  - id: 3-13
    content: Create src/modules/procurement.js with init() and render logic
    status: completed
  - id: 3-14
    content: Create src/modules/gatepass.js with init() and render logic
    status: completed
  - id: 3-15
    content: Create src/modules/deployment.js with init() and render logic
    status: completed
  - id: 4-1
    content: Create MongoDB Atlas cluster and database reiinn_ventory
    status: completed
  - id: 4-2
    content: Create lib/db.js with connection caching and getDb() helper
    status: completed
  - id: 4-3
    content: Create api/auth/login.js (POST, validate credentials, return JWT)
    status: completed
  - id: 4-4
    content: Create api/inventory.js (GET, POST) and api/inventory/[id].js (PUT, DELETE)
    status: completed
  - id: 4-5
    content: Create api/deliveries.js (GET, POST) and api/deliveries/[id].js (PUT, DELETE)
    status: pending
  - id: 4-6
    content: Create api/gatepasses.js (GET, POST) and api/gatepasses/[id].js (PUT, DELETE)
    status: pending
  - id: 4-7
    content: Create api/schedules.js (GET, POST) and api/schedules/[id].js (PUT, DELETE)
    status: pending
  - id: 4-8
    content: Create api/procurements.js (GET, POST) and api/procurements/[id].js (PUT, DELETE)
    status: pending
  - id: 4-9
    content: Create api/deployments.js (GET, POST) and api/deployments/[id].js (DELETE)
    status: pending
  - id: 4-10
    content: Create api/notifications.js (GET, POST, PATCH)
    status: pending
  - id: 4-11
    content: Seed users collection with admin and staff accounts
    status: completed
  - id: 5-1
    content: Update vercel.json with buildCommand, outputDirectory, rewrites for multi-page
    status: completed
  - id: 5-2
    content: Add MONGODB_URI and JWT_SECRET to Vercel env vars and .env.local
    status: completed
  - id: 5-3
    content: Push project to GitHub and connect Vercel to repository
    status: completed
  - id: 5-4
    content: Add .cursorrules with conventional commits
    status: completed
  - id: 6-1
    content: Replace localStorage with API calls in dashboard.js
    status: pending
  - id: 6-2
    content: Replace localStorage with API calls in inventory.js
    status: completed
  - id: 6-3
    content: Replace localStorage with API calls in scheduling.js
    status: pending
  - id: 6-4
    content: Replace localStorage with API calls in deliveries.js
    status: pending
  - id: 6-5
    content: Replace localStorage with API calls in procurement.js
    status: pending
  - id: 6-6
    content: Replace localStorage with API calls in gatepass.js
    status: pending
  - id: 6-7
    content: Replace localStorage with API calls in deployment.js
    status: pending
  - id: 6-8
    content: Replace hardcoded login with /api/auth/login and add auth guard
    status: completed
  - id: 6-9
    content: Test full flow locally (login, all views, CRUD operations)
    status: pending
  - id: 6-10
    content: Archive mylogin.html and remove server.ps1 after migration verified
    status: pending
isProject: false
---

# REIINN-ventory: Vite + Vanilla JS + MongoDB + Vercel Implementation Plan

## Architecture Overview

```mermaid
flowchart TB
    subgraph Frontend [Vite Frontend]
        index[index.html - Login]
        app[app.html - Main Shell]
        views[views/*.html - Feature Fragments]
        router[Router - Hash-based]
    end

    subgraph API [Vercel Serverless API]
        auth[/api/auth]
        inv[/api/inventory]
        deliv[/api/deliveries]
        gp[/api/gatepasses]
        sched[/api/schedules]
        proc[/api/procurements]
        dep[/api/deployments]
        notif[/api/notifications]
    end

    subgraph DB [MongoDB Atlas]
        mongo[(Collections)]
    end

    index -->|login| auth
    app --> router
    router -->|fetch| views
    app -->|CRUD| inv
    app -->|CRUD| deliv
    app -->|CRUD| gp
    app -->|CRUD| sched
    app -->|CRUD| proc
    app -->|CRUD| dep
    app -->|CRUD| notif

    auth --> mongo
    inv --> mongo
    deliv --> mongo
    gp --> mongo
    sched --> mongo
    proc --> mongo
    dep --> mongo
    notif --> mongo
```



---

## Phase 1: Repository and Vite Setup

### 1.1 Initialize Git and Vercel-Ready Structure

- Run `git init` in project root
- Add `.gitignore` (node_modules, dist, .env, .env.local, .vercel)
- Create `vercel.json` for build config (optional; Vercel auto-detects Vite)

### 1.2 Vite + Vanilla JS Project

- Create new Vite project with vanilla template: `npm create vite@latest . -- --template vanilla`
- Configure `vite.config.js` for **multi-page** build:
  - Entry points: `index.html` (login), `app.html` (main app)
  - Define `build.rollupOptions.input` with both HTML files
- Result: `npm run dev` gives hot reload; `npm run build` outputs to `dist/`

### 1.3 Project Structure (Target)

```
reiinn-ventory/
Γö£ΓöÇΓöÇ index.html              # Login page (entry)
Γö£ΓöÇΓöÇ app.html                # Main app shell (sidebar + content area)
Γö£ΓöÇΓöÇ public/
Γöé   Γö£ΓöÇΓöÇ logo.png
Γöé   ΓööΓöÇΓöÇ views/              # HTML fragments per feature
Γöé       Γö£ΓöÇΓöÇ dashboard.html
Γöé       Γö£ΓöÇΓöÇ inventory.html
Γöé       Γö£ΓöÇΓöÇ scheduling.html
Γöé       Γö£ΓöÇΓöÇ deliveries.html
Γöé       Γö£ΓöÇΓöÇ procurement.html
Γöé       Γö£ΓöÇΓöÇ gatepass.html
Γöé       ΓööΓöÇΓöÇ deployment.html
Γö£ΓöÇΓöÇ src/
Γöé   Γö£ΓöÇΓöÇ main.js             # Entry for index.html (login logic)
Γöé   Γö£ΓöÇΓöÇ app.js              # Entry for app.html (router, init)
Γöé   Γö£ΓöÇΓöÇ router.js           # Hash-based routing, loads view HTML
Γöé   Γö£ΓöÇΓöÇ api.js              # fetch wrapper for API calls
Γöé   Γö£ΓöÇΓöÇ auth.js             # Token storage, auth check
Γöé   Γö£ΓöÇΓöÇ modules/            # Feature-specific JS (one per view)
Γöé   Γöé   Γö£ΓöÇΓöÇ dashboard.js
Γöé   Γöé   Γö£ΓöÇΓöÇ inventory.js
Γöé   Γöé   Γö£ΓöÇΓöÇ scheduling.js
Γöé   Γöé   Γö£ΓöÇΓöÇ deliveries.js
Γöé   Γöé   Γö£ΓöÇΓöÇ procurement.js
Γöé   Γöé   Γö£ΓöÇΓöÇ gatepass.js
Γöé   Γöé   ΓööΓöÇΓöÇ deployment.js
Γöé   ΓööΓöÇΓöÇ styles/
Γöé       Γö£ΓöÇΓöÇ variables.css
Γöé       Γö£ΓöÇΓöÇ layout.css
Γöé       ΓööΓöÇΓöÇ components.css
Γö£ΓöÇΓöÇ api/                    # Vercel Serverless Functions
Γöé   Γö£ΓöÇΓöÇ auth/
Γöé   Γöé   ΓööΓöÇΓöÇ login.js
Γöé   Γö£ΓöÇΓöÇ inventory.js
Γöé   Γö£ΓöÇΓöÇ deliveries.js
Γöé   Γö£ΓöÇΓöÇ gatepasses.js
Γöé   Γö£ΓöÇΓöÇ schedules.js
Γöé   Γö£ΓöÇΓöÇ procurements.js
Γöé   Γö£ΓöÇΓöÇ deployments.js
Γöé   ΓööΓöÇΓöÇ notifications.js
Γö£ΓöÇΓöÇ lib/                    # Shared backend utilities
Γöé   ΓööΓöÇΓöÇ db.js               # MongoDB connection
Γö£ΓöÇΓöÇ package.json
Γö£ΓöÇΓöÇ vite.config.js
Γö£ΓöÇΓöÇ vercel.json
ΓööΓöÇΓöÇ .env.example
```

---

## Phase 2: Split HTML by Feature

### 2.1 Extract Views from [mylogin.html](c:\Developer\reiinn-ventory\mylogin.html)

Each `content-section` div becomes a separate HTML fragment in `public/views/`:


| Current Section                                | New File           | Content                      |
| ---------------------------------------------- | ------------------ | ---------------------------- |
| `#dashboard-view`                              | `dashboard.html`   | Stats grid + calendar        |
| `#inventory-list-view` + `#inventory-reg-view` | `inventory.html`   | Both list and registry       |
| `#scheduling-view`                             | `scheduling.html`  | Form + table                 |
| `#delivery-view`                               | `deliveries.html`  | Form + table                 |
| `#procurement-view`                            | `procurement.html` | Form + table                 |
| `#gatepass-view`                               | `gatepass.html`    | Form + cart + history        |
| `#deployed-view`                               | `deployment.html`  | Form + location grid + table |


Each fragment contains only the inner content (no `<!DOCTYPE>`, no `<head>`). The router injects it into `#content-area` in `app.html`.

### 2.2 index.html (Login)

- Standalone page: logo, username, password, login button
- Script: `src/main.js` (login form handler, calls `/api/auth/login`, stores token, redirects to `app.html`)

### 2.3 app.html (Main Shell)

- Layout: sidebar (nav, notifications, logout) + `#content-area` (where view HTML is injected)
- Clock in header
- Script: `src/app.js` (auth guard, init router, load default view)
- Sidebar links use `#/dashboard`, `#/inventory`, `#/scheduling`, etc.

### 2.4 Router (Hash-Based)

- Routes: `#/dashboard`, `#/inventory`, `#/scheduling`, `#/deliveries`, `#/procurement`, `#/gatepass`, `#/deployment`
- On route change: `fetch('/views/{route}.html')` and inject into `#content-area`
- Call corresponding module init (e.g. `inventory.init()`) to bind events and render data

---

## Phase 3: Shared Styles and Scripts

### 3.1 CSS Split

- `variables.css`: `:root` tokens (colors, shadows)
- `layout.css`: body, sidebar, content-section, stats-grid, cards
- `components.css`: forms, tables, modals, pills, buttons
- Import all in `index.html` and `app.html` via `<link>` or shared CSS entry

### 3.2 JS Modules

- `api.js`: `api.get(url)`, `api.post(url, body)`, etc. ΓÇö adds `Authorization: Bearer <token>` header
- `auth.js`: `getToken()`, `setToken()`, `logout()`, `isAuthenticated()`
- Each `modules/*.js` exports `init()` and handles its viewΓÇÖs DOM and API calls
- Replace all `localStorage.getItem('rei_*')` with `api.get('/api/...')` and `api.post(...)`

---

## Phase 4: MongoDB and API

### 4.1 MongoDB Atlas Setup (Manual)

- Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Create database `reiinn_ventory`
- Collections: `users`, `inventory`, `deliveries`, `gatepasses`, `schedules`, `procurements`, `deployments`, `notifications`
- Create read/write user, get connection string
- Add `MONGODB_URI` to `.env.local` (and Vercel env vars for production)

### 4.2 lib/db.js

- Connect to MongoDB using `MONGODB_URI`
- Use connection caching (serverless-friendly: reuse connection across invocations)
- Export `getDb()` helper

### 4.3 API Endpoints (Vercel Serverless)

Each file in `api/` exports a default function handling `req` and `res`:


| Endpoint                 | Methods          | Purpose                          |
| ------------------------ | ---------------- | -------------------------------- |
| `/api/auth/login`        | POST             | Validate credentials, return JWT |
| `/api/inventory`         | GET, POST        | List, create                     |
| `/api/inventory/[id]`    | PUT, DELETE      | Update, delete                   |
| `/api/deliveries`        | GET, POST        | Same pattern                     |
| `/api/gatepasses`        | GET, POST        | Same pattern                     |
| `/api/gatepasses/[id]`   | PUT, DELETE      | Update status, delete            |
| `/api/schedules`         | GET, POST        | Same pattern                     |
| `/api/schedules/[id]`    | PUT, DELETE      | Same pattern                     |
| `/api/procurements`      | GET, POST        | Same pattern                     |
| `/api/procurements/[id]` | PUT, DELETE      | Same pattern                     |
| `/api/deployments`       | GET, POST        | Same pattern                     |
| `/api/deployments/[id]`  | DELETE           | Same pattern                     |
| `/api/notifications`     | GET, POST, PATCH | List, create, mark read          |


Use `mongodb` npm package (no Mongoose for simplicity). Auth: simple JWT (e.g. `jsonwebtoken`) or session cookie; seed `users` with admin/staff for migration.

---

## Phase 5: Vercel Deployment

### 5.1 vercel.json (Optional)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

Note: For multi-page (index.html + app.html), rewrites may need adjustment so `/app.html` is served. Alternatively, use default Vite output and let Vercel detect it.

### 5.2 Environment Variables

- In Vercel dashboard: add `MONGODB_URI` (and `JWT_SECRET` if using JWT)
- Local: `.env.local` with same vars (not committed)

### 5.3 Connect Repository

- Push to GitHub (or GitLab/Bitbucket)
- In Vercel: Import project, connect repo
- Set root directory to `.` (project root)
- Vercel will run `npm run build` and deploy `dist/` + `api/` automatically

---

## Phase 6: Migration from localStorage

### 6.1 Data Flow Change

- **Before:** `localStorage.getItem('rei_inv')` etc.
- **After:** `api.get('/api/inventory')` etc.
- Each moduleΓÇÖs `init()` fetches data from API and renders; form submits call `api.post()` / `api.put()`

### 6.2 Seed Data (Optional)

- Create `api/seed.js` or a one-off script to insert initial users (admin, staff) and sample inventory if needed
- Run locally or via a one-time Vercel function invocation

---

## Implementation Order

1. **Phase 1:** Git init, Vite setup, folder structure, vercel.json
2. **Phase 2:** Extract index.html, app.html, create view fragments in `public/views/`
3. **Phase 3:** Split CSS, create api.js, auth.js, router.js, stub modules
4. **Phase 4:** MongoDB Atlas, lib/db.js, implement all API endpoints
5. **Phase 5:** Wire frontend to API (replace localStorage), add auth flow
6. **Phase 6:** Test locally, push to GitHub, connect Vercel, deploy

---

## Detailed To-Dos (Checklist)

### Phase 1: Repository and Vite Setup

- 1-1: Run git init and create .gitignore (node_modules, dist, .env, .env.local, .vercel)
- 1-2: Create Vite project with vanilla template (npm create vite@latest)
- 1-3: Configure vite.config.js for multi-page build (index.html + app.html)
- 1-4: Create folder structure (public/, public/views/, src/, src/modules/, src/styles/, api/, lib/)
- 1-5: Create vercel.json and .env.example

### Phase 2: Split HTML by Feature

- 2-1: Create index.html with login form (logo, username, password, login button)
- 2-2: Create app.html with sidebar, #content-area, clock, and nav structure
- 2-3: Extract dashboard view to public/views/dashboard.html
- 2-4: Extract inventory view (list + registry) to public/views/inventory.html
- 2-5: Extract scheduling view to public/views/scheduling.html
- 2-6: Extract deliveries view to public/views/deliveries.html
- 2-7: Extract procurement view to public/views/procurement.html
- 2-8: Extract gatepass view to public/views/gatepass.html
- 2-9: Extract deployment view to public/views/deployment.html
- 2-10: Copy logo.png to public/ and add descModal to app.html

### Phase 3: Shared Styles and Scripts

- 3-1: Create src/styles/variables.css with :root tokens
- 3-2: Create src/styles/layout.css (body, sidebar, content-section, cards)
- 3-3: Create src/styles/components.css (forms, tables, modals, pills, buttons)
- 3-4: Create src/api.js with get/post/put/delete and Authorization header
- 3-5: Create src/auth.js (getToken, setToken, logout, isAuthenticated)
- 3-6: Create src/router.js with hash-based routing and view loading
- 3-7: Create src/main.js for login page (form handler, redirect)
- 3-8: Create src/app.js (auth guard, router init, default view)
- 3-9: Create src/modules/dashboard.js with init() and render logic
- 3-10: Create src/modules/inventory.js with init() and render logic
- 3-11: Create src/modules/scheduling.js with init() and render logic
- 3-12: Create src/modules/deliveries.js with init() and render logic
- 3-13: Create src/modules/procurement.js with init() and render logic
- 3-14: Create src/modules/gatepass.js with init() and render logic
- 3-15: Create src/modules/deployment.js with init() and render logic

### Phase 4: MongoDB and API

- 4-1: Create MongoDB Atlas cluster and database reiinn_ventory
- 4-2: Create lib/db.js with connection caching and getDb() helper
- 4-3: Create api/auth/login.js (POST, validate credentials, return JWT)
- 4-4: Create api/inventory.js (GET, POST) and api/inventory/[id].js (PUT, DELETE)
- 4-5: Create api/deliveries.js (GET, POST) and api/deliveries/[id].js (PUT, DELETE)
- 4-6: Create api/gatepasses.js (GET, POST) and api/gatepasses/[id].js (PUT, DELETE)
- 4-7: Create api/schedules.js (GET, POST) and api/schedules/[id].js (PUT, DELETE)
- 4-8: Create api/procurements.js (GET, POST) and api/procurements/[id].js (PUT, DELETE)
- 4-9: Create api/deployments.js (GET, POST) and api/deployments/[id].js (DELETE)
- 4-10: Create api/notifications.js (GET, POST, PATCH)
- 4-11: Seed users collection with admin and staff accounts

### Phase 5: Vercel Deployment

- 5-1: Update vercel.json with buildCommand, outputDirectory, rewrites for multi-page
- 5-2: Add MONGODB_URI and JWT_SECRET to Vercel env vars and .env.local
- 5-3: Push project to GitHub and connect Vercel to repository
- 5-4: Add .cursorrules with conventional commits

### Phase 6: Migration and Verification

- 6-1: Replace localStorage with API calls in dashboard.js
- 6-2: Replace localStorage with API calls in inventory.js
- 6-3: Replace localStorage with API calls in scheduling.js
- 6-4: Replace localStorage with API calls in deliveries.js
- 6-5: Replace localStorage with API calls in procurement.js
- 6-6: Replace localStorage with API calls in gatepass.js
- 6-7: Replace localStorage with API calls in deployment.js
- 6-8: Replace hardcoded login with /api/auth/login and add auth guard
- 6-9: Test full flow locally (login, all views, CRUD operations)
- 6-10: Archive mylogin.html and remove server.ps1 after migration verified

---

## Key Files to Create/Modify


| Action         | Path                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| Create         | `vite.config.js` (multi-page)                                             |
| Create         | `index.html`, `app.html`                                                  |
| Create         | `public/views/*.html` (7 fragments)                                       |
| Create         | `src/main.js`, `src/app.js`, `src/router.js`, `src/api.js`, `src/auth.js` |
| Create         | `src/modules/*.js` (7 modules)                                            |
| Create         | `src/styles/*.css` (3 files)                                              |
| Create         | `api/**/*.js` (auth + 6 entity endpoints)                                 |
| Create         | `lib/db.js`                                                               |
| Create         | `vercel.json`, `.gitignore`, `.env.example`                               |
| Migrate        | Logo from current project to `public/logo.png`                            |
| Remove/Archive | `mylogin.html` (after migration), `server.ps1`                            |


---

## Vercel Connection (Start Early)

You can connect the repository to Vercel **as soon as Phase 1 is done** (git init + basic Vite build). Early connection allows:

- Automatic deploys on push
- Preview deployments for branches
- Environment variables configured once

The first deploy may fail until the API and MongoDB are wired; thatΓÇÖs expected. Once Phase 4ΓÇô5 are complete, production will work.