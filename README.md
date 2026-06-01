<div align="center">

# 🌏 TripStay — Accommodation Booking Platform

**A full-stack accommodation booking web application inspired by Airbnb**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![CI/CD](https://github.com/Thanhhh3008/Travel-Booking/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Thanhhh3008/Travel-Booking/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

</div>

---

## 📋 Table of Contents
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option 1: Run with Docker (Recommended)](#option-1-run-with-docker-recommended)
  - [Option 2: Run Locally (Manual Setup)](#option-2-run-locally-manual-setup)
- [⚙️ Environment Variables](#️-environment-variables)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [📸 Screenshots](#-screenshots)

---

## ✨ Features

### 👤 Authentication & User Management
- Register with **email verification** via a time-limited JWT link (15 minutes)
- Login with **email/password** or **Google OAuth2** (Sign in with Google)
- **Forgot password** flow via email link
- Change password, update profile info, and change avatar

### 🏠 Room Management
- List a property with **multiple image uploads** (room photos + legal documents)
- Auto-composed full address via **Province / District / Ward API**
- Admin **approval workflow**: Pending → Approved / Rejected with automated email notification
- Property owner dashboard to track all listed rooms by status

### 📅 Booking & Payment
- Real-time **date availability checker** to prevent double-booking
- Booking with check-in / check-out date selection (minimum 2 nights, up to 30 days in advance)
- Integrated **VNPay payment gateway** (supports sandbox & production)
- **QR code** generated and emailed to user upon successful booking
- Full booking history with payment status tracking

### ⭐ Reviews
- Only users with a **completed stay** can write a review (one review per user per room)
- Automatic **average rating recalculation** after each review

### 🔔 Notifications
- In-app **notification bell** per user
- Admin can send **personal** or **broadcast** notifications with simultaneous email delivery

### 🛡️ Admin Panel
- Dashboard with real-time stats: total users, rooms, today's bookings, total revenue
- Full room management with status filtering and pagination
- Hide / show rooms, delete rooms (with automatic email alert to owner)
- User management and notification system

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 20, Express.js 5 |
| **Template Engine** | EJS (Server-Side Rendering) |
| **Database** | MySQL 8.0 |
| **Authentication** | express-session, bcrypt, jsonwebtoken, Passport.js (Google OAuth2) |
| **File Upload** | Multer |
| **Email** | Nodemailer (Gmail SMTP) |
| **Payment** | VNPay SDK |
| **QR Code** | qrcode |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## 📁 Project Structure

```
Travel-Booking/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions CI/CD pipeline
├── public/                     # Static assets (CSS, JS, images)
│   ├── admin/uploads/          # Admin-uploaded images
│   ├── avartar/                # User avatars
│   ├── qrcode/                 # Generated QR codes
│   └── vendor/                 # Third-party libraries (jQuery, Bootstrap)
├── src/
│   ├── app.js                  # Express app entry point
│   ├── config/                 # App configuration
│   ├── controllers/
│   │   ├── admin/              # Admin controllers
│   │   └── client/             # Client controllers
│   ├── database/               # DB connection pool
│   ├── middlewares/            # Auth, upload, role middlewares
│   ├── models/                 # Database models
│   ├── routers/                # Express routers
│   ├── services/               # Business logic layer
│   ├── socket/                 # Socket.io (reserved)
│   ├── util/                   # Helpers, mailer, QR generator
│   └── views/                  # EJS templates
│       ├── admin/              # Admin views
│       └── client/             # Client views
├── sessions/                   # Session file store (git-ignored)
├── dulichdb.sql                # Database schema & seed data
├── .env.example                # Environment variables template
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Docker option)
- OR [Node.js 20+](https://nodejs.org/) + [MySQL 8.0](https://www.mysql.com/) (for local option)

### Option 1: Run with Docker (Recommended)

This is the easiest way to get the project up and running with zero manual configuration.

**1. Clone the repository**
```bash
git clone https://github.com/Thanhhh3008/Travel-Booking.git
cd Travel-Booking
```

**2. Create your environment file**
```bash
cp .env.example .env
```
Then open `.env` and fill in your actual credentials (Gmail App Password, VNPay keys, etc.).

**3. Start all services**
```bash
docker compose up -d --build
```

**4. Open the app**

| Service | URL |
|---|---|
| Web Application | http://localhost:6969 |
| Admin Dashboard | http://localhost:6969/admin |

**5. Stop all services**
```bash
docker compose down
```
To also delete all data volumes: `docker compose down -v`

---

### Option 2: Run Locally (Manual Setup)

**1. Clone the repository**
```bash
git clone https://github.com/Thanhhh3008/Travel-Booking.git
cd Travel-Booking
```

**2. Install dependencies**
```bash
npm install
```

**3. Setup database**

Import the schema into your local MySQL instance:
```bash
mysql -u root -p < dulichdb.sql
```

**4. Configure environment**
```bash
cp .env.example .env
# Edit .env with your local DB credentials and API keys
```

**5. Run the development server**
```bash
npm run dev
```

The server will start at **http://127.0.0.1:6969**

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory. Use `.env.example` as a template:

```env
# ─── Database ───────────────────────────────────
DB_HOST=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=your_db_password
DB_NAME=dulichdb
DB_PORT=3307

# ─── App ────────────────────────────────────────
PORT=6969
DOMAIN=http://127.0.0.1:6969
KEY_JWT=your_strong_jwt_secret

# ─── Gmail SMTP (for sending emails) ────────────
# Use an App Password, NOT your real Gmail password
# Guide: https://support.google.com/accounts/answer/185833
GMAIL_FROM=your_email@gmail.com
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_PASS=xxxx xxxx xxxx xxxx

# ─── VNPay Payment Gateway ──────────────────────
VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret

# ─── Google OAuth2 ──────────────────────────────
# Guide: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> ⚠️ **NEVER commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for automated CI/CD.

```
Push to main
    │
    ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Lint &    │────▶│  Build & Push    │────▶│  Deploy to Server   │
│   Test      │     │  Docker Image    │     │  (SSH — optional)   │
│             │     │  to Docker Hub   │     │                     │
└─────────────┘     └──────────────────┘     └─────────────────────┘
```

### Setup CI/CD Secrets on GitHub

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token (not your password) |

> **Generate a Docker Hub token:** Log in to [hub.docker.com](https://hub.docker.com) → Account Settings → Security → New Access Token

---

## 📸 Screenshots

> *Coming soon*

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Thanhhh3008">Thanhhh3008</a></p>
</div>
