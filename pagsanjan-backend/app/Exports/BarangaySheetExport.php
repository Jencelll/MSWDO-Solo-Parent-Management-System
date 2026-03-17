<?php

namespace App\Exports;

use App\Models\Applicant;
use App\Models\Application;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithDrawings;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use Carbon\Carbon;

class BarangaySheetExport implements FromView, WithTitle, WithDrawings
{
    protected $barangay;
    protected $year;
    protected $month;

    public function __construct($barangay, $year, $month)
    {
        $this->barangay = $barangay;
        $this->year = $year;
        $this->month = $month;
    }

    public function view(): View
    {
        return view('exports.monthly_report', [
            'barangay' => $this->barangay,
            'year' => $this->year,
            'month' => $this->month,
            'monthlyData' => $this->getMonthlyData(),
            'genderData' => $this->getGenderData(),
            'ageData' => $this->getAgeData(),
            'statusData' => $this->getStatusData(),
            'summaryData' => $this->getSummaryData(),
            'applicants' => $this->getApplicants(),
        ]);
    }

    public function title(): string
    {
        return substr($this->barangay, 0, 31); // Excel sheet name limit
    }

    public function drawings()
    {
        $drawings = [];

        $pagsanjanPath = 'E:\\solo_parent\\solo_parent\\pagsanjan-frontend\\assets\\Pagsanjan.png';
        if (file_exists($pagsanjanPath)) {
            $drawing1 = new Drawing();
            $drawing1->setName('Pagsanjan Logo');
            $drawing1->setDescription('Pagsanjan Logo');
            $drawing1->setPath($pagsanjanPath);
            $drawing1->setHeight(80);
            $drawing1->setCoordinates('A1');
            $drawing1->setOffsetX(10);
            $drawing1->setOffsetY(10);
            $drawings[] = $drawing1;
        }

        $mswdoPath = 'E:\\solo_parent\\solo_parent\\pagsanjan-frontend\\assets\\MSWDOLogo.jpg';
        if (file_exists($mswdoPath)) {
            $drawing2 = new Drawing();
            $drawing2->setName('MSWDO Logo');
            $drawing2->setDescription('MSWDO Logo');
            $drawing2->setPath($mswdoPath);
            $drawing2->setHeight(80);
            $drawing2->setCoordinates('P1'); // Adjust based on column count
            $drawing2->setOffsetX(10);
            $drawing2->setOffsetY(10);
            $drawings[] = $drawing2;
        }

        return $drawings;
    }

    private function getMonthlyData()
    {
        return Application::join('applicants', 'applications.applicant_id', '=', 'applicants.id')
            ->where('applicants.barangay', $this->barangay)
            ->whereYear('applications.created_at', $this->year)
            ->select(DB::raw('MONTH(applications.created_at) as month'), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();
    }

    private function getGenderData()
    {
        return Applicant::where('barangay', $this->barangay)
            ->whereHas('application', function($q) {
                $q->whereYear('created_at', $this->year);
            })
            ->select('sex', DB::raw('count(*) as count'))
            ->groupBy('sex')
            ->pluck('count', 'sex')
            ->toArray();
    }

    private function getAgeData()
    {
        $ranges = [
            '18-24' => [18, 24],
            '25-34' => [25, 34],
            '35-44' => [35, 44],
            '45-54' => [45, 54],
            '55-64' => [55, 64],
            '65+' => [65, 150]
        ];

        $data = [];
        foreach ($ranges as $label => $range) {
            $data[$label] = Applicant::where('barangay', $this->barangay)
                ->whereHas('application', function($q) {
                    $q->whereYear('created_at', $this->year);
                })
                ->whereBetween('age', $range)
                ->count();
        }
        return $data;
    }

    private function getStatusData()
    {
        return Application::join('applicants', 'applications.applicant_id', '=', 'applicants.id')
            ->where('applicants.barangay', $this->barangay)
            ->whereYear('applications.created_at', $this->year)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    private function getSummaryData()
    {
        $totalRegistered = Applicant::where('barangay', $this->barangay)
            ->whereHas('application', function($q) {
                $q->whereYear('created_at', $this->year);
            })->count();
        
        $totalActive = Applicant::where('barangay', $this->barangay)
            ->whereHas('application', function($q) {
                $q->where('status', 'Approved')->whereYear('created_at', $this->year);
            })->count();
            
        $maleCount = Applicant::where('barangay', $this->barangay)
            ->where('sex', 'Male')
            ->whereHas('application', function($q) {
                $q->whereYear('created_at', $this->year);
            })->count();
            
        $femaleCount = Applicant::where('barangay', $this->barangay)
            ->where('sex', 'Female')
            ->whereHas('application', function($q) {
                $q->whereYear('created_at', $this->year);
            })->count();

        return [
            'Total Registered' => $totalRegistered,
            'Total Active (Approved)' => $totalActive,
            'Male Count' => $maleCount,
            'Female Count' => $femaleCount
        ];
    }

    private function getApplicants()
    {
        return Applicant::with('application')
            ->where('barangay', $this->barangay)
            ->whereHas('application', function($q) {
                $q->whereYear('created_at', $this->year);
            })
            ->orderBy('last_name')
            ->get();
    }
}
