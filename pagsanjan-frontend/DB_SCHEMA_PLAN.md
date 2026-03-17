# Database Schema Plan

Based on the synthetic data removed from the UI, the following database schema is required to support the application's functionality.

## 1. Applicants Table
Stores the personal information of the solo parent applicant.

| Column Name | Type | Description |
|---|---|---|
| `id` | INT (PK) | Unique identifier |
| `first_name` | VARCHAR | First name |
| `middle_name` | VARCHAR | Middle name |
| `last_name` | VARCHAR | Last name |
| `dob` | DATE | Date of Birth |
| `sex` | ENUM | Male, Female, Other |
| `place_of_birth` | VARCHAR | Place of birth |
| `address` | TEXT | Full street address |
| `barangay` | VARCHAR | Barangay (from lookup) |
| `educational_attainment` | VARCHAR | Highest education |
| `occupation` | VARCHAR | Current occupation |
| `employment_status` | ENUM | Employed, Self-employed, Not employed |
| `monthly_income` | DECIMAL | Monthly income amount |
| `is_pantawid` | BOOLEAN | 4Ps Beneficiary status |
| `contact_number` | VARCHAR | Phone number |

## 2. Applications Table
Tracks the status of the solo parent ID application.

| Column Name | Type | Description |
|---|---|---|
| `id` | INT (PK) | Unique identifier |
| `applicant_id` | INT (FK) | Link to Applicants table |
| `case_number` | VARCHAR | Unique case number (e.g., PSG-2024-001) |
| `status` | ENUM | Pending, Approved, Disapproved |
| `category_code` | VARCHAR | Solo parent category code (e.g., A1, A2) |
| `benefit_code` | CHAR | Benefit qualification code |
| `date_applied` | DATE | Date of submission |
| `date_issued` | DATE | Date of approval/issuance |
| `remarks` | TEXT | Admin remarks/notes |

## 3. Family Members Table
Stores the composition of the applicant's family.

| Column Name | Type | Description |
|---|---|---|
| `id` | INT (PK) | Unique identifier |
| `applicant_id` | INT (FK) | Link to Applicants table |
| `full_name` | VARCHAR | Name of family member |
| `relationship` | VARCHAR | Relationship to applicant |
| `dob` | DATE | Date of Birth |
| `age` | INT | Age |
| `civil_status` | VARCHAR | Civil Status |
| `educational_attainment` | VARCHAR | Education |
| `occupation` | VARCHAR | Occupation |
| `monthly_income` | DECIMAL | Income |

## 4. Emergency Contacts Table
Stores emergency contact information.

| Column Name | Type | Description |
|---|---|---|
| `id` | INT (PK) | Unique identifier |
| `applicant_id` | INT (FK) | Link to Applicants table |
| `full_name` | VARCHAR | Contact person name |
| `relationship` | VARCHAR | Relationship |
| `contact_number` | VARCHAR | Phone number |
| `address` | TEXT | Address |

## Required API Endpoints
To replace the mock data, the following API endpoints will be needed:

- `GET /api/dashboard/stats` - Returns KPI stats (Total, Pending, Approved, Disapproved).
- `GET /api/dashboard/trends` - Returns application counts by month.
- `GET /api/dashboard/categories` - Returns distribution of solo parent categories.
- `GET /api/applications` - Returns list of applications with filtering/search.
- `GET /api/analytics/demographics` - Returns barangay, income, and gender distribution data.
