# Pagsanjan Solo Parent Information System - Backend

A Laravel-based backend API for the Pagsanjan Solo Parent Information System (RA 11861 Compliance).

## Features

- **Applicant Management**: Create, read, update, delete applicant records
- **Application Workflow**: Track application status (Pending, Approved, Disapproved)
- **Solo Parent Categories**: Support for all 12 solo parent categories (A1-F)
- **Family Composition Tracking**: Record family members and dependents
- **Emergency Contacts**: Store emergency contact information
- **Audit Logging**: Track all status changes with user and timestamp
- **Analytics**: Demographic and application statistics
- **API Authentication**: Laravel Sanctum for secure API access

## Prerequisites

- PHP 8.2 or higher
- MySQL 8.0 or higher
- Composer
- Node.js (for frontend development)

## Installation

### 1. Clone or Extract the Project

```bash
cd d:\solo_parent\pagsanjan-backend
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Create Database

Ensure MySQL is running, then create the database:

```bash
php artisan migrate:fresh --seed
```

This will:
- Create all necessary tables
- Seed categories and benefit qualifications
- Create a sample admin user (username: `admin`, password: `password`)
- Generate 20 sample applicants with applications

### 5. Start the Development Server

```bash
php artisan serve
```

The API will be available at: **http://localhost:8000**

## Environment Configuration

Update `.env` file for your environment:

```env
DB_DATABASE=pagsanjan_solo_parent
DB_USERNAME=root
DB_PASSWORD=your_password
API_CORS_ALLOW_ORIGIN=http://localhost:5173
```

## API Endpoints

### Public Routes

- `POST /api/applications` - Create a new application (public)

### Protected Routes (Authentication Required)

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (total, pending, approved, disapproved)
- `GET /api/dashboard/trends` - Get monthly application trends
- `GET /api/dashboard/categories` - Get distribution by solo parent category

#### Applications
- `GET /api/applications` - List all applications (with pagination and filtering)
- `POST /api/applications` - Create new application
- `GET /api/applications/{id}` - Get application details
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application
- `POST /api/applications/{id}/approve` - Approve an application
- `POST /api/applications/{id}/disapprove` - Disapprove an application

#### Analytics
- `GET /api/analytics/demographics` - Get demographic statistics
- `GET /api/analytics/application-stats` - Get application statistics

## Database Schema

### Tables
- `users` - Admin staff accounts
- `applicants` - Applicant information
- `applications` - Application records
- `family_members` - Family composition
- `emergency_contacts` - Emergency contact information
- `solo_parent_categories` - Solo parent categories (A1-F)
- `benefit_qualifications` - Benefit qualification levels
- `application_status_logs` - Audit trail of status changes

## Sample Admin Credentials

- **Username**: admin
- **Password**: password
- **Email**: admin@pagsanjan.local

## Testing

Run migrations with fresh seeding:

```bash
php artisan migrate:fresh --seed
```

Tinker Shell (interactive PHP):

```bash
php artisan tinker
```

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Frontend development server)
- `localhost:3000` (Alternative frontend port)

Update `SANCTUM_STATEFUL_DOMAINS` in `.env` to add more allowed origins.

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check `.env` database credentials
- Verify `DB_HOST` and `DB_PORT`

### Permission Denied Errors
- Ensure `storage/` and `bootstrap/cache/` directories are writable
- Run: `chmod -R 777 storage bootstrap/cache` (Linux/Mac)

### Migration Errors
- Run: `php artisan migrate:refresh --seed`
- Check for foreign key constraint issues

## Frontend Integration

The frontend (Vite + React) connects to this API at `http://localhost:8000/api/`.

Ensure CORS is properly configured in `.env`.

## License

© 2024 Pagsanjan MSWDO
