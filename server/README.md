# 🎮 SkillVerse Backend API & Cloud Save Service

Node.js + Express backend service providing child-friendly JWT authentication and MongoDB cloud save synchronization for **SkillVerse**.

---

## 📋 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [MongoDB Atlas Setup Guide](#-mongodb-atlas-setup-guide)
3. [Environment Configuration](#-environment-configuration)
4. [Running Locally](#-running-locally)
5. [API Endpoints & Testing](#-api-endpoints--testing)
6. [Deployment Guide (Render / Railway)](#-deployment-guide-render--railway)
7. [Security & Tradeoffs](#-security--tradeoffs)
8. [Teammate Guide: Adding World Progress](#-teammate-guide-adding-world-progress)

---

## 🛠️ Tech Stack
- **Runtime:** Node.js (v18+)
- **Framework:** Express 4.x
- **Database:** MongoDB (via Mongoose 8.x)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Security:** `helmet`, `cors`, `express-rate-limit`, strict string sanitizers against NoSQL injection

---

## 🍃 MongoDB Atlas Setup Guide

To set up a free cloud database cluster (M0 Free Tier):

### 1. Create the Cluster
1. Sign up or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create** or **Build a Database**.
3. Select the **M0 Free Tier** (Shared).
4. Choose a cloud provider and region closest to your users (e.g., AWS / Mumbai `ap-south-1` or closest region).
5. Name your cluster (e.g. `skillverse-cluster`) and click **Create Cluster**.

### 2. Configure Database User
1. In the left navigation, go to **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Enter a username (e.g., `skillverse_admin`) and a secure password.
5. Under **Database User Privileges**, select **Read and write to any database**.
6. Click **Add User**.

### 3. Whitelist IP Addresses
1. In the left navigation, go to **Network Access**.
2. Click **Add IP Address**.
3. For local development and cloud hosting (like Render or Railway), click **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Confirm**.

### 4. Get the Connection URI
1. In the left navigation, click **Database** (or **Clusters**).
2. Click **Connect** on your cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials and append the database name `/skillverse` before the query parameters:
   ```
   mongodb+srv://myUser:myPassword@cluster0.abcde.mongodb.net/skillverse?retryWrites=true&w=majority
   ```

---

## ⚙️ Environment Configuration

In the `server` directory, create a `.env` file (based on `.env.example`):

```bash
# Server Port
PORT=5000

# MongoDB Connection String (Atlas M0 Free Tier or local MongoDB)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/skillverse?retryWrites=true&w=majority

# JWT Secret & Expiry
JWT_SECRET=replace_this_with_a_secure_random_secret_in_production
JWT_EXPIRES_IN=7d

# Allowed Frontend Origins for CORS (comma-separated if multiple)
CLIENT_ORIGIN=http://localhost:5173
```

> **Note:** Never commit real secrets or `.env` files into Git. The project `.gitignore` is already configured to ignore `.env` files while tracking `.env.example`.

---

## 🚀 Running Locally

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the server:**
   ```bash
   # Production mode:
   npm start

   # Development mode (with file watcher):
   npm run dev
   ```
   The server starts on `http://localhost:5000`.

---

## 📡 API Endpoints & Testing

### Endpoints Overview

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Uptime and MongoDB connection status |
| `POST` | `/api/auth/register` | Public (Rate-limited) | Register a new child account (returns JWT) |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Log in with email and password (returns JWT) |
| `GET` | `/api/auth/me` | Protected (Bearer) | Get current user profile |
| `GET` | `/api/save` | Protected (Bearer) | Get latest cloud save (or null if none) |
| `PUT` | `/api/save` | Protected (Bearer) | Upsert game state at end of day cycle |

### Automated Testing Scripts

You can run the bundled endpoint test scripts to test the full auth & cloud save lifecycle:

* **On Windows (PowerShell):**
  ```powershell
  cd server
  .\test-endpoints.ps1
  ```

* **On Linux / macOS (Bash):**
  ```bash
  cd server
  chmod +x test-endpoints.sh
  ./test-endpoints.sh
  ```

### Manual Curl Examples

1. **Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Register:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "MayaExplorer", "email": "maya@school.edu", "password": "mypassword123"}'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "maya@school.edu", "password": "mypassword123"}'
   ```

4. **Get Save (Protected):**
   ```bash
   curl -X GET http://localhost:5000/api/save \
     -H "Authorization: Bearer <TOKEN>"
   ```

5. **Upload End-of-Day Save (Protected):**
   ```bash
   curl -X PUT http://localhost:5000/api/save \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "schemaVersion": 1,
       "day": 2,
       "state": {
         "coins": 200,
         "xp": 50,
         "day": 2,
         "skills": { "life": 10, "human": 5, "digital": 20, "vocational": 5, "entrepreneurial": 0 },
         "flags": { "home_leak_repaired": true }
       },
       "worldProgress": {
         "home": { "leakRepaired": true }
       }
     }'
   ```

---

## 🌐 Deployment Guide (Render / Railway)

### Option A: Deploying to Render (Free Tier)
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the settings:
   - **Name:** `skillverse-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<A strong random secret string>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_ORIGIN`: `https://your-frontend-domain.vercel.app,http://localhost:5173`
7. Click **Create Web Service**.
8. Once deployed, copy your Render URL (e.g. `https://skillverse-api.onrender.com`) and set `VITE_API_URL=https://skillverse-api.onrender.com/api` in your frontend build settings.

### Option B: Deploying to Railway (Free / Hobby Tier)
1. Go to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Choose your repository and select the `/server` subdirectory (Settings -> Root Directory: `/server`).
4. In the project **Variables** tab, add `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, and `CLIENT_ORIGIN`.
5. Under **Settings** -> **Networking**, generate a public domain.

---

## 🔒 Security & Tradeoffs

### 1. JWT in localStorage Tradeoff
- **Implementation:** The JWT is saved in `localStorage` under `"skillverse_token"`.
- **Tradeoff:**
  - *Benefits:* Simple, reliable persistence for a static Single Page Application (SPA), zero cross-origin cookie configuration headaches on free hosting tiers, and seamless offline compatibility.
  - *Risks:* Vulnerable to Cross-Site Scripting (XSS) if untrusted third-party scripts execute in the browser.
  - *Production Recommendation:* For high-security enterprise environments, transition to `httpOnly`, `SameSite=Strict`, `Secure` cookies with a custom reverse proxy domain.

### 2. Child Safety & Data Minimization
- **Minimal Data Collected:** Only `username`, `email`, and game progression state are collected. No telemetry, analytics, tracking, or personal demographic data.
- **Child-Friendly Credentials:** Passwords must be at least 6 characters. Passwords are salted and hashed with `bcryptjs` before storage; plaintext passwords are never stored or logged.
- **NoSQL Injection Defenses:** Inputs are strictly cast and sanitized to prevent raw object queries (utilizing strict object shapes and `$eq` query operators).
- **Generic Error Responses:** Login failures return generic `"Invalid email or password"` errors to protect against account enumeration.
- **Brute Force Protection:** Express rate limiting restricts repeated auth attempts.

---

## 🤝 Teammate Guide: Adding World Progress

World leads do **not** need to modify backend code or the central save loop to store world-specific achievements, mini-game records, or unlocked items!

### How to Save Your World's Progress

From anywhere in your world's React components:

```javascript
import saveManager from "@/services/saveManager";

// When a student completes a mini-game, harvest, trade, or lesson:
function handleFarmHarvest(results) {
  saveManager.setWorldProgress("farm", {
    cropsHarvested: results.cropCount,
    waterEfficiencyPct: results.efficiency,
    bestScore: Math.max(results.score, previousBest),
    unlockedCrops: ["wheat", "tomato", "sunflower"]
  });
}
```

### How to Read Your World's Progress

```javascript
import saveManager from "@/services/saveManager";

function loadFarmState() {
  const allProgress = saveManager.getWorldProgress();
  const farmData = allProgress.farm || {};

  console.log("Crops harvested:", farmData.cropsHarvested || 0);
}
```

### When Does It Save to the Cloud?
- The backend adheres strictly to the rule: **Cloud saves are committed only at the end of each day cycle** (when the student finishes the night reflection on the Dream page and clicks *Wake Up*).
- Any progress you register via `saveManager.setWorldProgress("yourWorld", data)` is immediately cached locally and automatically packaged into the payload sent to MongoDB at the end of the day.
- Cross-world consequence flags (e.g. `flags: { farmWaterEfficiencyPct: 90 }`) continue to be stored in the shared player state through `usePlayer().updatePlayer({ flags: ... })`.
