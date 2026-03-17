
import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle, XCircle, FileText, Activity } from 'lucide-react';
import { API_CONFIG } from '../config';

interface SystemLog {
  id: number;
  user_id: number | null;
  user?: {
    full_name: string;
    username: string;
  };
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}

const SystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Assuming the API returns a paginated response structure
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SYSTEM_LOGS}?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data && data.data) {
        setLogs(data.data);
        setTotalPages(data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch system logs", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('login') || lowerAction.includes('logout')) return <User size={18} />;
    if (lowerAction.includes('approved')) return <CheckCircle size={18} className="text-emerald-500" />;
    if (lowerAction.includes('disapproved')) return <XCircle size={18} className="text-rose-500" />;
    if (lowerAction.includes('created') || lowerAction.includes('registered')) return <FileText size={18} className="text-blue-500" />;
    return <Activity size={18} />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Logs</h2>
        <p className="text-slate-500 dark:text-slate-400">Activity history and audit trail of system usage.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-4 md:p-8">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity History</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs mt-1">ACTIVITY DETAILS</p>
        </div>

        <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-4 md:ml-6 space-y-8 pl-8 md:pl-10 pb-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading logs...</div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] md:-left-[49px] top-1 bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-600 group-hover:border-violet-500 dark:group-hover:border-violet-500 transition-colors">
                  <div className="text-slate-400 group-hover:text-violet-600 dark:text-slate-500 dark:group-hover:text-violet-400 transition-colors">
                    {getIcon(log.action)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">
                      {log.action}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm">
                      {log.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-mono">
                      Reference ID: #LOG-{log.id.toString().padStart(6, '0')}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                      <Clock size={12} className="mr-1" />
                      {formatDate(log.created_at)}
                    </span>
                    {log.user && (
                      <p className="text-xs text-slate-400 mt-1">
                        by <span className="font-semibold text-slate-600 dark:text-slate-300">{log.user.full_name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">No activity logs found.</div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-700 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
