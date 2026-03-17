# Backend Setup & Deployment Guide

## What's Been Built

I've created a complete Laravel 11 backend for the Pagsanjan Solo Parent Information System with:

### ✅ Project Structure
```
pagsanjan-backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── ApplicationController.php     (CRUD for applications)
│   │   ├── DashboardController.php       (Dashboard stats & analytics)
│   │   └── AnalyticsController.php       (Demographics & trends)
│   ├── Models/
│   │   ├── Applicant.php
│   │   ├── Application.php
│   │   ├── FamilyMember.php
│   │   ├── EmergencyContact.php
│   │   ├── ApplicationStatusLog.php
│   │   ├── SoloParentCategory.php
│   │   ├── BenefitQualification.php
│   │   └── User.php
│   └── Services/
│       └── CaseNumberGenerator.php
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_create_applicants_table.php
│   │   ├── 2024_01_01_000003_create_applications_table.php
│   │   ├── 2024_01_01_000004_create_family_members_table.php
│   │   ├── 2024_01_01_000005_create_emergency_contacts_table.php
│   │   └── 2024_01_01_000006_create_application_status_logs_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── routes/
│   ├── api.php                           (All API endpoints)
│   └── console.php
├── config/
│   └── database.php                      (Database configuration)
├── bootstrap/
│   └── app.php                           (Laravel app bootstrap)
├── .env                                  (Environment config)
├── composer.json                         (PHP dependencies)
├── README.md                             (Backend documentation)
└── artisan                               (Laravel CLI)
```

### ✅ Installed Dependencies (91 packages)
- **Laravel 11.48.0** - Core framework
- **Laravel Sanctum 4.3.0** - API authentication
- **Laravel Tinker** - Interactive shell
- **PHPUnit 10** - Testing framework
- All required support libraries (Guzzle, Carbon, Doctrine, etc.)

### ✅ Database Schema (6 tables)
- `users` - Admin accounts
- `applicants` - Applicant information
- `applications` - Application records
- `family_members` - Family composition
- `emergency_contacts` - Emergency contacts
- `application_status_logs` - Audit trail

### ✅ API Endpoints Created

**Dashboard**
```
GET  /api/dashboard/stats       - KPI statistics
GET  /api/dashboard/trends      - Monthly trends
GET  /api/dashboard/categories  - Category distribution
```

**Applications (CRUD)**
```
GET    /api/applications          - List all applications (paginated)
POST   /api/applications          - Create new application
GET    /api/applications/{id}     - Get application details
PUT    /api/applications/{id}     - Update application
DELETE /api/applications/{id}     - Delete application
POST   /api/applications/{id}/approve     - Approve application
POST   /api/applications/{id}/disapprove  - Disapprove application
```

**Analytics**
```
GET  /api/analytics/demographics        - Demographics by barangay, sex, employment
GET  /api/analytics/application-stats   - Statistics by status, category, trends
```

### ✅ Authentication
- Laravel Sanctum for secure token-based API authentication
- User roles: admin, staff
- Sample admin account (username: `admin`, password: `password`)

---

## Prerequisites

Before running the backend, ensure you have:

1. **PHP 8.2+** - Already installed ✅
2. **MySQL 8.0+** - Download and install
3. **Composer** - Already installed locally ✅

---

## Installation & Setup Steps

### Step 1: Install MySQL Server

**Windows:**
- Download from: https://dev.mysql.com/downloads/mysql/
- Run installer
- Set root password during setup
- Choose "MySQL Server" component

**Alternative (if no MySQL installed):**
- Download XAMPP or WAMP (includes MySQL + PHP)
- Or use Windows Subsystem for Linux (WSL) + MySQL

### Step 2: Create Database

Open MySQL Command Line or MySQL Workbench and run:

```sql
CREATE DATABASE pagsanjan_solo_parent;
```

### Step 3: Configure Environment

Edit `.env` file in `pagsanjan-backend/` directory:

```env
APP_NAME="Pagsanjan Solo Parent System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pagsanjan_solo_parent
DB_USERNAME=root
DB_PASSWORD=your_mysql_password    # ← Set your MySQL root password here

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:5173
API_CORS_ALLOW_ORIGIN=http://localhost:5173
```

### Step 4: Generate App Key

```bash
cd d:\solo_parent\pagsanjan-backend
php artisan key:generate
```

### Step 5: Run Migrations & Seed Data

```bash
php artisan migrate:fresh --seed
```

This will:
- Create all database tables
- Seed 12 solo parent categories
- Seed 2 benefit qualifications
- Create admin user account
- Generate 20 sample applicants with applications

**Expected Output:**
```
Migrating: 2024_01_01_000001_create_users_table
Migrated:  2024_01_01_000001_create_users_table (XXms)
Migrating: 2024_01_01_000002_create_applicants_table
Migrated:  2024_01_01_000002_create_applicants_table (XXms)
...
[Database seeded successfully]
```

### Step 6: Start the Development Server

```bash
php artisan serve
```

**Expected Output:**
```
INFO  Server running on [http://127.0.0.1:8000].

Press Ctrl+C to quit.
```

The backend is now available at: **http://localhost:8000**

---

## Running Both Frontend & Backend

### Terminal 1 - Backend (PHP):
```bash
cd d:\solo_parent\pagsanjan-backend
php artisan serve
```
Output: `http://localhost:8000`

### Terminal 2 - Frontend (Node.js):
```bash
cd d:\solo_parent\pagsanjan-solo-parent-information-system
npm run dev
```
Output: `http://localhost:5173`

### Terminal 3 - MySQL (if needed):
```bash
mysql -u root -p pagsanjan_solo_parent
```

---

## Testing the API

### 1. Health Check
```bash
curl http://localhost:8000/up
```
Expected: `OK`

### 2. Create Application (Public)
```bash
curl -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "dob": "1990-05-15",
    "sex": "Male",
    "address": "123 Main St",
    "barangay": "Pagsanjan"
  }'
```

### 3. Laravel Tinker (Interactive Shell)
```bash
php artisan tinker

# List all applications
>>> App\Models\Application::all();

# Create test application
>>> App\Models\Applicant::factory()->create();
```

---

## Quick Artisan Commands

```bash
# Database
php artisan migrate              # Run migrations
php artisan migrate:refresh      # Rollback & re-run migrations
php artisan migrate:reset        # Rollback all migrations
php artisan migrate:refresh --seed # Refresh + seed data

# Models & Code Generation
php artisan make:model ModelName
php artisan make:controller ControllerName
php artisan make:migration CreateTableName

# Utilities
php artisan tinker               # Interactive PHP shell
php artisan list                 # List all available commands
php artisan serve --port=8000    # Start server on specific port
```

---

## Environment Variables Reference

```env
# Application
APP_NAME                     # Application name
APP_ENV                      # Environment (local, production)
APP_DEBUG                    # Debug mode (true/false)
APP_URL                      # Application URL
APP_KEY                      # Encryption key (generated via artisan key:generate)

# Database
DB_CONNECTION                # mysql, pgsql, sqlite, sqlsrv
DB_HOST                      # Database host (127.0.0.1 for localhost)
DB_PORT                      # Database port (3306 for MySQL)
DB_DATABASE                  # Database name
DB_USERNAME                  # Database user (root for local development)
DB_PASSWORD                  # Database password

# API
SANCTUM_STATEFUL_DOMAINS     # Allowed frontend domains
API_CORS_ALLOW_ORIGIN        # CORS allowed origin
```

---

## Troubleshooting

### MySQL Connection Error
```
SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost'
```
**Solution:** Check `DB_PASSWORD` in `.env` matches your MySQL root password

### Port Already in Use
```
The port 8000 is already in use.
```
**Solution:** 
```bash
php artisan serve --port=8001  # Use different port
```

### Tables Don't Exist
```
SQLSTATE[42S02]: Table 'pagsanjan_solo_parent.applications' doesn't exist
```
**Solution:**
```bash
php artisan migrate:refresh --seed
```

### Composer Package Conflicts
```
Your requirements could not be resolved to an installable set of packages.
```
**Solution:**
```bash
composer install --no-cache
# Or regenerate lock file
rm composer.lock
php ./composer.phar install
```

---

## Frontend Integration

The React frontend at `http://localhost:5173` is configured to call the Laravel API at `http://localhost:8000/api/`.

**Ensure:**
1. Backend is running on `http://localhost:8000`
2. `.env` includes `SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173`
3. Frontend makes requests to `/api/` endpoints

---

## Production Deployment

When deploying to production:

1. Set `APP_ENV=production`
2. Set `APP_DEBUG=false`
3. Use strong `APP_KEY`
4. Configure environment variables on server
5. Run `php artisan migrate --force`
6. Use PHP-FPM + Nginx or Apache2
7. Enable HTTPS/SSL
8. Configure proper database backups

---

## Support & Documentation

- **Laravel Docs:** https://laravel.com/docs/11.x
- **Laravel Sanctum:** https://laravel.com/docs/11.x/sanctum
- **Eloquent ORM:** https://laravel.com/docs/11.x/eloquent

---

**Backend Build Date:** 2026-02-02  
**PHP Version:** 8.3.26  
**Laravel Version:** 11.48.0  
**Status:** ✅ Ready for Database Setup & Deployment
