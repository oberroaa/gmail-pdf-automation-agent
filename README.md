# Tuuci Agent — PDF Automation & Inventory Intelligence System

> Intelligent automation platform that reads Gmail attachments, analyzes production documents with AI, and delivers real-time inventory decisions via WhatsApp and Email.

---

## Overview

Tuuci Agent is a production-ready document intelligence system built for manufacturing and supply-chain operations. It eliminates manual PDF review by automatically extracting, classifying, and cross-referencing material and canopy production orders against live inventory — notifying the right people instantly.

The system is cloud-agnostic and has been tested on **Vercel + GitHub Actions**. It is fully compatible with **AWS**, **Azure**, **Google Cloud**, or any Node.js-capable infrastructure.

---

## System Architecture

The platform is composed of three independently deployable layers:

```
┌─────────────────────────────────────────────────────┐
│              Admin Panel (React SPA)                │
│         React · TypeScript · Tailwind · Vite        │
│   Deployable on: Vercel / S3+CloudFront / Azure     │
│                 Static Web Apps                     │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│              Backend API (Node.js/Express)           │
│     Authentication · Inventory · Rules · History    │
│   Deployable on: AWS EC2 / Azure App Service /      │
│                 Render / Railway / VPS              │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Automation Agent (Scheduled Job)          │
│     Gmail polling · PDF Analysis · Notifications   │
│   Deployable on: GitHub Actions / AWS Lambda /      │
│                 Azure Functions / Cron Server       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  MongoDB Atlas                      │
│      Rules · Inventory · History · Users           │
└─────────────────────────────────────────────────────┘
```

---

## Core Modules

### 1. Material Handler
AI-powered module for general material extraction from purchase orders and supply PDFs.
- Uses **Google Gemini** to interpret natural-language extraction rules
- Rule engine configurable from the admin panel (no code changes required)
- Processes crane safety protocols, material catalogs, and stock requests

### 2. Canopy Analysis Engine
Deterministic (zero-AI) engine for critical canopy production documents.
- Coordinate-based PDF parsing — **0% error rate** on structured documents
- Cross-references canopy profiles, fabric SKUs, and scissor/tilt configurations against live inventory
- Generates shortage reports with exact unit counts

---

## Key Features

| Feature | Description |
|---|---|
| 📧 **Gmail Integration** | Monitors inbox via OAuth2, filters by sender/subject rules |
| 🤖 **AI Analysis** | Google Gemini extracts materials from unstructured PDFs |
| 📐 **Precision Canopy Parser** | Deterministic coordinate-based extractor for production orders |
| 📦 **Inventory Cross-Reference** | Real-time stock check with shortage detection |
| 💬 **WhatsApp Notifications** | Meta Cloud API with 24h session management |
| 📊 **Admin Dashboard** | Full CRUD for inventory, rules, users, and analysis history |
| 🔐 **RBAC Auth** | JWT-based authentication with role-based access control |
| 📁 **Excel Import** | Bulk inventory updates via `.xlsx` file upload |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ (ESM) |
| Backend Framework | Express.js |
| Frontend | React 18 · TypeScript · Tailwind CSS · Vite |
| AI / LLM | Google Gemini Pro (`@google/generative-ai`) |
| Database | MongoDB Atlas (compatible with any MongoDB instance) |
| Gmail | Google APIs OAuth2 (`googleapis`) |
| WhatsApp | Meta Cloud API (official) |
| PDF Processing | `pdfjs-dist` |
| Process Manager | PM2 (for self-hosted deployments) |

---

## Deployment

The system is **cloud-agnostic**. Each layer can be deployed independently on any provider.

### Recommended: Self-hosted or Cloud VM
```
Frontend  → Vercel / AWS S3+CloudFront / Azure Static Web Apps
Backend   → AWS EC2 / Azure App Service / Render / Railway / VPS with PM2
Agent     → GitHub Actions (scheduled) / AWS Lambda / Azure Functions
Database  → MongoDB Atlas (cloud) or self-hosted MongoDB
```

### Quick Start (local)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/tuuci-agent.git
cd tuuci-agent

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd admin-frontend && npm install && cd ..

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see section below)

# 5. Generate Gmail OAuth token (one-time setup)
node get-refresh-token.js

# 6. Start the backend API
node admin/server.js

# 7. Start the frontend (separate terminal)
cd admin-frontend && npm run dev

# 8. Run the agent manually
node agent.js
```

### Production (PM2)
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # Auto-start on server reboot
```

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ── Google Gemini AI ──────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here

# ── Gmail OAuth2 ─────────────────────────────────────
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=http://localhost
REFRESH_TOKEN=your_gmail_refresh_token

# ── WhatsApp (Meta Cloud API) ─────────────────────────
WA_TOKEN=your_whatsapp_bearer_token
WA_PHONE_ID=your_whatsapp_phone_number_id
WHATSAPP_TO=19541234567,19549876543   # Comma-separated recipients

# ── MongoDB ───────────────────────────────────────────
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=YourApp

# ── Agent Config ──────────────────────────────────────
PDF_OUTPUT_DIR=./processed_pdfs
TEST_MODE=false    # Set to true to skip WhatsApp/Email sending during testing
```

> **Note:** Never commit the `.env` file. All secrets must be configured as environment variables in your hosting provider's dashboard.

---

## Project Structure

```
tuuci-agent/
├── agent.js                  # Main automation agent (Gmail polling + PDF dispatch)
├── analyze-pdf.js            # AI-powered material extraction engine
├── analyze-canopy.js         # Deterministic canopy PDF parser
├── db.js                     # MongoDB connection module
├── rules-manager.js          # Cloud-synced extraction rules
├── whatsapp.js               # Meta WhatsApp Cloud API integration
├── get-refresh-token.js      # One-time Gmail OAuth token generator
├── ecosystem.config.cjs      # PM2 process manager configuration
├── admin/
│   ├── server.js             # REST API server (Express)
│   └── auth.js               # JWT authentication middleware
├── admin-frontend/           # React admin panel (SPA)
│   └── src/
│       ├── components/       # UI components (Canopy, Rules, History, etc.)
│       └── services/         # API client modules
├── api/                      # Serverless entry point (Vercel/AWS Lambda)
├── .github/workflows/        # GitHub Actions — scheduled agent execution
└── processed_pdfs/           # Local storage for processed documents
```

---

## API Endpoints (Summary)

The backend exposes a REST API on port `3001` (configurable).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive JWT token |
| `GET` | `/api/canopy` | List canopy inventory (paginated) |
| `POST` | `/api/canopy` | Create new canopy record |
| `PUT` | `/api/canopy/:id` | Update canopy record |
| `DELETE` | `/api/canopy/:id` | Delete canopy record |
| `GET` | `/api/history` | Analysis history log |
| `GET` | `/api/rules` | Extraction rules list |
| `POST` | `/api/analyze` | Manually trigger PDF analysis |

All endpoints (except login) require `Authorization: Bearer <token>` header.

---

## Security

- **Authentication**: JWT tokens with configurable expiration
- **Secrets**: All credentials managed via environment variables — no hardcoded values
- **OAuth2**: Gmail access uses refresh token flow — no password storage
- **CORS**: Configurable allowed origins for production environments

---

## License & Ownership

**Copyright © 2025 Otoniel Berroa. All rights reserved.**

This software and its source code are the exclusive intellectual property of the author.
No part of this codebase may be copied, modified, distributed, sublicensed, or used
in any form without the express prior written permission of the copyright holder.

> This software is provided under a **proprietary commercial license**.
> Unauthorized use, reproduction, or distribution is strictly prohibited and may be
> subject to civil and criminal penalties under applicable law.

For licensing inquiries, commercial use, or acquisition, contact the author directly.

---

*Built with Node.js · Google Gemini · MongoDB · React · Meta WhatsApp API*
