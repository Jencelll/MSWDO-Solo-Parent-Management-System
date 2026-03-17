<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function demographics()
    {
        $data = [
            'by_barangay' => DB::table('applicants')
                ->join('applications', 'applicants.id', '=', 'applications.applicant_id')
                ->where('applications.status', 'Approved')
                ->select('applicants.barangay', DB::raw('COUNT(*) as count'))
                ->groupBy('applicants.barangay')
                ->get(),
            'by_sex' => DB::table('applicants')
                ->join('applications', 'applicants.id', '=', 'applications.applicant_id')
                ->where('applications.status', 'Approved')
                ->select('applicants.sex', DB::raw('COUNT(*) as count'))
                ->groupBy('applicants.sex')
                ->get(),
            'by_employment' => DB::table('applicants')
                ->join('applications', 'applicants.id', '=', 'applications.applicant_id')
                ->where('applications.status', 'Approved')
                ->select('applicants.employment_status', DB::raw('COUNT(*) as count'))
                ->whereNotNull('applicants.employment_status')
                ->groupBy('applicants.employment_status')
                ->get(),
            'income_distribution' => DB::table('applicants')
                ->join('applications', 'applicants.id', '=', 'applications.applicant_id')
                ->where('applications.status', 'Approved')
                ->selectRaw('CASE
                    WHEN applicants.monthly_income < 5000 THEN "Below 5k"
                    WHEN applicants.monthly_income < 10000 THEN "5k-10k"
                    WHEN applicants.monthly_income < 15000 THEN "10k-15k"
                    ELSE "15k+"
                END as income_range, COUNT(*) as count')
                ->whereNotNull('applicants.monthly_income')
                ->groupBy(DB::raw('CASE
                    WHEN applicants.monthly_income < 5000 THEN "Below 5k"
                    WHEN applicants.monthly_income < 10000 THEN "5k-10k"
                    WHEN applicants.monthly_income < 15000 THEN "10k-15k"
                    ELSE "15k+"
                END'))
                ->get(),
            'age_groups' => DB::table('applicants')
                ->join('applications', 'applicants.id', '=', 'applications.applicant_id')
                ->where('applications.status', 'Approved')
                ->selectRaw('CASE
                    WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) BETWEEN 18 AND 25 THEN "18-25"
                    WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) BETWEEN 26 AND 35 THEN "26-35"
                    WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) BETWEEN 36 AND 45 THEN "36-45"
                    WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) BETWEEN 46 AND 55 THEN "46-55"
                    ELSE "56+"
                END as age_group, COUNT(*) as count')
                ->whereNotNull('applicants.dob')
                ->groupBy(DB::raw('age_group'))
                ->get(),
            'age_by_barangay' => DB::table('applicants')
                ->join('applications', 'applicants.id', '=', 'applications.applicant_id')
                ->where('applications.status', 'Approved')
                ->selectRaw('applicants.barangay, 
                    SUM(CASE WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) BETWEEN 18 AND 25 THEN 1 ELSE 0 END) as "18-25",
                    SUM(CASE WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) BETWEEN 26 AND 35 THEN 1 ELSE 0 END) as "26-35",
                    SUM(CASE WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) BETWEEN 36 AND 45 THEN 1 ELSE 0 END) as "36-45",
                    SUM(CASE WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) BETWEEN 46 AND 55 THEN 1 ELSE 0 END) as "46-55",
                    SUM(CASE WHEN TIMESTAMPDIFF(YEAR, applicants.dob, CURDATE()) >= 56 THEN 1 ELSE 0 END) as "56+"')
                ->groupBy('applicants.barangay')
                ->get(),
        ];

        return response()->json($data);
    }

    public function applicationStats()
    {
        $stats = [
            'by_status' => DB::table('applications')
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get(),
            'by_category' => DB::table('applications')
                ->select('category_code', DB::raw('COUNT(*) as count'))
                ->whereNotNull('category_code')
                ->groupBy('category_code')
                ->get(),
            'monthly_trend' => DB::table('applications')
                ->selectRaw('DATE_FORMAT(date_applied, "%Y-%m") as month, COUNT(*) as count')
                ->groupBy(DB::raw('DATE_FORMAT(date_applied, "%Y-%m")'))
                ->orderBy('month')
                ->get(),
        ];

        return response()->json($stats);
    }
}
