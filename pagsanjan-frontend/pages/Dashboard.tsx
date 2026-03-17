
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  ChevronRight,
  User,
  X,
  MapPin,
  FileText,
  Archive,
  Award,
  UserPlus,
  Calendar,
  XCircle,
  ClipboardList
} from 'lucide-react';
import { API_CONFIG } from '../config';
import { BARANGAYS } from '../constants';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#7c3aed', '#059669', '#d97706', '#dc2626', '#8b5cf6'];
const GENDER_COLORS = ['#3b82f6', '#ec4899']; // Blue for Male, Pink for Female

interface DashboardProps {
  refreshTrigger?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ refreshTrigger = 0 }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [applicationData, setApplicationData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [barangayData, setBarangayData] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
  const [barangayMembers, setBarangayMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Dashboard Filters
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [locationFilter, setLocationFilter] = useState('All');

  const [userRole] = useState(() => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        return userData.role || '';
      }
    } catch (e) {
      console.error('Error parsing user data', e);
    }
    return '';
  });

  const handleBarangayClick = async (barangayName: string) => {
    setSelectedBarangay(barangayName);
    setLoadingMembers(true);
    try {
      // Fetch approved applications for the selected barangay
      const response = await fetch(`/api/applications?status=Approved&barangay=${encodeURIComponent(barangayName)}`);
      if (response.ok) {
        const data = await response.json();
        setBarangayMembers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch barangay members", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const closeBarangayModal = () => {
    setSelectedBarangay(null);
    setBarangayMembers([]);
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/reports/monthly');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        a.download = `solo_parent_report_${year}_${month}.xls`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to generate report');
        alert('Failed to generate report. Please try again.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please check your connection.');
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (yearFilter) queryParams.append('year', yearFilter);
        if (locationFilter && locationFilter !== 'All') queryParams.append('barangay', locationFilter);
        if (userRole) queryParams.append('role', userRole);

        const response = await fetch(`/api/dashboard/overview?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          
          setStats(data.stats || {});
          setApplicationData(data.trends || []);
          setCategoryData(data.categories || []);
          setRecentApplications(data.recent || []);
          
          setBarangayData((data.barangay || []).map((item: any) => ({
            name: item.barangay,
            value: item.count
          })));

          // Fetch notifications for aged-out dependents (Only for Admin/Staff)
          if (userRole === 'admin' || userRole === 'staff' || userRole === 'mayor') {
            const notifRes = await fetch('/api/system-logs?action=Dependent Aged Out&limit=5');
            if (notifRes.ok) {
              const notifData = await notifRes.json();
              setNotifications(notifData.data || []);
            }
          }
        } else {
          console.error("Failed to fetch dashboard overview");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, userRole, yearFilter, locationFilter]);

  const genderData = [
    { name: 'Male', value: parseInt(stats.male || '0') },
    { name: 'Female', value: parseInt(stats.female || '0') }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Solo Parent Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoring Pagsanjan Solo Parent Analytics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 shadow-sm">
            <Calendar size={18} className="text-slate-400" />
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer min-w-[60px]"
            >
              {[2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 shadow-sm">
            <MapPin size={18} className="text-slate-400" />
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer min-w-[100px] max-w-[150px]"
            >
              <option value="All">All Barangays</option>
              {BARANGAYS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => navigate('/new')}
            className="flex items-center justify-center space-x-2 bg-slate-900 dark:bg-violet-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-violet-700 transition-all shadow-lg shadow-slate-900/20 dark:shadow-violet-600/20 active:scale-95"
          >
            <UserPlus size={18} />
            <span>New Registration</span>
          </button>
        </div>
      </div>

      {/* Notifications for Aged-Out Dependents */}
      {notifications.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 animate-in slide-in-from-top-2 fade-in duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-amber-600 dark:text-amber-400" size={20} />
            <h3 className="font-bold text-amber-800 dark:text-amber-200">System Alerts: Dependent Eligibility</h3>
          </div>
          <ul className="space-y-2">
            {notifications.map((notif: any, idx: number) => (
              <li key={idx} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                <span>{notif.description}</span>
                <span className="text-xs text-amber-500 dark:text-amber-400 ml-auto whitespace-nowrap">
                  {new Date(notif.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Applicants */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ClipboardList size={64} className="text-indigo-600" />
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl w-fit mb-4">
              <ClipboardList className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Applicants</h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total_applications || '0'}</p>
            </div>
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className="text-violet-600" />
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-2xl w-fit mb-4">
              <Users className="text-violet-600 dark:text-violet-400" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Members</h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex items-center">
                  <ChevronRight size={10} className="rotate-[-45deg]" /> 8%
                </span>
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.approved || '0'}</p>
            </div>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-6 right-6">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-800/50 uppercase tracking-wide">
              Action Required
            </span>
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl w-fit mb-4">
              <FileText className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {userRole === 'printing_staff' ? "PRINT ID'S" : "Pending Applications"}
              </h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {userRole === 'printing_staff' ? (stats.pending_prints || '0') : (stats.pending || '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Subsidy Qualified */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-6 right-6">
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-lg border border-violet-100 dark:border-violet-800/50 uppercase tracking-wide">
              {userRole === 'printing_staff' ? "Renewal Due" : "VIP Status"}
            </span>
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-2xl w-fit mb-4">
              <Award className="text-violet-600 dark:text-violet-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {userRole === 'printing_staff' ? "For renewal ID" : "Subsidy Qualified"}
              </h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {userRole === 'printing_staff' ? (stats.for_renewal || '0') : (stats.subsidy_qualified || '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Deceased / Archived */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-6 right-6">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 uppercase tracking-wide">
              Archived
            </span>
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit mb-4">
              <Archive className="text-slate-600 dark:text-slate-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Archived</h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.archived || '0'}</p>
            </div>
          </div>
        </div>

        {/* Disapproved Applications */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-6 right-6">
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-800/50 uppercase tracking-wide">
              Disapproved
            </span>
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl w-fit mb-4">
              <XCircle className="text-rose-600 dark:text-rose-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Disapproved</h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.disapproved || '0'}</p>
            </div>
          </div>
        </div>

        {/* Male Registered */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-6 right-6">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50 uppercase tracking-wide">
              Male
            </span>
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl w-fit mb-4">
              <User className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Male Registered</h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.male || '0'}</p>
            </div>
          </div>
        </div>

        {/* Female Registered */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-6 right-6">
            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-lg border border-pink-100 dark:border-pink-800/50 uppercase tracking-wide">
              Female
            </span>
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl w-fit mb-4">
              <User className="text-pink-600 dark:text-pink-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Female Registered</h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.female || '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Registration Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Registration</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Intake analysis for the year {yearFilter}</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                />
                <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={4} dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Split Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gender Split</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Demographic distribution</p>
          </div>
          <div className="h-[250px] w-full relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
               <div className="text-center">
                 <span className="text-3xl font-black text-slate-900 dark:text-white block leading-none">
                   {genderData.reduce((acc, curr) => acc + curr.value, 0)}
                 </span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barangay Heatmap Distribution (Existing) */}
      <div 
        className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-violet-600" size={24} />
              Geographic Distribution
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Density of solo parents across Barangays</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 self-start sm:self-auto">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Low</span>
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Medium</span>
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">High</span>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {barangayData.map((brgy, idx) => {
            // Calculate max value dynamically or fallback to 100 if empty
            const maxVal = Math.max(...barangayData.map(b => b.value), 1);
            const percentage = (brgy.value / maxVal) * 100;
            
            let colorClass = "border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100/50 bg-emerald-50/50";
            let barColor = "bg-emerald-500";
            let iconColor = "text-emerald-600";
            let textColor = "text-emerald-900";
            
            if (percentage > 60) {
                colorClass = "border-rose-200 hover:border-rose-400 hover:shadow-rose-100/50 bg-rose-50/50";
                barColor = "bg-rose-500";
                iconColor = "text-rose-600";
                textColor = "text-rose-900";
            } else if (percentage > 25) {
                colorClass = "border-violet-200 hover:border-violet-400 hover:shadow-violet-100/50 bg-violet-50/50";
                barColor = "bg-violet-500";
                iconColor = "text-violet-600";
                textColor = "text-violet-900";
            }

            return (
              <div 
                key={idx} 
                onClick={() => handleBarangayClick(brgy.name)}
                className={`group cursor-pointer relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600 ${colorClass}`}
              >
                <div className="flex justify-between items-start mb-4">
                    <h4 className={`font-bold text-sm truncate pr-2 ${textColor} dark:text-slate-200`} title={brgy.name}>
                        {brgy.name}
                    </h4>
                    <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm ${iconColor} dark:text-slate-300`}>
                        <MapPin size={14} />
                    </div>
                </div>
                
                <div className="flex items-baseline gap-1.5 mb-4">
                    <span className={`text-3xl font-black tracking-tight ${textColor} dark:text-white`}>
                        {brgy.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Residents
                    </span>
                </div>

                <div className="w-full h-1.5 bg-slate-200/50 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                </div>
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-tr-2xl pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barangay Members Modal */}
      {selectedBarangay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-violet-600 dark:text-violet-400">{selectedBarangay}</span>
                  <span className="text-slate-400 font-normal text-base">Solo Parents</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  List of registered solo parents in this barangay
                </p>
              </div>
              <button 
                onClick={closeBarangayModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-0 flex-1">
              {loadingMembers ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-sm">Loading members...</p>
                </div>
              ) : barangayMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10">
                    <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 md:px-6 md:py-4 font-semibold">Name</th>
                      <th className="px-4 py-3 md:px-6 md:py-4 font-semibold">Age</th>
                      <th className="px-4 py-3 md:px-6 md:py-4 font-semibold">Status</th>
                      <th className="px-4 py-3 md:px-6 md:py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {barangayMembers.map((member, idx) => {
                       const applicant = member.applicant;
                       return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 md:px-6 md:py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 shrink-0">
                                {applicant?.first_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px] md:max-w-none">
                                  {applicant?.first_name} {applicant?.last_name}
                                </p>
                                <p className="text-xs text-slate-500">{applicant?.contact_number || 'No contact'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-600 dark:text-slate-400">
                             {applicant?.dob ? (new Date().getFullYear() - new Date(applicant.dob).getFullYear()) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4">
                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                               Active
                             </span>
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                            <button 
                              onClick={() => navigate(`/edit/${member.id}`)}
                              className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                       );
                    })}
                  </tbody>
                </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <User size={32} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <h4 className="text-slate-900 dark:text-white font-medium mb-1">No members found</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                    There are no approved solo parent applications recorded for {selectedBarangay} yet.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={closeBarangayModal}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications Table */}
      {userRole !== 'mayor' && (
        <div 
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-backwards"
          style={{ animationDelay: '300ms' }}
        >
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white">
              {userRole === 'printing_staff' ? "Recent ID print" : "Recent Applications"}
            </h3>
            <button 
              className="text-violet-600 dark:text-violet-400 text-sm font-semibold hover:underline"
              onClick={() => navigate(userRole === 'printing_staff' ? '/id-cards' : '/list')}
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 md:px-6 md:py-4">Applicant</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Case Number</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">
                    {userRole === 'printing_staff' ? "Date Printed" : "Date Applied"}
                  </th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                  <th className="px-4 py-3 md:px-6 md:py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentApplications.length > 0 ? (
                  recentApplications.map((row, idx) => {
                    const applicantName = row.applicant ? `${row.applicant.first_name} ${row.applicant.last_name}` : 'N/A';
                    const displayDate = userRole === 'printing_staff' ? 
                      (row.date_printed ? new Date(row.date_printed).toLocaleDateString() : 'N/A') : 
                      row.date_applied;
                    return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 md:px-6 md:py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                            {applicantName.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px] md:max-w-none">{applicantName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{row.case_number}</td>
                      <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{displayDate}</td>
                      <td className="px-4 py-3 md:px-6 md:py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          row.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                          row.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                        }`}>
                          {userRole === 'printing_staff' ? "Printed" : row.status}
                        </span>
                      </td>
                      <td 
                        className="px-6 py-4 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 cursor-pointer"
                        onClick={() => navigate(userRole === 'printing_staff' ? `/id-cards` : `/edit/${row.id}`)}
                      >
                        {userRole === 'printing_staff' ? "View Card" : "Review"}
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No {userRole === 'printing_staff' ? "recent prints" : "recent applications"} found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
