<?php

function testLogin($url, $username, $password) {
    $data = json_encode(['username' => $username, 'password' => $password]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Testing $username @ $url\n";
    echo "HTTP Code: $httpCode\n";
    echo "Response: $response\n\n";
}

testLogin('http://127.0.0.1:8001/api/admin/auth/login', 'testadmin', 'password123');
testLogin('http://127.0.0.1:8001/api/auth/login', 'testuser', 'password123');
