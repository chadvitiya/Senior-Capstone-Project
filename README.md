# 443 Guardians — Network Traffic Explorer

**CS4366: Senior Capstone Project | Fall 2026**  
**Stage 3: Implementation, Demo, and Validation**  
**Submission deadline:** November 10, 2026, before 11:59 PM

## Project overview

Network Traffic Explorer is a web application for investigating suspicious network activity in the CDX 2009 traffic dataset. It combines a dashboard of detector-generated anomalies, an interactive investigation view, and an AI assistant that explains selected network evidence. The goal is to help analysts explore suspicious patterns without manually inspecting every packet.

## Stage 3 implementation

- **Data processing and storage:** Python-based traffic processing, SQLite storage, and generated JSON summaries.
- **Backend API:** FastAPI endpoints for dashboard metrics, anomaly details, investigation results, and AI questions.
- **Frontend:** React and TypeScript interface for browsing anomalies, selecting hosts, adjusting investigation time windows, and inspecting connection details.
- **AI-assisted investigation:** Gemini-powered Ask AI interface that answers questions using the current anomaly, selected hosts, time window, returned flows, and selected connection details.
- **Host anonymization:** The AI evidence uses host reference IDs (for example, `H-009773`) rather than original IP addresses. Selected connections are identified using flow IDs (for example, `F-28935`).

## Group members and Stage 3 roles

| Group member | Stage 3 role and contribution |
| --- | --- |
| Advitiya Gaikwad | Backend API integration |
| Carter Lafrenz | Frontend implementation and investigation interface. |
| Shravani Koli | AI chatbot integration and Ask AI functionality. |
| Benjamin Ratcliff | Report and Presentation. |
| Emilio Zavala | Report and Presentation. |

## Group meetings and activities

**Regular meeting schedule:** Tuesdays and Thursdays during Stage 3.

The group used these meetings to coordinate implementation, review the frontend/backend integration, discuss investigation workflows, and prepare for the demo. Specific attendance and meeting-by-meeting decisions should be added from the group's records if required.

### Stage 3 activities

1. Integrated the backend API with the frontend dashboard and investigation screens.
2. Connected the investigation workflow to the AI chat interface.
3. Updated AI evidence handling to use anonymized host reference IDs instead of raw IP addresses.
4. Added database-backed details for the currently selected connection to AI requests.

## Running the application locally

### Backend

From the project root, create and activate a virtual environment and install dependencies:

```powershell
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-backend.txt
```

Create a `.env` file in the project root containing:

```dotenv
GEMINI_API_KEY=YOUR_API_KEY
GEMINI_MODEL=YOUR_AVAILABLE_GEMINI_MODEL
```

Place the generated SQLite database at `data/network.db` and ensure required data exports are available. Start the backend:

```powershell
python -m uvicorn backend.main:app --reload --reload-dir backend
```

### Frontend

In a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173/` in a browser. The backend API documentation is at `http://127.0.0.1:8000/docs`.
