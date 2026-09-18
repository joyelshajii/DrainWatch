# Kochi DrainWatch (LSGD JalaNidhi AI)
### Municipal Canal & Storm-Drain Blockage Redressal System
**Challenge SC-08 — Selection Round Prototype | ANAVANDI 2026 Hackathon**  
*Organized by Jain (Deemed-to-be University) Kochi — School of Future*

---

## 1. Problem Statement (SC-08)
> **Problem:** Blocked drains may go unreported because residents do not know which authority or ward should respond.  
> **Build:** Create a photo-and-location reporting tool that identifies the correct local-body ward, creates a ticket, shows public status and escalates unresolved reports.  
> **A complete submission should show:** Report, ward identification, ticket, status, escalation and an open-report map working end to end.

---

## 2. End-to-End Capabilities Built
1. **AI-Powered Photographic & Geotagged Reporting:**
   - Real-time photo capture/upload with live image preview.
   - MobileNet CNN Computer Vision inference model classifying canal condition (Polluted / Choked vs. Clean) with confidence scoring.
   - Interactive Leaflet coordinate picker with device GPS geolocation and preset Kochi canal hotspots.
2. **Deterministic Ward & Authority Identification:**
   - Sub-millisecond Ray-Casting Point-in-Polygon (PIP) engine.
   - Accurately resolves Kochi Municipal Corporation wards (Thevara-Perandoor, Mullassery, Edappally, Changadampokku, Chilavannoor, Calvathy canals) to exact Ward Number, Ward Councillor, Assistant Engineer (AE, LSGD Engineering Wing), and Health Inspector.
3. **Automated Statutory Ticket Generation:**
   - Formats unique statutory ticket numbers: `KL-KCH-W{ward}-{year}-{sequence}`.
   - Computes statutory SLA deadline based on severity (Critical 24h, High 48h, Moderate 72h, Minor 96h).
4. **Public Grievance Status Tracking:**
   - Searchable public ticket tracking interface.
   - Verifiable timeline showing each action, actor role, timestamp, and official remarks.
   - Before vs. After photographic evidence comparison when de-silting is completed.
5. **Multi-Tier Automated Escalation Engine:**
   - Background SLA monitoring daemon that checks open grievances every 30 seconds.
   - Automatic escalation:
     - Level 1: Ward Sanitation Supervisor & Junior Health Inspector
     - Level 2: Assistant Engineer (LSGD Engineering Wing)
     - Level 3: Municipal Corporation Secretary & Executive Engineer
     - Level 4: District Disaster Management Authority (DDMA) & Emergency Monsoon Cell
   - Citizen Escalation Appeal button for public intervention.
6. **Live Open-Report GIS Map:**
   - Interactive OpenStreetMap layer with Kochi ward boundary polygons.
   - Color-coded status pins: Red (Escalated), Amber (Reported/Inspected), Blue (Work in Progress), Green (Resolved).
   - Multi-parameter filtering by Ward, Severity, Status, and search query.
7. **Ward Officer Triage Console:**
   - Dedicated administrative dashboard for LSGD engineers and sanitation supervisors.
   - Action modal to assign maintenance crews, update status, record inspection remarks, and upload completion proof photos.
8. **Civic Gamification & Impact Leaderboard:**
   - Recognizes citizen water wardens with civic impact points (+10 pts per verified report).
9. **Statutory Compliance & Clean Civic UI:**
   - Zero purple gradients, zero pill-shaped buttons, zero fake reviews/counters, zero cursor animations, and zero AI slop copy.
   - Includes custom SVG favicon, statutory Privacy Policy (`/privacy`), and Terms of Service (`/terms`).
   - Integrated **8-Slide Pitch Deck** (`/presentation`) adhering strictly to the competition requirements.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Backend API** | Python 3.10 / Flask | Lightweight, fast REST API hosting GIS geometry, SLA worker, and deep learning inference. |
| **AI Vision Model** | MobileNet CNN (Keras `model.h5`) | Computer vision classification of canal waste, hyacinth, and choke obstruction with confidence ratings. |
| **GIS Engine** | Custom Ray-Casting PIP | Deterministic 2D point-in-polygon resolution with Euclidean distance centroid fallback. |
| **Database** | ACID Transactional Store | Thread-safe (`threading.Lock`), zero-dependency disk persistence to `data/reports.json`. |
| **Frontend** | React 19 + TypeScript + Vite | Type-safe, modular, reactive UI with sub-second hot reload. |
| **Styling** | Tailwind CSS v4 | High-contrast utilitarian municipal styling, crisp borders, no AI aesthetic clichés. |
| **Mapping** | Leaflet.js + OpenStreetMap | Lightweight open-source GIS rendering with GeoJSON polygon overlays. |

---

## 4. Quick Start (Running Locally)

### Option A: One-Click Launch Script
Run either of the startup scripts from the `DrainWatch_Final` folder:
```powershell
.\start_app.bat
# or
.\start_app.ps1
```

### Option B: Manual Launch

#### 1. Backend Server
```powershell
cd backend
python server.py
```
Backend runs on **http://localhost:8088**.

#### 2. Frontend Development Server
```powershell
cd frontend
npm run dev
```
Access the application at **http://localhost:5173**.

---

## 5. Automated Testing
Run the backend test suite:
```powershell
cd backend
python test_server.py
```
All unit tests for GIS Ray-Casting PIP, SLA calculations, and API endpoints will execute and validate.
