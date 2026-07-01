# JobFlow AI 🚀

**Personal AI-powered job search assistant** — Notion + Linear + Gmail + LinkedIn in one place.

Manage applications, recruiters, resumes, email templates, and campaigns with AI-generated emails, cover letters, and interview prep.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Java 21 + Spring Boot 3.2 + Spring Security (JWT) |
| Database | PostgreSQL 15 + Flyway migrations |
| AI | Google Gemini / OpenAI GPT-4 / Anthropic Claude |
| Frontend | React 18 + Tailwind CSS + Recharts |
| Scheduling | Spring `@Scheduled` for notifications |

---

## Features

- **Kanban Board** — Drag-and-drop across 8 status columns
- **Applications** — Full CRUD + status pipeline + resume match score
- **Companies & Recruiters** — CRM-style contact management with duplicate detection
- **Resumes** — Upload, set default, duplicate, download
- **Email Templates** — Rich text templates with categories + favorites
- **AI Assistant** — Cold emails, cover letters, follow-ups, interview prep, salary negotiation
- **Dashboard** — Stats, charts, upcoming interviews, follow-ups due
- **Dark/Light Mode** — Per-user theme preference
- **Notifications** — Scheduled reminders for interviews + follow-ups
- **Chrome Extension API** — `/api/import/job` endpoint ready

---

## Quick Start

### Prerequisites
- Java 21+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.9+

### 1. Database Setup

```sql
CREATE DATABASE jobflow_ai;
CREATE USER jobflow WITH PASSWORD 'jobflow123';
GRANT ALL PRIVILEGES ON DATABASE jobflow_ai TO jobflow;
```

### 2. Backend

```bash
cd backend

# Edit src/main/resources/application.properties:
# spring.datasource.username=jobflow
# spring.datasource.password=jobflow123
# app.ai.gemini.api-key=YOUR_GEMINI_KEY   ← get from makersuite.google.com

mvn spring-boot:run
```

Backend starts on `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui.html`

Default admin: `admin@jobflow.ai` / `Admin@123`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts on `http://localhost:3000`

---

## Project Structure

```
jobflow-ai/
├── backend/
│   └── src/main/java/com/jobflow/ai/
│       ├── controller/         # REST controllers
│       ├── service/            # Business logic
│       ├── repository/         # JPA repositories
│       ├── entity/             # JPA entities
│       ├── dto/                # Request/Response DTOs
│       ├── enums/              # ApplicationStatus, Priority, etc.
│       ├── security/           # JWT, UserDetails
│       ├── config/             # SecurityConfig, CORS
│       ├── scheduler/          # Notification scheduler
│       └── exception/          # GlobalExceptionHandler
│
└── frontend/
    └── src/
        ├── pages/              # All route pages
        ├── components/
        │   ├── common/         # Modal, Badge, Toast, etc.
        │   └── layout/         # Sidebar + Topbar
        ├── api/                # Axios client + API methods
        └── context/            # AuthContext (user, theme)
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/applications` | List applications (paginated) |
| GET | `/api/applications/kanban` | Kanban board data |
| PATCH | `/api/applications/{id}/status` | Update status (Kanban drop) |
| GET | `/api/companies` | List companies |
| GET | `/api/recruiters` | List recruiters |
| GET | `/api/recruiters/check-duplicate` | Check email duplicate |
| GET | `/api/resumes` | List resumes |
| POST | `/api/resumes` | Upload resume (multipart) |
| PATCH | `/api/resumes/{id}/set-default` | Set default resume |
| GET | `/api/templates` | List email templates |
| POST | `/api/templates/{id}/duplicate` | Duplicate template |
| PATCH | `/api/templates/{id}/favorite` | Toggle favorite |
| POST | `/api/ai/cold-email` | Generate cold email |
| POST | `/api/ai/cover-letter` | Generate cover letter |
| POST | `/api/ai/interview-questions` | Generate interview questions |
| POST | `/api/ai/salary-negotiation` | Generate salary negotiation email |
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings/profile` | Update profile |
| PUT | `/api/settings/ai` | Update AI provider + keys |
| POST | `/api/import/job` | Chrome Extension: import job |

---

## Environment Variables

```properties
# application.properties (backend)
spring.datasource.url=jdbc:postgresql://localhost:5432/jobflow_ai
spring.datasource.username=jobflow
spring.datasource.password=jobflow123

app.jwt.secret=change-this-to-a-long-random-secret-key-min-256-bits
app.jwt.expiration=86400000
app.jwt.refresh-expiration=2592000000

app.upload.dir=./uploads/resumes

app.ai.gemini.api-key=YOUR_KEY
app.ai.gemini.model=gemini-1.5-flash
app.ai.openai.model=gpt-4o-mini
app.ai.claude.model=claude-sonnet-4-6
```

---

## AI Configuration

1. Go to **Settings → AI Settings**
2. Choose provider: Gemini (free), OpenAI, or Claude
3. Enter your API key
4. Keys are stored per-user; multi-user supported

---

## Chrome Extension Integration

Send a POST to `/api/import/job` (with JWT header):

```json
{
  "jobTitle": "Senior Java Developer",
  "company": "HCLTech",
  "location": "Noida, India",
  "jobUrl": "https://...",
  "description": "Full JD text...",
  "source": "LINKEDIN"
}
```

The API auto-creates the company, extracts skills via AI, and returns the saved application.

---

## Roadmap

- [ ] Gmail OAuth2 integration (send/read emails)
- [ ] Email campaign bulk sender
- [ ] Chrome Extension (content script + popup)
- [ ] Analytics / funnel charts
- [ ] Resume builder / ATS optimizer
- [ ] Admin panel (user management)

---

Built with ❤️ for serious job hunters
