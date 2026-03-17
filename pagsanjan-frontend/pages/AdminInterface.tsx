import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Search, Bell, Moon, Sun, Menu, X, User } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import Dashboard from './Dashboard';
import NewApplication from './NewApplication';
import ApplicationList from './ApplicationList';
import SoloParentRegistry from './SoloParentRegistry';
import Analytics from './Analytics';
import UsersPage from './Users';
import Settings from './Settings';
import SystemLogs from './SystemLogs';
import logo from '../assets/Pagsanjan.png';
import mswdoLogo from '../assets/MSWDOLogo.jpg';

const Sidebar = ({ onLogout, isOpen, onClose }: { onLogout: () => void; isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();

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
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Close button for mobile */}
        <div className="flex justify-between items-center p-4 lg:hidden">
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Main Menu
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Desktop header */}
        <div className="hidden lg:block p-6 pb-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-2"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ 
  notifications, 
  darkMode, 
  toggleDarkMode,
  onToggleSidebar
}: { 
  notifications: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onToggleSidebar: () => void;
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-[70px] md:h-20 bg-slate-900 sticky top-0 z-40 px-3 md:px-6 flex items-center justify-between border-b border-slate-800 shadow-sm transition-colors duration-200">
      {/* Left: Hamburger, Logos and Title */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={20} className="md:w-6 md:h-6" />
        </button>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center -space-x-2 hover:space-x-1 transition-all duration-300">
            <img src={logo} alt="Pagsanjan Logo" className="w-8 h-8 md:w-9 md:h-9 object-contain bg-transparent rounded-full border border-slate-700" />
            <img src={mswdoLogo} alt="MSWDO Logo" className="w-8 h-8 md:w-9 md:h-9 object-contain bg-transparent rounded-full border border-slate-700" />
          </div>
          <div className="hidden md:flex flex-col">
            <h1 className="text-sm font-bold text-white uppercase leading-tight tracking-wide">Municipal Social Welfare and Development Office</h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Municipality of Pagsanjan</p>
          </div>
        </div>
      </div>
      
      {/* Right: Search and Controls */}
      <div className="flex items-center space-x-2 md:space-x-6">
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-violet-500/20 transition-all outline-none placeholder:text-slate-500 text-white font-medium"
          />
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-300 rounded-full transition-colors"
          >
            {darkMode ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-300 rounded-full transition-colors relative"
            >
              <Bell size={18} className="md:w-5 md:h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[8px] h-[8px] bg-red-500 rounded-full ring-2 ring-slate-900"></span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                  {notifications > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{notifications} new</span>}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications > 0 ? (
                    <div 
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0" 
                      onClick={() => {
                        navigate('/list?status=Pending');
                        setShowNotifs(false);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 w-2 h-2 bg-violet-500 rounded-full shrink-0"></div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">You have <span className="font-bold text-violet-600 dark:text-violet-400">{notifications}</span> pending applications waiting for review.</p>
                          <p className="text-xs text-slate-400 mt-1">Click to view pending list</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-slate-400 text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 md:h-6 w-[1px] bg-slate-700 mx-1 md:mx-0"></div>

          {/* User Profile */}
          <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-white leading-none">Admin Staff</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">MSWDO-OFFICER</p>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center">
              <User size={18} className="text-slate-400 md:w-5 md:h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

interface AdminInterfaceProps {
  onLogout: () => void;
}

const AdminInterface: React.FC<AdminInterfaceProps> = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [notifications, setNotifications] = useState(0);
  const [refreshApplications, setRefreshApplications] = useState(0);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Check for notifications on mount (simulating real-time updates)
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          // Set notifications to the number of pending applications
          setNotifications(data.pending || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    checkNotifications();
    // Poll every 10 seconds to avoid overwhelming the server
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [refreshApplications]);

  const handleApplicationSubmit = () => {
    // Increment notifications for admin
    const current = parseInt(localStorage.getItem('notifications') || '0');
    localStorage.setItem('notifications', (current + 1).toString());
    
    // Trigger refresh of application list
    setRefreshApplications(prev => prev + 1);
  };

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500">
        <Sidebar 
          onLogout={onLogout} 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />
        
        <main className={`flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-700 ease-out transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64 ml-0' : 'lg:ml-0 ml-0'
        }`}>
          <Header 
            notifications={notifications} 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onToggleSidebar={toggleSidebar}
          />
          
          <div className="p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard refreshTrigger={refreshApplications} />} />
              <Route path="/new" element={<NewApplication onSubmit={handleApplicationSubmit} />} />
              <Route path="/edit/:id" element={<NewApplication onSubmit={handleApplicationSubmit} />} />
              <Route path="/list" element={<ApplicationList refreshTrigger={refreshApplications} />} />
              <Route path="/registry" element={<SoloParentRegistry />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/logs" element={<SystemLogs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default AdminInterface;