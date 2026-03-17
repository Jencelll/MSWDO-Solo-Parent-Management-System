<?php
/**
 * Direct Database Setup for Pagsanjan Solo Parent System
 * Run this to create all tables without Laravel migrations
 */

$servername = "127.0.0.1";
$username = "root";
$password = "";
$database = "pagsanjan_solo_parent";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h2>Setting up Pagsanjan Database...</h2>";

// SQL statements to create tables
$sql_statements = [
    // Users table
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
    )",
    
    // Applicants table
    "CREATE TABLE IF NOT EXISTS applicants (
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
    )",
    
    // Solo parent categories
    "CREATE TABLE IF NOT EXISTS solo_parent_categories (
        code VARCHAR(5) PRIMARY KEY,
        description TEXT NOT NULL
    )",
    
    // Benefit qualifications
    "CREATE TABLE IF NOT EXISTS benefit_qualifications (
        code CHAR(1) PRIMARY KEY,
        description TEXT NOT NULL
    )",
    
    // Applications table
    "CREATE TABLE IF NOT EXISTS applications (
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
        FOREIGN KEY (category_code) REFERENCES solo_parent_categories(code),
        FOREIGN KEY (benefit_code) REFERENCES benefit_qualifications(code),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )",
    
    // Family members table
    "CREATE TABLE IF NOT EXISTS family_members (
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
    )",
    
    // Emergency contacts table
    "CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        applicant_id INT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        relationship VARCHAR(50) NOT NULL,
        address TEXT,
        contact_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
    )",
    
    // Application status logs
    "CREATE TABLE IF NOT EXISTS application_status_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        status_from VARCHAR(20),
        status_to VARCHAR(20),
        changed_by INT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
    )"
];

// Create tables
foreach ($sql_statements as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "✓ Table created successfully<br>";
    } else {
        echo "✗ Error: " . $conn->error . "<br>";
    }
}

echo "<h2>Inserting Initial Data...</h2>";

// Insert categories
$categories = [
    ['a1', 'Birth of a Child as a consequence of rape'],
    ['a2', 'Widow/widower'],
    ['a3', 'Spouse of person deprived of liberty (PDL)'],
    ['a4', 'Spouse of person with disability (PWD)'],
    ['a5', 'Due to de facto separation'],
    ['a6', 'Due to nullity of marriage'],
    ['a7', 'Abandoned'],
    ['b', 'Spouse of the OFW / Relative of the OFW'],
    ['c', 'Unmarried mother/father who keeps and rears his/her child'],
    ['d', 'Legal guardian, adoptive or foster parent'],
    ['e', 'Any relative within the fourth (4th) degree of consanguinity or affinity'],
    ['f', 'Pregnant woman who provides sole parental care and support'],
];

foreach ($categories as $cat) {
    $sql = "INSERT IGNORE INTO solo_parent_categories (code, description) VALUES ('" . $cat[0] . "', '" . addslashes($cat[1]) . "')";
    $conn->query($sql);
}
echo "✓ Categories inserted<br>";

// Insert benefits
$benefits = [
    ['A', 'Subsidy, PhilHealth, Prioritization in housing'],
    ['B', '10% Discount and VAT Exemption on selected items'],
];

foreach ($benefits as $ben) {
    $sql = "INSERT IGNORE INTO benefit_qualifications (code, description) VALUES ('" . $ben[0] . "', '" . addslashes($ben[1]) . "')";
    $conn->query($sql);
}
echo "✓ Benefits inserted<br>";

// Insert admin user
$hashed_password = password_hash('password', PASSWORD_BCRYPT);
$sql = "INSERT IGNORE INTO users (username, email, password, full_name, role) VALUES ('admin', 'admin@pagsanjan.local', '$hashed_password', 'Administrator', 'admin')";
$conn->query($sql);
echo "✓ Admin user created (username: admin, password: password)<br>";

// Insert sample applicants
echo "<p>Creating 20 sample applicants...</p>";
for ($i = 1; $i <= 20; $i++) {
    $barangays = ['Pagsanjan', 'Buboy', 'Hinulugang Taktak'];
    $status = ['Pending', 'Approved', 'Disapproved'][$i % 3];
    $category = $i % 2 == 0 ? 'a2' : 'c';
    $benefit = $i % 2 == 0 ? 'A' : 'B';
    
    $sql = "INSERT INTO applicants (first_name, middle_name, last_name, dob, sex, place_of_birth, address, barangay, educational_attainment, occupation, employment_status, monthly_income, contact_number, is_pantawid_beneficiary)
            VALUES ('Applicant$i', 'M', 'Test', '1990-05-15', '" . ($i % 2 == 0 ? 'Female' : 'Male') . "', 'Pagsanjan, Laguna', '$i Sample Street', '" . $barangays[$i % 3] . "', 'High School', 'Housewife', 'Self-employed', " . (5000 + $i * 500) . ", '09" . str_pad($i, 9, '0', STR_PAD_LEFT) . "', " . ($i % 3 == 0 ? 1 : 0) . ")";
    
    if ($conn->query($sql) === TRUE) {
        $applicant_id = $conn->insert_id;
        
        // Create application
        $case_num = 'PSG-' . date('Y') . '-' . str_pad($i, 5, '0', STR_PAD_LEFT);
        $sql2 = "INSERT INTO applications (applicant_id, case_number, status, category_code, benefit_code, date_applied, date_issued, created_by)
                VALUES ($applicant_id, '$case_num', '$status', '$category', '$benefit', DATE_SUB(NOW(), INTERVAL " . rand(1, 90) . " DAY), " . ($status == 'Approved' ? 'NOW()' : 'NULL') . ", 1)";
        $conn->query($sql2);
        
        // Add family members
        for ($j = 0; $j < rand(1, 3); $j++) {
            $sql3 = "INSERT INTO family_members (applicant_id, full_name, relationship, age, civil_status) 
                    VALUES ($applicant_id, 'Child" . ($j + 1) . "', 'Child', " . rand(5, 18) . ", 'Single')";
            $conn->query($sql3);
        }
        
        // Add emergency contact
        $sql4 = "INSERT INTO emergency_contacts (applicant_id, full_name, relationship, address, contact_number)
                VALUES ($applicant_id, 'Emergency Contact', 'Relative', '1 Emergency Street', '09" . str_pad($i + 1, 9, '0', STR_PAD_LEFT) . "')";
        $conn->query($sql4);
    }
}
echo "✓ Sample data created<br>";

$conn->close();

echo "<h2 style='color: green;'>✓ Database Setup Complete!</h2>";
echo "<p>You can now:</p>";
echo "<ul>";
echo "<li>Start the backend: <code>php artisan serve</code></li>";
echo "<li>Open frontend: <code>http://localhost:5173</code></li>";
echo "<li>View database: <a href='http://localhost/db-manager.php' target='_blank'>Database Manager</a></li>";
echo "</ul>";
echo "<p><a href='http://localhost/db-manager.php'>← Back to Database Manager</a></p>";
?>
