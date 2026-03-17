<?php

namespace App\Http\Controllers;

use App\Exports\SoloParentMonthlyReportExport;
use App\Models\Applicant;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function generateMonthlyReport(Request $request)
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);
        $selectedBarangay = $request->input('barangay');

        $query = Applicant::whereHas('application', function($q) {
                $q->where('status', 'Approved');
            });

        if ($selectedBarangay) {
            $query->where('barangay', $selectedBarangay);
        }

        $barangays = $query->select('barangay')
            ->distinct()
            ->orderBy('barangay')
            ->pluck('barangay')
            ->toArray();

        if (empty($barangays)) {
            // If filtering by barangay and no data found, still export that barangay sheet (empty) or show error
            // For now, let's keep 'No Data' behavior if result is truly empty
            if ($selectedBarangay) {
                $barangays = [$selectedBarangay];
            } else {
                $barangays = ['No Data'];
            }
        }

        $filename = "solo_parent_report_{$year}_{$month}.xlsx";

        return Excel::download(new SoloParentMonthlyReportExport($year, $month, $barangays), $filename);
    }
}
