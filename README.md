# CV-Reviewer

Frontend: React (Vite) + SCSS · Backend: Node.js + Express (REST API) · Docker Compose

## Uruchomienie

Do uruchomienia wymagany Docker Desktop (Compose 2.22+).

```powershell
copy backend\.env.example backend\.env
```

W pliku `backend\.env` należy podać klucz do Groq API (https://console.groq.com/keys).

```powershell
docker compose up --build --watch
```

- Frontend: http://localhost:5173
- API: http://localhost:3001/api/health

Zatrzymanie: `docker compose down`.
