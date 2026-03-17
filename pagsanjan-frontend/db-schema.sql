
-- MSWDO Pagsanjan - Solo Parent System Schema
-- Created for RA 11861 Compliance

CREATE DATABASE IF NOT EXISTS mswdo_pagsanjan_solo_parent;
USE mswdo_pagsanjan_solo_parent;

-- User accounts for Admin staff
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'admin',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Main Applicant Information
CREATE TABLE applicants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    age INT,
    sex ENUM('Male', 'Female', 'Other') NOT NULL,
    place_of_birth VARCHAR(255),
    address TEXT NOT NULL,
    barangay VARCHAR(100) NOT NULL,
    educational_attainment VARCHAR(100),
    occupation VARCHAR(100),
    company_agency VARCHAR(100),
    employment_status ENUM('Employed', 'Self-employed', 'Not employed'),
    religion VARCHAR(50),
    monthly_income DECIMAL(10, 2),
    contact_number VARCHAR(20),
    email_address VARCHAR(100),
    is_pantawid_beneficiary BOOLEAN DEFAULT FALSE,
    is_indigenous_person BOOLEAN DEFAULT FALSE,
    is_lgbtq BOOLEAN DEFAULT FALSE,
    classification_details TEXT,
    needs_problems TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Family Composition (Module 1 - Section II)
CREATE TABLE family_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    dob DATE,
    age INT,
    civil_status VARCHAR(50),
    educational_attainment VARCHAR(100),
    occupation VARCHAR(100),
    monthly_income DECIMAL(10, 2),
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Emergency Contacts (Module 1 - Section V)
CREATE TABLE emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    address TEXT,
    contact_number VARCHAR(20),
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Solo Parent Categories (Module 2)
CREATE TABLE solo_parent_categories (
    code VARCHAR(5) PRIMARY KEY,
    description TEXT NOT NULL
);

-- Benefit Qualifications (Module 2)
CREATE TABLE benefit_qualifications (
    code CHAR(1) PRIMARY KEY,
    description TEXT NOT NULL
);

-- Applications tracking
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    case_number VARCHAR(50) UNIQUE,
    id_number VARCHAR(50) UNIQUE,
    status ENUM('Pending', 'Approved', 'Disapproved') DEFAULT 'Pending',
    category_code VARCHAR(5),
    benefit_code CHAR(1),
    date_applied DATE DEFAULT (CURRENT_DATE),
    date_issued DATE,
    remarks TEXT,
    created_by INT,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id),
    FOREIGN KEY (category_code) REFERENCES solo_parent_categories(code),
    FOREIGN KEY (benefit_code) REFERENCES benefit_qualifications(code),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Audit Logs
CREATE TABLE application_status_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    status_from VARCHAR(20),
    status_to VARCHAR(20),
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Initial Category Data
INSERT INTO solo_parent_categories (code, description) VALUES
('a1', 'Birth of a Child as a consequence of rape'),
('a2', 'Widow/widower'),
('a3', 'Spouse of person deprived of liberty (PDL)'),
('a4', 'Spouse of person with disability (PWD)'),
('a5', 'Due to de facto separation'),
('a6', 'Due to nullity of marriage'),
('a7', 'Abandoned'),
('b', 'Spouse of the OFW/ Relative of the OFW'),
('c', 'Unmarried mother/father who keeps and rears his/her child'),
('d', 'Legal guardian, adoptive or foster parent'),
('e', 'Any relative within the fourth (4th) degree of consanguinity or affinity'),
('f', 'Pregnant woman who provides sole parental care and support');

INSERT INTO benefit_qualifications (code, description) VALUES
('A', 'Subsidy, PhilHealth, Prioritization in housing'),
('B', '10% Discount and VAT Exemption on selected items');
