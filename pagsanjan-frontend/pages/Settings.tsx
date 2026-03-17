import React, { useState, useEffect, useRef } from 'react';
import { API_CONFIG } from '../config';
import { 
  Save, 
  Lock, 
  Database,
  Eye,
  EyeOff,
  ChevronRight,
  Upload,
  Download,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Cloud,
  ShieldAlert,
  Settings as SettingsIcon,
  Check,
  X,
  Loader2
} from 'lucide-react';

interface BackupFile {
  filename: string;
  size: number;
  timestamp: number;
  url: string;
}

const Settings = () => {
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

  const [activeTab, setActiveTab] = useState('security');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Backup States
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchBackups();
    }
  }, [activeTab]);

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BACKUPS.LIST}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Failed to fetch backups', error);
    }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BACKUPS.CREATE}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Backup created successfully' });
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: data.error || 'Backup failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Backup failed' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm('Are you sure you want to restore this backup? Current data will be overwritten.')) {
        handleRestore(file);
      } else {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleRestore = async (file: File) => {
    setRestoreLoading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('backup_file', file);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BACKUPS.RESTORE}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'System restored successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Restore failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Restore failed' });
    } finally {
      setRestoreLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (filename: string) => {
    setDownloadLoading(true);
    setMessage(null);
    try {
      // Remove .sql extension if present to avoid routing issues
      const cleanFilename = filename.replace(/\.sql$/, '');
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BACKUPS.DOWNLOAD(cleanFilename)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Backup downloaded successfully' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage({ type: 'error', text: errorData.error || 'Failed to download backup' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'An error occurred while downloading the backup' });
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const latestBackup = backups.length > 0 ? backups[0] : null;

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecurityMessage(null);

    // Basic validation
    if (!currentPassword) {
      setSecurityMessage({ type: 'error', text: 'Current password is required.' });
      setSecurityLoading(false);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'New passwords do not match.' });
      setSecurityLoading(false);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setSecurityMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      setSecurityLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      const payload: any = {
      current_password: currentPassword
    };

    if (newPassword) {
      payload.new_password = newPassword;
      payload.new_password_confirmation = confirmPassword;
    }

    if (newEmail) {
      payload.email = newEmail;
    }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_AUTH.UPDATE_PROFILE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();

        if (response.ok) {
          setSecurityMessage({ type: 'success', text: 'Security settings updated successfully.' });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setNewEmail('');

          // Update local storage with fresh user data
          if (data.user) {
            localStorage.setItem('userData', JSON.stringify(data.user));
          }
        } else {
          // Handle validation errors or specific messages
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat().join('. ');
            setSecurityMessage({ type: 'error', text: errorMessages });
          } else {
            setSecurityMessage({ type: 'error', text: data.error || data.message || 'Update failed.' });
          }
        }
      } else {
        // Handle non-JSON response
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setSecurityMessage({ type: 'error', text: `Server error (${response.status}). Please try again later.` });
      }
    } catch (error) {
      console.error('Security update error:', error);
      setSecurityMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSecurityLoading(false);
    }
  };

  const menuItems = [
    { id: 'security', label: 'TERMINAL SECURITY', icon: <Lock size={18} /> },
    { id: 'logs', label: 'DATABASE BACKUP', icon: <Database size={18} /> },
  ].filter(item => {
    if (userRole === 'staff') {
      return item.id === 'security';
    }
    if (userRole === 'mayor') {
      return item.id === 'security';
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Configuration</h2>
          <div className="flex items-center space-x-2 text-slate-500 mt-1">
            <SettingsIcon size={16} className="text-violet-600" />
            <p className="text-xs font-bold uppercase tracking-wider">Control Terminal // Version 2.2.0-PSG</p>
          </div>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center space-x-2 active:scale-95">
          <Save size={18} />
          <span>Commit Changes</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === item.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={16} />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 md:p-8 min-h-[400px] md:min-h-[600px]">
            {activeTab === 'security' && (
              <div className="space-y-8 max-w-2xl mx-auto pt-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Account Protection</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Update Authentication Keys & Security Policy</p>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div className="border border-slate-200 rounded-3xl p-4 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600"></div>
                  
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 text-violet-600">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 uppercase">Update Security Key & Email</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-2 leading-relaxed max-w-sm">
                        Requires re-authentication of your current session. Current password is required for any changes.
                      </p>
                    </div>
                  </div>

                  {securityMessage && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 ${
                      securityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {securityMessage.type === 'success' ? <Check size={20} /> : <ShieldAlert size={20} />}
                      <p className="text-sm font-bold">{securityMessage.text}</p>
                    </div>
                  )}

                  <form onSubmit={handleSecurityUpdate} className="space-y-6" autoComplete="off">
                    {/* Hidden inputs to trick browser autofill */}
                    <input type="text" style={{display: 'none'}} />
                    <input type="password" style={{display: 'none'}} />

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password (Required)</label>
                      <div className="relative">
                        <input 
                          required
                          autoComplete="new-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Update Email Address (Optional)</label>
                      <div className="relative">
                        <input 
                          autoComplete="off"
                          type="text"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                          placeholder="Enter new email or identifier"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password (Optional)</label>
                        <div className="relative">
                          <input 
                            autoComplete="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                            placeholder="Min. 6 chars"
                            minLength={6}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <div className="relative">
                          <input 
                            autoComplete="new-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                            placeholder="Verify key"
                            minLength={6}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={securityLoading}
                      className="w-full bg-slate-500 text-white py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-slate-600 transition-all shadow-lg shadow-slate-500/20 mt-4 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {securityLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      <span>Update Security Settings</span>
                      {!securityLoading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Database Backup & Recovery Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-violet-50/50 p-6 rounded-3xl border border-violet-100 flex items-start gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 shrink-0">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">System Backup & Recovery</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mt-1 max-w-2xl">
                      Ensure your data is safe. We perform automatic backups every 24 hours, but you can trigger a manual backup anytime.
                    </p>
                  </div>
                </div>

                {message && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {message.type === 'success' ? <Check size={20} /> : <X size={20} />}
                    <p className="text-sm font-bold">{message.text}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Last Backup Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-emerald-500 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-bold uppercase tracking-wide">Last Successful Backup</span>
                      </div>
                      {latestBackup ? (
                        <>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                {new Date(latestBackup.timestamp * 1000).toLocaleDateString()}
                                <span className="text-lg ml-2 text-slate-400 font-bold">
                                    {new Date(latestBackup.timestamp * 1000).toLocaleTimeString()}
                                </span>
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                Size: {formatBytes(latestBackup.size)} • {latestBackup.filename}
                            </p>
                        </>
                      ) : (
                        <>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">No Backups Yet</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Create your first backup now</p>
                        </>
                      )}
                    </div>
                    <div className="space-y-3 mt-8">
                        <button 
                            onClick={handleCreateBackup}
                            disabled={backupLoading}
                            className="w-full bg-violet-600 text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {backupLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            <span>{backupLoading ? 'Creating Backup...' : 'Backup Now'}</span>
                        </button>
                        
                        {latestBackup && (
                            <button 
                                onClick={() => handleDownload(latestBackup.filename)}
                                disabled={downloadLoading}
                                className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {downloadLoading ? <Loader2 size={18} className="animate-spin" /> : <HardDrive size={18} />}
                                <span>{downloadLoading ? 'Downloading...' : 'Download Latest'}</span>
                            </button>
                        )}
                    </div>
                  </div>

                  {/* Restore Data Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Restore Data</h4>
                    <p className="text-xs text-slate-500 mb-6">
                      Need to rollback? Upload a valid backup file to restore the entire system to a previous state.
                    </p>
                    <div 
                        className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group relative"
                        onClick={() => !restoreLoading && fileInputRef.current?.click()}
                    >
                      {restoreLoading ? (
                          <div className="flex flex-col items-center text-violet-600">
                              <Loader2 size={32} className="animate-spin mb-3" />
                              <p className="text-sm font-bold">Restoring System...</p>
                              <p className="text-xs text-slate-400 mt-1">Please do not close this window</p>
                          </div>
                      ) : (
                          <>
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-violet-600 group-hover:bg-violet-50 transition-colors mb-3">
                                <Upload size={20} />
                            </div>
                            <p className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Click to upload .sql</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Max file size: 500MB</p>
                          </>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".sql"
                        onChange={handleRestoreUpload}
                        disabled={restoreLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Warning Alert */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h5 className="text-sm font-bold text-amber-800">Warning about restoration:</h5>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Restoring data will overwrite all current entries, logs, and system settings. This action cannot be undone once the process starts. Please ensure you have the latest backup downloaded before proceeding.
                    </p>
                  </div>
                </div>


              </div>
            )}
            
            {/* Placeholder for other tabs - Removed as per request */}\n            {/* \n            {activeTab !== 'security' && activeTab !== 'logs' && (\n                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-50">\n                    <ShieldAlert size={64} />\n                    <p className="text-sm font-bold uppercase tracking-widest">Module Under Construction</p>\n                </div>\n            )}\n            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
