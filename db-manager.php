<?php
/**
 * Simple Database Manager for Pagsanjan Solo Parent System
 * Access: http://localhost/db-manager.php
 */

$servername = "127.0.0.1";
$username = "root";
$password = "";  // Leave empty if no password
$database = "pagsanjan_solo_parent";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("<h2>Connection Error</h2><p>" . $conn->connect_error . "</p>");
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Pagsanjan Database Manager</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { background: white; padding: 20px; border-radius: 8px; max-width: 900px; }
        h1 { color: #333; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        input, button { padding: 8px; margin: 5px; }
        button { background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Pagsanjan Database Manager</h1>
        
        <?php
        // First, create database if it doesn't exist
        $create_sql = "CREATE DATABASE IF NOT EXISTS $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
        
        if ($conn->query($create_sql) === TRUE) {
            echo '<div class="status success">';
            echo "<strong>✓ Database ready: $database</strong>";
            echo '</div>';
        } else {
            echo '<div class="status error">';
            echo "<strong>✗ Error:</strong> " . $conn->error;
            echo '</div>';
        }
        
        // Now select the database
        $db_check = $conn->select_db($database);
        
        if ($db_check) {
            echo '<div class="status success">';
            echo "<strong>✓ Connected to database: $database</strong>";
            echo '</div>';
            
            // List tables
            $result = $conn->query("SHOW TABLES");
            
            if ($result->num_rows > 0) {
                echo '<h2>Tables (' . $result->num_rows . ')</h2>';
                echo '<table><tr><th>Table Name</th><th>Rows</th><th>Action</th></tr>';
                
                while ($row = $result->fetch_row()) {
                    $table = $row[0];
                    $count = $conn->query("SELECT COUNT(*) as cnt FROM $table")->fetch_assoc();
                    echo "<tr>";
                    echo "<td><strong>$table</strong></td>";
                    echo "<td>" . $count['cnt'] . "</td>";
                    echo "<td><a href='#' onclick=\"alert('View data for $table'); return false;\">View</a></td>";
                    echo "</tr>";
                }
                
                echo '</table>';
            } else {
                echo '<div class="status info">';
                echo "<strong>ℹ️ Database is empty</strong><br>";
                echo "Run migrations to create tables:<br>";
                echo "<code>php artisan migrate:fresh --seed</code>";
                echo '</div>';
            }
        }
        
        echo '<h2>Connection Info</h2>';
        echo '<table>';
        echo '<tr><td>Server:</td><td>' . $servername . '</td></tr>';
        echo '<tr><td>User:</td><td>' . $username . '</td></tr>';
        echo '<tr><td>Database:</td><td>' . $database . '</td></tr>';
        echo '<tr><td>Status:</td><td><span style="color: green;">✓ Connected</span></td></tr>';
        echo '</table>';
        
        $conn->close();
        ?>
        
        <hr>
        
        <h2>Quick Actions</h2>
        <p>
            <button onclick="alert('Run this in PowerShell:\ncd d:\\solo_parent\\pagsanjan-backend\nphp artisan migrate:fresh --seed')">
                Run Migrations & Seed Data
            </button>
            <button onclick="alert('Backend Server URL:\nhttp://localhost:8000\n\nFrontend URL:\nhttp://localhost:5173')">
                System URLs
            </button>
        </p>
        
        <hr>
        
        <h3>Next Steps</h3>
        <ol>
            <li>Database connected ✓</li>
            <li>Run migrations: <code>php artisan migrate:fresh --seed</code></li>
            <li>Start backend: <code>php artisan serve</code></li>
            <li>Open frontend: <code>http://localhost:5173</code></li>
        </ol>
    </div>
</body>
</html>
