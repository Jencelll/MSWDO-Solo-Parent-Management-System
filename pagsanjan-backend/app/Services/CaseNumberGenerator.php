<?php

namespace App\Services;

use App\Models\Application;

class CaseNumberGenerator
{
    public static function generate(): string
    {
        $year = date('Y');
        // Get the latest case number including soft deleted records to avoid collisions
        $lastApp = Application::withTrashed()
            ->where('case_number', 'LIKE', "PSG-$year-%")
            ->orderBy('case_number', 'desc')
            ->first();

        if ($lastApp) {
            $parts = explode('-', $lastApp->case_number);
            $sequence = intval(end($parts));
            $next = $sequence + 1;
        } else {
            $next = 1;
        }

        return 'PSG-' . $year . '-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }
}
