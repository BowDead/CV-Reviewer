# CV-Reviewer

Frontend: React (Vite) + SCSS · Backend: Node.js + Express (REST API) · Docker Compose

## Uruchomienie

Do uruchomienia wymagany Docker Desktop (Compose 2.22+).

```powershell
copy backend\.env.example backend\.env
```

W pliku `backend\.env` należy podać klucz do Groq API (https://console.groq.com/keys) oraz dwa różne sekrety: `JWT_SECRET` i `MASTER_KEY`. Każdy z nich można wygenerować poleceniem:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

```powershell
docker compose up --build --watch
```

- Frontend: http://localhost:5173
- API: http://localhost:3001/api/health
- pgAdmin: http://localhost:5050 (login `admin@example.com` / `admin`, hasło do bazy `cvreviewer`)

Zatrzymanie: `docker compose down`. Usunięcie także danych z bazy: `docker compose down -v`.
