# MongoDB Atlas Setup for REIINN-ventory

## Quick Start

1. Create a MongoDB Atlas cluster (see below)
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI` and `JWT_SECRET`
3. Run `npm run seed` to create admin/staff users
4. Run `npm run dev:full` (or `vercel dev`) for full-stack local dev with API
5. Add `MONGODB_URI` and `JWT_SECRET` to Vercel Environment Variables for production

## 1. Create Account & Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **Build a Database**
4. Choose **M0 FREE** (shared tier)
5. Select cloud provider and region (e.g. AWS, nearest to you)
6. Click **Create**

## 2. Create Database User

1. Go to **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `reiinn_admin` (or your choice)
4. Password: Click **Autogenerate Secure Password** and **copy it**
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

## 3. Network Access

1. Go to **Network Access** → **Add IP Address**
2. For development: **Allow Access from Anywhere** (`0.0.0.0/0`)
3. Click **Confirm**

## 4. Get Connection String

1. Go to **Database** → click **Connect** on your cluster
2. Choose **Drivers** or **Connect your application**
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` with your database user
5. Replace `<password>` with your password (URL-encode special chars if needed)
6. Add database name before `?`:
   ```
   mongodb+srv://reiinn_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/reiinn_ventory?retryWrites=true&w=majority
   ```

## 5. Create Database & Collections

1. Go to **Database** → **Browse Collections**
2. Click **Create Database**
3. Database name: `reiinn_ventory`
4. Create these collections (one at a time or let them auto-create on first insert):
   - `users`
   - `inventory`
   - `deliveries`
   - `gatepasses`
   - `schedules`
   - `procurements`
   - `deployments`
   - `notifications`

## 6. Configure Project

1. Copy `.env.example` to `.env.local`
2. Set `MONGODB_URI` to your connection string
3. Add `MONGODB_URI` to Vercel Environment Variables for production

## Windows: Connection Issues (querySrv ECONNREFUSED / ENOTFOUND)

The app applies a Windows fix automatically: Cloudflare/Google DNS, IPv4-first, and `family: 4` for MongoClient. This resolves most `querySrv ECONNREFUSED` and `getaddrinfo ENOTFOUND` errors.

If you still see connection errors:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → **Database** → **Connect** on your cluster
2. Choose **Drivers** → **Node.js**
3. Copy the **standard** connection string (starts with `mongodb://`, not `mongodb+srv://`)
4. Add to `.env.local`:
   ```
   MONGODB_URI_STANDARD=mongodb://username:password@cluster0-shard-00-00.xxxxx.mongodb.net:27017,.../reiinn_ventory?ssl=true&replicaSet=...&authSource=admin
   ```

The app will use `MONGODB_URI_STANDARD` when set, bypassing the SRV format.
