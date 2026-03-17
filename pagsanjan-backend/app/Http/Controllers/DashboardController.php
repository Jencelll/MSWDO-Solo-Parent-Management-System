<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $stats = [
                'total_applications' => Application::count(),
                'pending' => Application::where('status', 'Pending')->count(),
                'approved' => Application::where('status', 'Approved')->count(),
                'active' => Application::where('status', 'Approved')
                    ->whereDate('expiration_date', '>=', now()->toDateString())
                    ->count(),
                'disapproved' => Application::where('status', 'Disapproved')->count(),
                'male' => Application::join('applicants', 'applications.applicant_id', '=', 'applicants.id')
                    ->where('applications.status', 'Approved')
                    ->where('applicants.sex', 'Male')
                    ->count(),
                'female' => Application::join('applicants', 'applications.applicant_id', '=', 'applicants.id')
                    ->where('applications.status', 'Approved')
                    ->where('applicants.sex', 'Female')
                    ->count(),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function overview(Request $request)
    {
        try {
            $year = $request->query('year', now()->year);
            $barangay = $request->query('barangay');
            $userRole = $request->query('role');

            $baseQuery = Application::query();
            
            if ($barangay && $barangay !== 'All') {
                $baseQuery->whereHas('applicant', function($q) use ($barangay) {
                    $q->where('barangay', $barangay);
                });
            }

            // For stats that are year-specific (like registered this year)
            // But usually "Total Members" implies all-time active.
            // Let's assume dashboard filters affect the view.
            
            // Helper to apply filters
            // Note: Year filter is now ONLY applied to charts/trends.
            // KPI Stats are "Current Status" (All Time) but filtered by Barangay.
            
            $applyLocationFilter = function($query) use ($barangay) {
                if ($barangay && $barangay !== 'All') {
                    $query->whereHas('applicant', function($q) use ($barangay) {
                        $q->where('barangay', $barangay);
                    });
                }
                return $query;
            };

            // Stats - All Time (Current Status)
            $stats = [
                'total_applications' => $applyLocationFilter(Application::query())->count(),
                'pending' => $applyLocationFilter(Application::where('status', 'Pending'))->count(),
                'approved' => $applyLocationFilter(Application::where('status', 'Approved'))->count(),
                'active' => $applyLocationFilter(Application::where('status', 'Approved')
                    ->whereDate('expiration_date', '>=', now()->toDateString()))
                    ->count(),
                'disapproved' => $applyLocationFilter(Application::where('status', 'Disapproved'))->count(),
                'archived' => Application::onlyTrashed()->when($barangay && $barangay !== 'All', function($q) use ($barangay) {
                     $q->whereHas('applicant', function($sq) use ($barangay) {
                         $sq->where('barangay', $barangay);
                     });
                })->count(),
                'subsidy_qualified' => $applyLocationFilter(Application::where('status', 'Approved')
                    ->where('benefit_code', 'like', '%A%')) // Check if 'A' is present in the comma-separated string
                    ->count(),
                'pending_prints' => $applyLocationFilter(Application::where('status', 'Approved')
                    ->where(function($q) {
                        $q->where('is_printed', false)->orWhereNull('is_printed');
                    }))
                    ->count(),
                'for_renewal' => $applyLocationFilter(Application::where('status', 'Approved')
                    ->whereDate('expiration_date', '<=', now()->addDays(30)->toDateString()))
                    ->count(),
                'male' => $applyLocationFilter(Application::join('applicants', 'applications.applicant_id', '=', 'applicants.id')
                    ->where('applications.status', 'Approved')
                    ->where('applicants.sex', 'Male'))
                    ->count(),
                'female' => $applyLocationFilter(Application::join('applicants', 'applications.applicant_id', '=', 'applicants.id')
                    ->where('applications.status', 'Approved')
                    ->where('applicants.sex', 'Female'))
                    ->count(),
            ];

            // Trends - Last 6 months (affected by year filter if applicable, or just last 6 months of that year)
            // If specific year selected, show trends for that year
            $query = Application::selectRaw('DATE_FORMAT(date_applied, "%Y-%m") as month, COUNT(*) as count')
                ->whereYear('date_applied', $year);
            
            if ($barangay && $barangay !== 'All') {
                $query->whereHas('applicant', function($q) use ($barangay) {
                    $q->where('barangay', $barangay);
                });
            }

            $query = $query->groupBy(DB::raw('DATE_FORMAT(date_applied, "%Y-%m")'))
                ->orderBy('month')
                ->pluck('count', 'month');
            
            // Generate months for the selected year
            $trends = [];
            for ($m = 1; $m <= 12; $m++) {
                $monthKey = sprintf('%s-%02d', $year, $m);
                $trends[] = [
                    'month' => date('M', mktime(0, 0, 0, $m, 1)),
                    'count' => $query->get($monthKey, 0)
                ];
            }

            // Categories
            $catQuery = Application::selectRaw('category_code, COUNT(*) as count')
                ->whereNotNull('category_code');
            
            $catQuery = $applyLocationFilter($catQuery);
            $categories = $catQuery->groupBy('category_code')->get();

            // Recent
            if ($userRole === 'printing_staff') {
                $recentQuery = Application::with('applicant')
                    ->where('is_printed', true)
                    ->orderBy('date_printed', 'desc')
                    ->limit(5);
            } else {
                $recentQuery = Application::with('applicant')->orderBy('created_at', 'desc')->limit(5);
            }
            $recent = $applyLocationFilter($recentQuery)->get();

            // Barangay (for heatmap) - All Time Active Distribution
            $barangayQuery = Application::join('applicants', 'applications.applicant_id', '=', 'applicants.id')
                ->where('applications.status', 'Approved')
                ->whereDate('applications.expiration_date', '>=', now()->toDateString())
                ->select('applicants.barangay', DB::raw('count(*) as count'))
                ->groupBy('applicants.barangay');
            $barangayData = $barangayQuery->get();

            return response()->json([
                'stats' => $stats,
                'trends' => $trends,
                'categories' => $categories,
                'recent' => $recent,
                'barangay' => $barangayData
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function trends()
    {
        $trends = Application::selectRaw('DATE_FORMAT(date_applied, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy(DB::raw('DATE_FORMAT(date_applied, "%Y-%m")'))
            ->orderBy('month')
            ->get();

        return response()->json($trends);
    }

    public function categories()
    {
        $categories = Application::selectRaw('category_code, COUNT(*) as count')
            ->whereNotNull('category_code')
            ->groupBy('category_code')
            ->get();

        return response()->json($categories);
    }
}
