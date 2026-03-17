
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Settings,
  User, 
  MapPin, 
  FileText, 
  CircleCheck, // Replaced CheckCircle
  Clock, 
  FileCheck, 
  Heart, 
  Folder, 
  ChevronRight, 
  CreditCard,
  Plus,
  CircleAlert, // Replaced AlertCircle
  LayoutDashboard,
  FilePlus,
  Bell,
  Check,
  Eye,
  Info,
  CircleX,
  Menu,
  Moon,
  Sun,
  X,
  Lock,
  Camera,
  Edit2,
  Banknote
} from 'lucide-react';
import NewApplication from './NewApplication';
import logo from '../assets/Pagsanjan.png';
import mswdoLogo from '../assets/MSWDOLogo.jpg';
import IDCardModal from '../components/IDCardModal';
import { API_CONFIG } from '../config';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props!: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <h2>Something went wrong.</h2>
          <details className="whitespace-pre-wrap">
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

const UserProfile = ({ user }: { user: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Update editName when user prop changes
  useEffect(() => {
    setEditName(user?.full_name || '');
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('full_name', editName);
      if (editAvatar) {
        formData.append('avatar', editAvatar);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        
        // Update local storage with the new user data
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }

        // Ideally we should update the global user state here, but for now we rely on the parent or refresh
        // Since we don't have a global state update function passed down, we might need to reload or just update local UI
        // Assuming the parent component might refetch user data or we can update local storage if needed
        setTimeout(() => {
          setIsEditing(false);
          setMessage(null);
          window.location.reload(); // Simple way to refresh user data for now
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (previewAvatar) return previewAvatar;
    if (user?.avatar) return `${API_CONFIG.BASE_URL}/storage/${user.avatar}`;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h2>
            {!isEditing ? (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-all"
                >
                    <Edit2 size={20} />
                </button>
            ) : (
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => {
                            setIsEditing(false);
                            setEditName(user?.full_name || '');
                            setEditAvatar(null);
                            setPreviewAvatar(null);
                            setMessage(null);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>

        {message && (
            <div className={`p-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-2 ${
                message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            }`}>
                {message.type === 'success' ? <Check size={16} /> : <CircleAlert size={16} />}
                {message.text}
            </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {getAvatarUrl() ? (
                            <img 
                                src={getAvatarUrl()!} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <User className="w-16 h-16 text-slate-400" />
                        )}
                    </div>
                    {isEditing && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Camera className="text-white" size={24} />
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleAvatarChange}
                            />
                        </label>
                    )}
                </div>
                <div className="text-center">
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{user?.full_name || 'Guest User'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Solo Parent Member</p>
                </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Enter full name"
                        />
                    ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                            {user?.full_name || 'N/A'}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium opacity-70">
                        {user?.email || 'N/A'}
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">User ID</label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium opacity-70">
                        {user?.id || 'N/A'}
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Account Status</label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2 opacity-70">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Active
                    </div>
                </div>

                {isEditing && (
                    <div className="md:col-span-2 flex justify-end pt-4">
                        <button 
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const UserSettings = ({ isDarkMode, toggleTheme }: { isDarkMode: boolean, toggleTheme: () => void }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
             setIsChangingPassword(false);
             setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>
        
        <div className="space-y-6">
            {/* Appearance */}
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Appearance</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${isDarkMode ? 'bg-violet-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

             {/* Security */}
             <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Security</h3>
                
                {!isChangingPassword ? (
                    <button 
                        onClick={() => setIsChangingPassword(true)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                        <Lock size={16} />
                        Change Password
                    </button>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-slate-900 dark:text-white">Change Password</h4>
                            <button 
                                onClick={() => {
                                    setIsChangingPassword(false);
                                    setMessage(null);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2 ${
                                message.type === 'success' 
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                                {message.type === 'success' ? <Check size={16} /> : <CircleAlert size={16} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                                <input 
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                                <input 
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all dark:text-white"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                                <input 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all dark:text-white"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

interface UserPortalProps {
  onLogout: () => void;
  onApplicationSubmit: () => void;
  user?: any;
}

const UserSidebar = ({ onLogout, currentView, setView, hasApplication, isOpen, onClose }: { onLogout: () => void, currentView: string, setView: (view: any) => void, hasApplication: boolean, isOpen: boolean, onClose: () => void }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-49 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50 shrink-0 overflow-y-auto custom-scrollbar border-r border-slate-800 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        <nav className="flex-1 py-6 px-4 space-y-1 mt-4">
          <div className="px-4 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Main Menu
          </div>
          <button
            onClick={() => { setView('dashboard'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === 'dashboard' 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={20} className={currentView === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => { setView('application'); onClose(); }}
            disabled={hasApplication}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === 'application' 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                : hasApplication
                ? 'text-slate-600 bg-slate-800/50 cursor-not-allowed opacity-50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FilePlus size={20} className={currentView === 'application' ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
            <span className="text-sm font-medium">{hasApplication ? 'Application Submitted' : 'New Application'}</span>
          </button>
          
          <div className="px-4 mb-3 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Account
          </div>
          <button
            onClick={() => { setView('profile'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === 'profile' 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User size={20} className={currentView === 'profile' ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
            <span className="text-sm font-medium">My Profile</span>
          </button>
          <button
            onClick={() => { setView('settings'); onClose(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === 'settings' 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings size={20} className={currentView === 'settings' ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-2 group"
          >
            <LogOut size={20} className="group-hover:text-red-400" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const UserHeader = ({ user, toggleTheme, isDarkMode, onToggleSidebar, onLogout, setView }: { user?: any, toggleTheme: () => void, isDarkMode: boolean, onToggleSidebar: () => void, onLogout: () => void, setView: (view: any) => void }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-[70px] md:h-[100px] !bg-slate-900 sticky top-0 z-40 px-3 md:px-8 flex items-center justify-between border-b border-slate-800 shadow-md transition-all duration-200 py-2 md:py-5">
      {/* Left: Hamburger, Logos and Title */}
      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors hover:text-white"
        >
          <Menu size={24} className="md:w-7 md:h-7" />
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center -space-x-3 hover:space-x-1 transition-all duration-300">
            <img src={logo} alt="Pagsanjan Logo" className="w-9 h-9 md:w-12 md:h-12 object-contain bg-slate-900 rounded-full border-2 border-slate-700 shadow-sm z-10" />
            <img src={mswdoLogo} alt="MSWDO Logo" className="w-9 h-9 md:w-12 md:h-12 object-contain bg-slate-900 rounded-full border-2 border-slate-700 shadow-sm z-0" />
          </div>
          <div className="hidden md:flex flex-col justify-center">
            <h1 className="text-base font-bold text-white uppercase leading-tight tracking-wide drop-shadow-sm">Municipal Social Welfare and Development Office</h1>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">Municipality of Pagsanjan</p>
          </div>
        </div>
      </div>
      
      {/* Center: Date & Time */}
      <div className="hidden xl:flex flex-1 justify-center items-center">
        <div className="flex flex-col items-center">
          <span className="text-base font-bold text-white tracking-wide">
            {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs font-medium text-slate-400 tracking-wider flex items-center gap-2">
            <Clock size={12} />
            {currentDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>
      
      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2 md:gap-5">
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 md:p-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-full transition-all duration-200"
          >
            {isDarkMode ? <Sun size={20} className="md:w-6 md:h-6" /> : <Moon size={20} className="md:w-6 md:h-6" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 md:p-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-full transition-all duration-200 relative group"
            >
              <Bell size={20} className="md:w-6 md:h-6 group-hover:animate-swing" />
              <span className="absolute top-2 right-2 min-w-[8px] h-[8px] md:min-w-[10px] md:h-[10px] bg-red-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-4 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">1 new</span>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  <div className="px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1 w-2.5 h-2.5 bg-violet-500 rounded-full shrink-0 shadow-sm shadow-violet-500/50"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Welcome to the Solo Parent Information System!</p>
                        <p className="text-xs text-slate-500 mt-1">Click here to get started with your application.</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Just now</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors">View All Notifications</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 md:h-10 w-[1px] bg-slate-700/50 mx-1 md:mx-2"></div>

        {/* User Profile */}
        <div className="relative">
            <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 md:gap-4 cursor-pointer group p-1 md:p-1.5 pr-1 md:pr-4 rounded-full hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-700/50 outline-none"
            >
                <div className="text-right hidden xl:block">
                    <p className="text-sm font-bold text-white leading-none group-hover:text-violet-400 transition-colors">{user?.full_name || 'Guest User'}</p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1">Solo Parent Member</p>
                </div>
                <div className="relative">
                    <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full p-[2px] shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300">
                    <div className="w-full h-full bg-slate-900 rounded-full overflow-hidden border-2 border-slate-900 flex items-center justify-center">
                        {user?.avatar ? (
                            <img 
                              src={`${API_CONFIG.BASE_URL}/storage/${user.avatar}`} 
                              alt="Avatar" 
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300" 
                            />
                        ) : (
                            <User className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                        )}
                    </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm"></div>
                </div>
                <ChevronRight size={16} className={`hidden md:block text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-90' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.full_name || 'Guest User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    <div className="py-1">
                        <button 
                            onClick={() => { setView('profile'); setShowProfileMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                            <User size={16} />
                            <span>My Profile</span>
                        </button>
                        <button 
                            onClick={() => { setView('settings'); setShowProfileMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                            <Settings size={16} />
                            <span>Settings</span>
                        </button>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                        <button 
                            onClick={onLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

const UserPortal: React.FC<UserPortalProps> = ({ onLogout, onApplicationSubmit, user }) => {
  const [view, setView] = useState<'dashboard' | 'application' | 'profile' | 'settings'>('dashboard');
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showIDModal, setShowIDModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Header state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Toggle Theme
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Sync theme on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop, auto-close on mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const fetchMyApplication = async (manual = false) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log("No auth token found");
        return;
      }

      setLoading(true);
      console.log("Fetching my application...");
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MY_APPLICATION}?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log("Fetch response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Application data fetched:", data);
              if (data && data.documents) {
                  console.log("Documents loaded:", data.documents);
              }
              if (data && data.id) {
          setApplication(data);
          if (manual) alert("Application status updated.");
        } else {
          console.log("No valid application data found");
          setApplication(null);
          if (manual) alert("No active application found.");
        }
      } else {
        if (response.status === 401) {
            onLogout();
            return;
        }
        const errorText = await response.text();
        console.log("Failed response:", errorText);
        setApplication(null);
        if (manual) alert("Failed to fetch application status. Please try again.");
      }
    } catch (error) {
      console.error("Failed to fetch application", error);
      if (manual) alert("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'dashboard') {
        fetchMyApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Force refresh application data when returning to dashboard
  /* 
  useEffect(() => {
    if (view === 'dashboard') {
      fetchMyApplication();
    }
  }, [view]); 
  */

  const handleStartApplication = () => {
    setView('application');
  };

  const handleApplicationComplete = () => {
    onApplicationSubmit();
    fetchMyApplication(); // Refresh data immediately
    setView('dashboard');
  };

  const getReqDocument = (types: string[]) => {
    if (!application?.documents) return null;
    return application.documents.find((doc: any) => types.includes(doc.type));
  };

  const requirements = [
    { label: "Solo Parent Application Form", document: getReqDocument(["Solo Parent Application Form"]) },
    { label: "Sworn Statement (Affidavit)", document: getReqDocument(["Sworn Statement (Affidavit of Solo Parent)"]) },
    { label: "Brgy Cert (Solo Parent/Applicant/Child)", document: getReqDocument(["Brgy Cert of Solo Parent", "Brgy Cert of Applicant", "Brgy Cert of Children"]) },
    { label: "Birth Certificate (PSA) of Child/ren", document: getReqDocument(["Birth Certificate (PSA) of the Child/ren"]) },
    { label: "Marriage Contract / Death Cert", document: getReqDocument(["Marriage Contract (for married)", "Death Cert (for widow)"]) },
    { label: "1x1 ID Picture (2pcs)", document: getReqDocument(["1x1 ID Picture (2pcs)"]) },
    { label: "Photo of Parent and Child/ren", document: getReqDocument(["Photo of Parent and Child/ren"]) },
    { label: "ITR (for working applicants)", document: getReqDocument(["ITR (for working applicants)"]) },
    { label: "Applicant's Narrative", document: getReqDocument(["Applicant's Narrative"]) }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <UserSidebar 
        onLogout={onLogout} 
        currentView={view} 
        setView={setView} 
        hasApplication={!!application} 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      
      <main className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64 ml-0' : 'lg:ml-0 ml-0'
      }`}>
        <UserHeader 
          user={user} 
          toggleTheme={toggleTheme} 
          isDarkMode={isDarkMode}
          onToggleSidebar={toggleSidebar}
          onLogout={onLogout}
          setView={setView}
        />
        
        <div className="p-4 md:p-8">
          {view === 'application' ? (
            <NewApplication 
              onSubmit={handleApplicationComplete} 
              onCancel={() => setView('dashboard')}
              variant="user" 
              application={application} 
            />
          ) : view === 'profile' ? (
            <UserProfile user={user} />
          ) : view === 'settings' ? (
            <UserSettings isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          ) : (
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
              {/* Banner Section */}
              <div className="bg-blue-500 rounded-3xl p-4 md:p-8 text-white relative overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-4 md:mb-6">
                    {application?.status === 'Approved' ? (
                      <>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-90">Verified Member</span>
                        {application?.benefit_code?.split(',').includes('A') && (
                          <>
                            <div className="w-1 h-1 bg-white/40 rounded-full mx-2"></div>
                            <div className="w-2 h-2 bg-violet-300 rounded-full animate-pulse"></div>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-90 text-violet-100">Subsidy Qualified</span>
                          </>
                        )}
                      </>
                    ) : application?.status === 'Pending' ? (
                      <>
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-90">Application Pending</span>
                      </>
                    ) : (
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-90">Welcome</span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">Hello, {user?.full_name?.split(' ')[0] || 'Guest'}!</h1>
                  <p className="text-blue-100 font-medium text-sm md:text-base">Welcome to your Solo Parent online portal.</p>
                </div>
                {application?.status === 'Approved' && (
                  <div className="mt-4 md:mt-0 relative md:absolute md:top-1/2 md:right-8 md:-translate-y-1/2 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-2xl border border-white/20 inline-block md:block">
                     <div className="text-center">
                       <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">OSCA ID</p>
                       <p className="text-lg md:text-2xl font-mono font-bold">
                         {application.id_number}
                       </p>
                     </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Main Content - Status Tracker */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-2">
                        <CircleCheck className="text-slate-400" size={20} />
                        <h2 className="text-lg font-bold text-slate-700 dark:text-white">Application Status</h2>
                      </div>
                      {application && application.status !== 'Approved' && (
                        <button 
                            onClick={handleStartApplication}
                            className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors bg-violet-50 dark:bg-violet-900/20 px-4 py-2 rounded-lg"
                        >
                            <Edit2 size={16} />
                            Edit Application
                        </button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative px-4 mb-12">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                      <div 
                        className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 transition-all duration-1000 ${
                          application?.status === 'Disapproved' ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ 
                          width: !application ? '0%' : 
                                 application.status === 'Pending' ? '50%' : 
                                 '100%' 
                        }}
                      ></div>
                      
                      <div className="relative z-10 flex justify-between">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white transition-colors duration-500 ${
                            application ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            <Check size={14} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${application ? 'text-emerald-600' : 'text-slate-400'}`}>Submitted</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white transition-colors duration-500 ${
                            application && (application.status === 'Pending' || application.status === 'Approved' || application.status === 'Disapproved') 
                              ? (application.status === 'Disapproved' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white')
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            <Clock size={14} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            application && (application.status === 'Pending' || application.status === 'Approved') ? 'text-emerald-600' : 
                            application?.status === 'Disapproved' ? 'text-rose-600' : 'text-slate-400'
                          }`}>Review</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white transition-colors duration-500 ${
                            application?.status === 'Approved' ? 'bg-emerald-500 text-white' : 
                            application?.status === 'Disapproved' ? 'bg-rose-500 text-white' :
                            'bg-slate-200 text-slate-500'
                          }`}>
                            {application?.status === 'Disapproved' ? <CircleX size={14} /> : <CircleCheck size={14} />}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            application?.status === 'Approved' ? 'text-emerald-600' : 
                            application?.status === 'Disapproved' ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            {application?.status === 'Disapproved' ? 'Disapproved' : 'Approved'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                      {!application ? (
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400">
                            <FilePlus size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">No Active Application</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                              You haven't submitted a Solo Parent ID application yet. Start your application to access benefits.
                            </p>
                            <div className="flex space-x-3 mt-4">
                                <button 
                                  onClick={handleStartApplication}
                                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                >
                                  Start / Edit Application
                                </button>
                                <button
                                  onClick={() => fetchMyApplication(true)}
                                  className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                                >
                                  Check Status
                                </button>
                            </div>
                          </div>
                        </div>
                      ) : application.status === 'Approved' ? (
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-emerald-100 rounded-xl shadow-sm text-emerald-600">
                            <CircleCheck size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Application Approved</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                              Congratulations! Your application has been approved. You are now a registered Solo Parent member with full benefits.
                            </p>
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-600">
                                  ID: {application.id_number}
                                </div>
                                <div className="text-xs text-slate-400">
                                  Valid until: {new Date(application.expiration_date).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Subsidy Qualification Sign */}
                            {application.benefit_code?.split(',').includes('A') && (
                              <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl flex items-start gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                                <div className="p-2 bg-violet-100 dark:bg-violet-800 rounded-lg text-violet-600 dark:text-violet-300">
                                  <Banknote size={24} />
                                </div>
                                <div>
                                   <h4 className="font-bold text-violet-900 dark:text-violet-100">Subsidy Qualified</h4>
                                   <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">
                                     You are qualified for the monthly financial subsidy program.
                                   </p>
                                </div>
                              </div>
                            )}

                            <div className="flex space-x-3 mt-4">
                                <button
                                  onClick={() => setShowIDModal(true)}
                                  className="px-6 py-2 bg-violet-600 text-white rounded-lg font-bold text-sm hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20 flex items-center space-x-2"
                                >
                                  <CreditCard size={16} />
                                  <span>View ID Card</span>
                                </button>
                                <button
                                  onClick={() => setShowDetailsModal(true)}
                                  className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors flex items-center space-x-2"
                                >
                                  <Eye size={16} />
                                  <span>View Details</span>
                                </button>
                            </div>
                          </div>
                        </div>
                      ) : application.status === 'Disapproved' ? (
                         <div className="flex items-start space-x-4">
                          <div className="p-3 bg-rose-100 rounded-xl shadow-sm text-rose-600">
                            <CircleAlert size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Application Disapproved</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                              We regret to inform you that your application was not approved.
                            </p>
                            {application.remarks && (
                              <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700">
                                <strong>Reason:</strong> {application.remarks}
                              </div>
                            )}
                            <button 
                              onClick={handleStartApplication}
                              className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
                            >
                              Re-apply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-amber-100 rounded-xl shadow-sm text-amber-600">
                            <Clock size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Application Under Review</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                              Your application is currently being reviewed by our social workers. Please wait for further updates.
                            </p>
                            <div className="mt-3 text-xs text-slate-400 font-medium">
                              Reference Case #: {application.case_number}
                            </div>
                            <button 
                              onClick={handleStartApplication}
                              className="mt-4 px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                            >
                              Edit Application
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Classification Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Classification</p>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {application?.benefit_code?.split(',').includes('A') ? 'Subsidy Qualified' : 'Standard Benefits'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        {application?.benefit_code?.split(',').includes('A')
                          ? 'Eligible for monthly subsidy, medical support, and housing prioritization.'
                          : 'Eligible for standard local assistance programs and discounts.'}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      application?.benefit_code?.split(',').includes('A')
                        ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' 
                        : 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                      {application?.benefit_code?.split(',').includes('A') ? <Banknote size={24} /> : <Heart size={24} />}
                    </div>
                  </div>
                </div>

                {/* Right Column - Requirements */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <FileText className="text-slate-400" size={20} />
                        <h2 className="font-bold text-slate-700 dark:text-white">{application ? 'Requirements Checklist' : 'Required Documents'}</h2>
                      </div>
                      {application && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                          requirements.filter(r => !r.document).length === 0 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-rose-100 text-rose-600'
                        }`}>
                          {requirements.filter(r => !r.document).length === 0 
                            ? 'Completed' 
                            : `${requirements.filter(r => !r.document).length} Missing`
                          }
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div className="flex flex-col">
                            <span className={`text-sm font-medium ${req.document ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                              {req.label}
                            </span>
                            {req.document && (
                              <div className="flex flex-col mt-1 gap-1">
                                <a 
                                  href={req.document.file_path.startsWith('/storage/') ? req.document.file_path : req.document.file_path.startsWith('storage/') ? `/${req.document.file_path}` : `/storage/${req.document.file_path}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-violet-600 hover:text-violet-700 underline flex items-center gap-1 w-fit"
                                >
                                  <Eye size={12} /> View Document
                                </a>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                  req.document.status === 'Verified' ? 'text-emerald-600 dark:text-emerald-400' : 
                                  req.document.status === 'Rejected' ? 'text-rose-600 dark:text-rose-400' : 
                                  'text-slate-500 dark:text-slate-400'
                                }`}>
                                  Status: {req.document.status || 'Pending'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            !application 
                              ? 'border-slate-200' 
                              : req.document 
                                ? 'border-emerald-200 bg-emerald-50' 
                                : 'border-rose-200'
                          }`}>
                            {!application ? (
                              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            ) : req.document ? (
                              <Check size={12} className="text-emerald-600" strokeWidth={3} />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-8 p-4 rounded-xl border ${
                      !application 
                        ? 'bg-blue-50 border-blue-100'
                        : requirements.filter(r => !r.document).length === 0 
                          ? 'bg-emerald-50 border-emerald-100'
                          : 'bg-rose-50 border-rose-100'
                    }`}>
                      <div className={`flex items-center space-x-2 font-bold text-xs uppercase tracking-wider mb-2 ${
                        !application 
                          ? 'text-blue-700'
                          : requirements.filter(r => !r.document).length === 0 
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                      }`}>
                        {(!application || requirements.filter(r => !r.document).length > 0) ? <CircleAlert size={14} /> : <Check size={14} />}
                        <span>
                          {!application 
                            ? 'Note' 
                            : requirements.filter(r => !r.document).length === 0 
                              ? 'All Set' 
                              : 'Action Required'}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${
                        !application 
                          ? 'text-blue-600'
                          : requirements.filter(r => !r.document).length === 0 
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                      }`}>
                        {!application 
                          ? 'Please prepare these documents before starting your application to ensure a smooth process.'
                          : requirements.filter(r => !r.document).length === 0 
                            ? 'All required documents have been submitted. Your application is now ready for review.'
                            : 'Please submit the missing documents to the MSWDO office or upload them via the "New Application" section to proceed.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Modals */}
        <ErrorBoundary>
          <IDCardModal 
            isOpen={showIDModal} 
            onClose={() => setShowIDModal(false)} 
            data={application} 
          />
        </ErrorBoundary>

        {showDetailsModal && application && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Application Details</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">FULL RECORD INFORMATION</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <CircleX size={24} />
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {/* Personal Info */}
                  <div className="md:col-span-3">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Full Name</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.first_name} {application.applicant.middle_name} {application.applicant.last_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Date of Birth</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(application.applicant.dob).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Sex</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.sex}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Civil Status</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.civil_status || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Address</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Barangay</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.barangay}</p>
                      </div>
                       <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Contact Number</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.contact_number || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Socio-Economic */}
                  <div className="md:col-span-3">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 mt-4">Socio-Economic Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Employment Status</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.employment_status || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Occupation</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.occupation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Monthly Income</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">₱{application.applicant.monthly_income || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Educational Attainment</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.educational_attainment || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Pantawid Beneficiary</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.is_pantawid_beneficiary ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Indigenous Person</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{application.applicant.is_indigenous_person ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Family Members */}
                  <div className="md:col-span-3">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 mt-4">Family Composition</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[600px]">
                        <thead>
                          <tr className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-2">Name</th>
                            <th className="pb-2">Relationship</th>
                            <th className="pb-2">Age</th>
                            <th className="pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {application.applicant.family_members && application.applicant.family_members.length > 0 ? (
                            application.applicant.family_members.map((member: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                                <td className="py-2 font-medium text-slate-700 dark:text-slate-300">{member.full_name || member.name}</td>
                                <td className="py-2 text-slate-500 dark:text-slate-400">{member.relationship}</td>
                                <td className="py-2 text-slate-500 dark:text-slate-400">{member.age}</td>
                                <td className="py-2 text-slate-500 dark:text-slate-400">{member.civil_status || member.status || 'N/A'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-slate-400 dark:text-slate-500 text-xs italic">No family members listed</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Classification */}
                  <div className="md:col-span-3">
                     <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 mt-4">Classification & Needs</h3>
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Circumstances</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{application.applicant.classification_details || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Needs / Problems</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{application.applicant.needs_problems || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-end">
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserPortal;
