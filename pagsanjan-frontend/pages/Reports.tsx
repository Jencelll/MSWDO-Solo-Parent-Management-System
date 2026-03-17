import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { BARANGAYS } from '../constants';

const Reports: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate years (current year back to 2020)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const queryParams = new URLSearchParams({
        year: selectedYear,
        month: selectedMonth,
        ...(selectedBarangay !== 'All' && { barangay: selectedBarangay }),
      });

      const response = await fetch(`/api/reports/monthly?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solo_parent_report_${selectedYear}_${selectedMonth}${selectedBarangay !== 'All' ? '_' + selectedBarangay : ''}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <FileText className="text-violet-600 dark:text-violet-400" size={24} />
            </div>
            Reports Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generate and download statistical reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Statistical Report Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Monthly Statistical Report</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Solo Parent Masterlist & Statistics</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} />
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 outline-none transition-all font-medium text-slate-700 dark:text-slate-200"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} />
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 outline-none transition-all font-medium text-slate-700 dark:text-slate-200"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>

              {/* Barangay Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Filter size={14} />
                  Barangay
                </label>
                <select
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 outline-none transition-all font-medium text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Barangays</option>
                  {BARANGAYS.map(barangay => (
                    <option key={barangay} value={barangay}>{barangay}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Generate Excel Report</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Report includes: Demographics, Gender Distribution, and Benefit Availment
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder for future reports */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center opacity-75">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
            <FileText size={32} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">More Reports Coming Soon</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Additional statistical reports and printable forms will be added here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
