<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    public function index()
    {
        // Ensure directory exists
        if (!Storage::exists('backups')) {
            Storage::makeDirectory('backups');
        }

        $files = Storage::files('backups');
        $backups = [];

        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                $size = Storage::size($file);
                $timestamp = Storage::lastModified($file);
                $backups[] = [
                    'filename' => basename($file),
                    'size' => $size,
                    'created_at' => date('Y-m-d H:i:s', $timestamp),
                    'timestamp' => $timestamp
                ];
            }
        }

        // Sort by timestamp descending
        usort($backups, function ($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        return response()->json([
            'latest_backup' => $backups[0] ?? null,
            'backups' => $backups
        ]);
    }

    public function create()
    {
        try {
            $databaseName = DB::connection()->getDatabaseName();
            $tables = DB::select('SHOW TABLES');
            $tables = array_map(function($table) use ($databaseName) {
                return $table->{'Tables_in_' . $databaseName};
            }, $tables);

            $output = "-- Database Backup: " . $databaseName . "\n";
            $output .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
            $output .= "-- --------------------------------------------------------\n\n";
            $output .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

            foreach ($tables as $table) {
                // Get Create Table statement
                $createTable = DB::select("SHOW CREATE TABLE `$table`");
                $createTableSql = $createTable[0]->{'Create Table'};

                $output .= "-- Table structure for table `$table`\n";
                $output .= "DROP TABLE IF EXISTS `$table`;\n";
                $output .= $createTableSql . ";\n\n";

                // Get Data
                $rows = DB::table($table)->get();
                if ($rows->count() > 0) {
                    $output .= "-- Dumping data for table `$table`\n";
                    $output .= "INSERT INTO `$table` VALUES \n";
                    
                    $valuesArr = [];
                    foreach ($rows as $row) {
                        $values = [];
                        foreach ((array)$row as $value) {
                            if (is_null($value)) {
                                $values[] = "NULL";
                            } else {
                                $values[] = "'" . addslashes($value) . "'";
                            }
                        }
                        $valuesArr[] = "(" . implode(', ', $values) . ")";
                    }
                    $output .= implode(",\n", $valuesArr) . ";\n\n";
                }
            }

            $output .= "SET FOREIGN_KEY_CHECKS=1;\n";

            $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
            Storage::put('backups/' . $filename, $output);

            $size = Storage::size('backups/' . $filename);
            $timestamp = Storage::lastModified('backups/' . $filename);

            return response()->json([
                'message' => 'Backup created successfully',
                'backup' => [
                    'filename' => $filename,
                    'size' => $size,
                    'created_at' => date('Y-m-d H:i:s', $timestamp),
                    'timestamp' => $timestamp
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Backup failed: " . $e->getMessage());
            return response()->json(['error' => 'Backup failed: ' . $e->getMessage()], 500);
        }
    }

    public function restore(Request $request)
    {
        try {
            if (!$request->hasFile('backup_file')) {
                return response()->json(['error' => 'No backup file provided'], 400);
            }

            $file = $request->file('backup_file');
            $extension = $file->getClientOriginalExtension();

            if ($extension !== 'sql') {
                return response()->json(['error' => 'Invalid file type. Only .sql files are allowed.'], 400);
            }

            $content = file_get_contents($file->getRealPath());

            // Disable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            
            // Execute statements
            // DB::unprepared executes raw SQL and supports multiple statements in some drivers
            // If it fails, we might need to split by ';'
            try {
                DB::unprepared($content);
            } catch (\Exception $e) {
                // Fallback: split by semicolon
                $statements = array_filter(array_map('trim', explode(';', $content)));
                foreach ($statements as $stmt) {
                    if (!empty($stmt)) {
                        DB::statement($stmt);
                    }
                }
            }
            
            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            return response()->json(['message' => 'Database restored successfully']);

        } catch (\Exception $e) {
            Log::error("Restore failed: " . $e->getMessage());
            return response()->json(['error' => 'Restore failed: ' . $e->getMessage()], 500);
        }
    }

    public function download($filename)
    {
        // Add .sql extension if missing to handle routing issues with dots
        if (!str_ends_with($filename, '.sql')) {
            $filename .= '.sql';
        }

        Log::info("Download requested for: " . $filename);
        if (Storage::exists('backups/' . $filename)) {
            Log::info("File found, downloading...");
            return Storage::download('backups/' . $filename);
        }
        Log::error("File not found: " . 'backups/' . $filename);
        return response()->json(['error' => 'File not found'], 404);
    }

    private function formatSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
