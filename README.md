# READEX

## Project structure

```text
READEX/
├── backend/
│   ├── backend/
│   ├── books/
│   ├── .venv/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── ...
├── frontend/
├── scripts/
│   ├── createVenv.ps1
│   ├── run_app.ps1
│   └── migrations.ps1
├── .gitignore
├── README.md
├── TODO.md
└── .env.example
```

## Backend setup (PowerShell)

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\createVenv.ps1
.\scripts\migrations.ps1
.\scripts\run_app.ps1
```

Backend URL: `http://127.0.0.1:8000/`

Database URL in backend/.env:

DATABASE_URL=postgresql://postgres:project123@localhost:5432/OnlineBookStore

## Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

