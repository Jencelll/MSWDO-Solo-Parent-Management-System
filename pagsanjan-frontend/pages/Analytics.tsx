
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Area
} from 'recharts';
import { API_CONFIG } from '../config';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#c084fc'];

const Analytics: React.FC = () => {
  const [barangayData, setBarangayData] = useState<any[]>([]);
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [ageByBarangayData, setAgeByBarangayData] = useState<any[]>([]);
  const [ageGroupData, setAgeGroupData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS_DEMOGRAPHICS}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          
          setBarangayData(data.by_barangay.map((item: any) => ({
            name: item.barangay,
            count: item.count
          })));

          setIncomeData(data.income_distribution.map((item: any) => ({
            range: item.income_range,
            value: item.count
          })));

          setGenderData(data.by_sex.map((item: any) => ({
            name: item.sex,
            value: item.count
          })));

          setAgeGroupData(data.age_groups.map((item: any) => ({
            age: item.age_group,
            val: item.count
          })));

          setAgeByBarangayData(data.age_by_barangay.map((item: any) => ({
            name: item.barangay,
            "18-25": parseInt(item["18-25"]),
            "26-35": parseInt(item["26-35"]),
            "36-45": parseInt(item["36-45"]),
            "46-55": parseInt(item["46-55"]),
            "56+": parseInt(item["56+"])
          })));
        }
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Advanced Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400">In-depth breakdown of Solo Parent demographics in Pagsanjan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Barangay Distribution */}
        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Barangay-wise Distribution</h3>
          <div className="h-[300px] md:h-[350px] flex items-center justify-center">
            {barangayData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barangayData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Income Range */}
        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Income Range Distribution</h3>
          <div className="h-[300px] md:h-[350px] flex items-center justify-center">
            {incomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Gender Breakdown</h3>
          <div className="h-[300px] md:h-[350px] flex flex-col items-center justify-center relative">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Age Groups */}
        <div className="bg-white dark:bg-slate-800 p-4 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Age Group Breakdown</h3>
          <div className="h-[300px] md:h-[350px]">
            {ageGroupData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageGroupData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="age" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="val" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Detailed Age Breakdown per Barangay */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">Age Distribution by Barangay</h3>
            <div className="flex items-center gap-2 mt-2 md:mt-0 text-xs text-slate-500">
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> 18-25</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> 26-35</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-violet-500"></div> 36-45</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> 46-55</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500"></div> 56+</span>
            </div>
          </div>
          <div className="h-[500px] md:h-[600px]">
            {ageByBarangayData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={ageByBarangayData} 
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#475569" 
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                    width={140}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', opacity: 0.5 }} 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="18-25" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={24} name="18-25 Years" />
                  <Bar dataKey="26-35" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={24} name="26-35 Years" />
                  <Bar dataKey="36-45" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} barSize={24} name="36-45 Years" />
                  <Bar dataKey="46-55" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={24} name="46-55 Years" />
                  <Bar dataKey="56+" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} name="56+ Years" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm flex items-center justify-center h-full">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
