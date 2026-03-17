<!DOCTYPE html>
<html>
<head>
    <title>Pagsanjan Solo Parent System API</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 50px;
            background: #f0f0f0;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 600px;
        }
        h1 { color: #333; }
        p { color: #666; }
        .status { 
            background: #d4edda; 
            padding: 10px; 
            border-radius: 4px; 
            margin: 10px 0;
            border: 1px solid #c3e6cb;
        }
        code { 
            background: #f4f4f4; 
            padding: 2px 6px; 
            border-radius: 3px;
            font-family: monospace;
        }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏛️ Pagsanjan Solo Parent Information System</h1>
        <h2>Backend API Server</h2>
        
        <div class="status">
            ✅ <strong>Server is running!</strong>
        </div>
        
        <h3>API Documentation</h3>
        <p>This is a Laravel REST API backend for the Pagsanjan Solo Parent Information System.</p>
        
        <h3>Available Endpoints</h3>
        <ul>
            <li><code>GET /api/dashboard/stats</code> - Dashboard statistics</li>
            <li><code>GET /api/applications</code> - List all applications</li>
            <li><code>POST /api/applications</code> - Create new application</li>
            <li><code>GET /api/analytics/demographics</code> - Demographic data</li>
        </ul>
        
        <h3>Frontend</h3>
        <p>Frontend is running at: <a href="http://localhost:3002" target="_blank">http://localhost:3002</a></p>
        
        <h3>Database</h3>
        <p>Database manager: <a href="http://localhost/phpmyadmin/" target="_blank">phpMyAdmin</a></p>
        
        <hr>
        
        <p style="color: #999; font-size: 12px;">
            Pagsanjan Solo Parent Information System | RA 11861 Compliance
        </p>
    </div>
</body>
</html>
