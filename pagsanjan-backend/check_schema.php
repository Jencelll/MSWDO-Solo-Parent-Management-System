<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Checking Database Schema...\n";

$tables = DB::select('SHOW TABLES');
$tableNames = array_map(function($t) {
    return array_values((array)$t)[0];
}, $tables);

echo "Tables found: " . implode(', ', $tableNames) . "\n\n";

// Tables to check in detail
$targetTables = ['application_status_logs', 'system_logs', 'users', 'soloparent_accounts', 'admin_staff'];

foreach ($targetTables as $table) {
    if (!in_array($table, $tableNames)) {
        if ($table !== 'users') { // users table is expected to be missing/renamed
            echo "WARNING: Table '$table' does not exist.\n";
        } else {
            echo "NOTE: Table 'users' does not exist (expected if renamed).\n";
        }
        continue;
    }

    echo "Schema for '$table':\n";
    $columns = Schema::getColumnListing($table);
    echo "  Columns: " . implode(', ', $columns) . "\n";

    // Get Foreign Keys
    // This query is specific to MySQL/MariaDB
    $fks = DB::select("
        SELECT 
            CONSTRAINT_NAME, 
            COLUMN_NAME, 
            REFERENCED_TABLE_NAME, 
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE 
            TABLE_SCHEMA = ? 
            AND TABLE_NAME = ? 
            AND REFERENCED_TABLE_NAME IS NOT NULL
    ", [env('DB_DATABASE'), $table]);

    if (empty($fks)) {
        echo "  Foreign Keys: None\n";
    } else {
        echo "  Foreign Keys:\n";
        foreach ($fks as $fk) {
            echo "    - {$fk->COLUMN_NAME} -> {$fk->REFERENCED_TABLE_NAME}.{$fk->REFERENCED_COLUMN_NAME} ({$fk->CONSTRAINT_NAME})\n";
        }
    }
    echo "\n";
}

echo "Done.\n";
