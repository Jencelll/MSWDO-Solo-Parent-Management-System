# How to Run the Pagsanjan Solo Parent Information System

This guide explains how to start both the backend (API) and frontend (User Interface) servers.

## Prerequisites
- **XAMPP** installed (with PHP at `c:\xampp\php\php.exe`)
- **Node.js** installed

## Quick Start (Windows)

1.  **Start Backend:**
    -   Double-click `start-backend.bat` in the root folder.
    -   This will open a terminal window running the Laravel API server (usually at `http://127.0.0.1:8000`).
    -   Keep this window open.

2.  **Start Frontend:**
    -   Double-click `start-frontend.bat` in the root folder.
    -   This will open a terminal window running the React Frontend server (usually at `http://localhost:5173` or similar).
    -   Keep this window open.

3.  **Access the System:**
    -   Open your browser and go to the URL shown in the Frontend terminal (e.g., `http://localhost:5173`).

## Manual Method (PowerShell)

If you prefer using the terminal manually:

### 1. Start Backend
Open a PowerShell window and run:
```powershell
cd e:\solo_parent\solo_parent\pagsanjan-backend
c:\xampp\php\php.exe artisan serve
```

### 2. Start Frontend
Open a **new** PowerShell window and run:
```powershell
cd e:\solo_parent\solo_parent\pagsanjan-frontend
npm.cmd run dev
```

## Troubleshooting
-   **Port in Use:** If a port (like 8000 or 5173) is busy, the servers will usually try the next available port (e.g., 8001, 5174). Check the terminal output for the correct URL.
-   **PHP Not Found:** Ensure XAMPP is installed at `c:\xampp` or update the scripts with the correct path to `php.exe`.
