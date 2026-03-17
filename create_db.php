<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";

try {
  $conn = new PDO("mysql:host=$servername", $username, $password);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $sql = "CREATE DATABASE IF NOT EXISTS pagsanjan_solo_parent";
  $conn->exec($sql);
  echo "Database created successfully\n";
} catch(PDOException $e) {
  echo "Error creating database: " . $e->getMessage() . "\n";
  exit(1);
}
?>