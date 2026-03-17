<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class SoloParentMonthlyReportExport implements WithMultipleSheets
{
    use Exportable;

    protected $year;
    protected $month;
    protected $barangays;

    public function __construct($year, $month, $barangays)
    {
        $this->year = $year;
        $this->month = $month;
        $this->barangays = $barangays;
    }

    /**
     * @return array
     */
    public function sheets(): array
    {
        $sheets = [];

        foreach ($this->barangays as $barangay) {
            $sheets[] = new BarangaySheetExport($barangay, $this->year, $this->month);
        }

        return $sheets;
    }
}
