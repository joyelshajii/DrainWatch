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

## 2. End-to-End Capabilities & Modern Architecture
DrainWatch provides an end-to-end municipal platform designed for both citizens and Local Self-Government Department (LSGD) engineers across Kochi Municipal Corporation:

1. **AI-Powered Computer Vision Inference:**
   - Real-time photo capture/upload with geotag metadata preservation.
   - MobileNet CNN computer vision model classifying canal condition (`Polluted / Choked` vs. `Clean / Flowing`) with confidence scoring.
   - Automated suggestion of debris classification (`Plastic Solid Waste`, `Heavy Silt`, `Culvert Choke`, `Water Hyacinth`, `Construction Debris`) and severity rating.

2. **Deterministic Ward & Authority Identification (GIS Engine):**
   - Sub-millisecond Ray-Casting Point-in-Polygon (PIP) engine.
   - Accurately resolves Kochi Municipal Corporation wards across major canal basins (Thevara-Perandoor, Mullassery, Edappally, Changadampokku, Chilavannoor, Calvathy) to exact Ward Number, Ward Councillor, Assistant Engineer (AE, LSGD Engineering Wing), and Health Inspector.

3. **Guided 3-Step Reporting Wizard with Mode Switcher:**
   - **Step 1 (Pinpoint Location):** Leaflet coordinate picker, GPS geolocation, and 5 one-click Kochi basin presets.
   - **Step 2 (Issue Details):** Debris category selection, interactive severity cards with statutory SLA indicators, and waterflow impact notes.
   - **Step 3 (Evidence & Submit):** Photographic proof, live AI verification card with confidence progress bar, and reporter details.
   - **Mode Switcher:** Toggle between **Guided Steps** (ideal for mobile or first-time reporting) and **All-in-One** (for rapid submission).

4. **Public Grievance Status & SLA Clock:**
   - Searchable ticket registry with statutory ticket format: `KL-KCH-W{ward}-{year}-{sequence}`.
   - **Visual 4-Stage Redressal Stepper:** `1. Lodged & AI Geotagged` → `2. Field Inspected` → `3. Squad Dispatched` → `4. Flow Restored`.
   - **SLA Countdown Clock:** Color-coded elapsed percentage and statutory window indicators (Critical 24h, High 48h, Moderate 72h, Minor 96h).
   - **Before vs. After Photographic Audit:** Side-by-side comparison of citizen incident photo with official de-silting proof.

5. **Multi-Tier Automated Escalation Engine:**
   - SLA monitoring daemon running every 30 seconds.
   - Automatic statutory escalation tiers:
     - **Tier 1:** Ward Sanitation Supervisor & Junior Health Inspector
     - **Tier 2:** Assistant Engineer (LSGD Engineering Wing)
     - **Tier 3:** Municipal Corporation Secretary & Executive Engineer
     - **Tier 4:** District Disaster Management Authority (DDMA) & Emergency Monsoon Cell
   - Citizen statutory appeal mechanism.

6. **Interactive Ward GIS Map & Open Registry:**
   - Live Leaflet map with GeoJSON boundary overlays for Kochi municipal wards.
   - Status-coded marker clustering and direct **CSV Grievance Registry Export**.
   - Map View Filters: All Reports, Critical Flood Risks, and Resolved Sites.

7. **Officer Triage Workstation & Quick Dispatch:**
   - High-level triage metric cards: Active Queue, Critical Risk, SLA Overdue, and Restored Flow.
   - Quick squad assignment presets (`LSGD Quick Response Gang 3`, `KMC Siphon Jetting Unit`, `Central Excavator Gang`, `Ward Sanitation Squad`).
   - Resolution proof upload with image thumbnail preview and instant validation.

8. **Bilingual Citizen Accessibility (English & മലയാളം):**
   - Seamless language toggle (`EN` | `മലയാളം`) in the top navigation bar for regional accessibility across Kerala.
   - Live Kerala Monsoon Advisory indicator (Yellow Alert) and 24x7 Municipal Control Room hotline (`1800-425-4000`).

9. **Civic Champions Honor Roll:**
   - Top 3 Podium showcase (Gold, Silver, Bronze) recognizing proactive citizens.
   - Transparent gamification (+10 points per verified report, +10 points per resolution confirmation).

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Backend API** | Python 3.10 / Flask | Lightweight, fast REST API hosting GIS geometry, SLA worker, and deep learning inference. |
| **AI Vision Model** | MobileNet CNN (Keras `model.h5` / TFLite) | Computer vision classification of canal waste, hyacinth, and choke obstruction with confidence ratings. |
| **GIS Engine** | Custom Ray-Casting PIP | Deterministic 2D point-in-polygon resolution with Euclidean distance centroid fallback. |
| **Database** | ACID Transactional Store | Thread-safe (`threading.Lock`), zero-dependency disk persistence to `data/reports.json`. |
| **Frontend** | React 19 + TypeScript + Vite | Type-safe, modular, reactive UI with sub-second hot reload. |
| **Styling** | Tailwind CSS v4 | High-contrast utilitarian municipal styling, crisp borders, no artificial gradients. |
| **Mapping** | Leaflet.js + OpenStreetMap | Lightweight open-source GIS rendering with GeoJSON polygon overlays. |

---

## 4. UI Modernization & Architecture Highlights

The UI has been thoroughly modernized across 12 distinct commits:
- **Part 1:** Base theme tokens, custom scrollbars, and Leaflet tooltip refinement.
- **Part 2:** Reusable Badge UI kit with standardized rounded indicators.
- **Part 3:** Sidebar navigation with 24x7 monsoon hotline and streamlined layout.
- **Part 4:** Top navbar with live monsoon weather advisory, outside-click listener, and alert popover.
- **Part 5:** Ward GIS map workstation with direct CSV export and multi-mode view controls.
- **Part 6:** Guided 3-step citizen report wizard with mode switcher.
- **Part 7:** Computer vision analysis feedback card with confidence meter and auto-populated priority.
- **Part 8:** Visual 4-stage redressal lifecycle stepper and before-after verification photo flow.
- **Part 9:** Officer triage workstation with quick dispatch metrics and photo proof modal.
- **Part 10:** Civic champions leaderboard with top-3 podium cards and municipal recognition guide.
- **Part 11:** Bilingual English and Malayalam (`മലയാളം`) language toggle for state-wide accessibility.
- **Part 12:** Comprehensive architectural documentation and production build validation.

---

## 5. Quick Start (Running Locally)

### 1. Backend Server
```powershell
cd backend
python server.py
```
Backend runs on **http://localhost:8088**.

### 2. Frontend Development Server
```powershell
cd frontend
cmd /c npm install
cmd /c npm run dev
```
Access the application at **http://localhost:5173**.

### 3. Production Build
```powershell
cd frontend
cmd /c npm run build
```
Builds optimized production assets to `frontend/dist/`.

---

## 6. Automated Testing
Run the backend test suite:
```powershell
cd backend
python test_server.py
```
All unit tests for GIS Ray-Casting PIP, SLA calculations, and API endpoints will execute and validate.
