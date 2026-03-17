
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, Search, Bell, Moon, Sun, Menu, User, Loader2, Clock } from 'lucide-react';
import { NotificationProvider, NotificationContainer } from './components/Notification';
import { NAV_ITEMS } from './constants';
import Dashboard from './pages/Dashboard';
import NewApplication from './pages/NewApplication';
import ApplicationList from './pages/ApplicationList';
import SoloParentRegistry from './pages/SoloParentRegistry';
import Analytics from './pages/Analytics';
import UsersPage from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';
import UserPortal from './pages/UserPortal';
import SystemLogs from './pages/SystemLogs';
import Reports from './pages/Reports';
import PrintApplicationForm from './pages/PrintApplicationForm';
import IDCardManagement from './pages/IDCardManagement';
import logo from './assets/Pagsanjan.png';
import mswdoLogo from './assets/MSWDOLogo.jpg';

const Sidebar = ({ onLogout, isOpen, userRole, onItemClick }: { onLogout: () => void; isOpen: boolean; userRole: string; onItemClick?: () => void }) => {
  const location = useLocation();

  const filteredItems = NAV_ITEMS.filter(item => {
    if (userRole === 'staff') {
      return !['users', 'system-logs'].includes(item.id);
    }
    if (userRole === 'mayor') {
      return ['dashboard', 'analytics', 'registry', 'settings'].includes(item.id);
    }
    if (userRole === 'printing_staff') {
      return ['dashboard', 'id-cards', 'settings'].includes(item.id);
    }
    return true;
  });

  return (
    <aside className={`fixed top-0 left-0 h-[100dvh] w-64 bg-slate-900 text-white flex flex-col z-50 shrink-0 overflow-y-auto custom-scrollbar border-r border-slate-800 transition-transform duration-300 ease-in-out print:hidden ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <nav className="flex-1 py-6 px-4 space-y-1 mt-4">
        <div className="px-4 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onItemClick}
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
  );
};

const Header = ({ 
  notifications, 
  darkMode, 
  toggleDarkMode,
  onToggleSidebar,
  user
}: { 
  notifications: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onToggleSidebar: () => void;
  user: any;
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-[70px] md:h-20 !bg-slate-900 sticky top-0 z-40 px-3 md:px-6 flex items-center justify-between border-b border-slate-800 shadow-sm transition-colors duration-200 print:hidden">
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
            <h1 className="text-xs md:text-sm font-bold text-white uppercase leading-tight tracking-wide">Municipal Social Welfare and Development Office</h1>
            <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Municipality of Pagsanjan</p>
          </div>
        </div>
      </div>
      
      {/* Right: Search and Controls */}
      <div className="flex items-center space-x-2 md:space-x-6">
        {/* Date Time */}
        <div className="hidden lg:flex flex-col items-end">
           <span className="text-xs font-bold text-slate-300">
             {currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
           </span>
           <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
             <Clock size={10} />
             {currentDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
           </span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-300 rounded-full transition-colors"
          >
            {darkMode ? <Sun size={16} className="md:w-5 md:h-5" /> : <Moon size={16} className="md:w-5 md:h-5" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-300 rounded-full transition-colors relative"
            >
              <Bell size={16} className="md:w-5 md:h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[6px] h-[6px] bg-red-500 rounded-full ring-2 ring-slate-900"></span>
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
                        if (user?.role === 'printing_staff') {
                           navigate('/id-cards');
                        } else {
                           navigate('/list?status=Pending');
                        }
                        setShowNotifs(false);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 w-2 h-2 bg-violet-500 rounded-full shrink-0"></div>
                        <div>
                          {user?.role === 'printing_staff' ? (
                            <>
                              <p className="text-sm text-slate-600 dark:text-slate-300">You have <span className="font-bold text-violet-600 dark:text-violet-400">{notifications}</span> ID cards waiting for printing.</p>
                              <p className="text-xs text-slate-400 mt-1">Click to view print queue</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-slate-600 dark:text-slate-300">You have <span className="font-bold text-violet-600 dark:text-violet-400">{notifications}</span> pending applications waiting for review.</p>
                              <p className="text-xs text-slate-400 mt-1">Click to view pending list</p>
                            </>
                          )}
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

          <div className="h-6 w-[1px] bg-slate-700"></div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-white leading-none">{user?.full_name || 'Admin Staff'}</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">
                {user?.role === 'admin' ? 'MSWDO-OFFICER' : 
                 user?.role === 'mayor' ? 'MUNICIPAL MAYOR' : 
                 (user?.role || 'MSWDO-OFFICER')}
              </p>
            </div>
            <div className="w-9 h-9 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center">
              <User size={20} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  // Check local storage for persistence mode
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'admin';
  });
  const [userData, setUserData] = useState<any>(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
      setSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const handleLogin = (role: string, user: any = null) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserData(user);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
  };

  const performLogout = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    
    try {
      // Call logout API to invalidate token
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setTimeout(() => {
      setIsAuthenticated(false);
      setIsLoggingOut(false);
      setUserData(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userData');
    }, 1500); // Extended for logout animation
  };

  const handleLogoutRequest = () => {
    setShowLogoutConfirm(true);
  };

  const [refreshApplications, setRefreshApplications] = useState(0);

  const handleApplicationSubmit = () => {
    // Increment notifications for admin
    const current = parseInt(localStorage.getItem('notifications') || '0');
    localStorage.setItem('notifications', (current + 1).toString());
    
    // Trigger refresh of application list
    setRefreshApplications(prev => prev + 1);
  };

  // Check for notifications on mount (simulating real-time updates)
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          // Set notifications based on role
          if (userRole === 'printing_staff') {
             setNotifications(data.pending_prints || 0);
          } else {
             setNotifications(data.pending || 0);
          }
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

  return (
    <NotificationProvider>
      <NotificationContainer />
      <HashRouter>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {userRole === 'admin' || userRole === 'staff' || userRole === 'mayor' || userRole === 'printing_staff' ? (
            <div className={`flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500 ${isLoggingOut ? 'opacity-0 scale-95 transform' : 'opacity-100'}`}>
              <Sidebar 
                onLogout={handleLogoutRequest} 
                isOpen={sidebarOpen} 
                userRole={userRole} 
                onItemClick={closeSidebarOnMobile}
              />
              {/* Overlay for mobile when sidebar is open */}
              {isMobile && sidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-49 lg:hidden"
                  onClick={toggleSidebar}
                />
              )}
              <main className={`flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-700 ease-out transition-all duration-300 print:ml-0 ${
                sidebarOpen ? 'lg:ml-64 ml-0' : 'lg:ml-0 ml-0'
              }`}>
                <Header 
                  notifications={notifications} 
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                  onToggleSidebar={toggleSidebar}
                  user={userData}
                />
                <div className="p-4 md:p-8 print:p-0">
                  <Routes>
                    <Route path="/" element={<Dashboard refreshTrigger={refreshApplications} />} />
                    <Route path="/new" element={<NewApplication onSubmit={handleApplicationSubmit} />} />
                    <Route path="/edit/:id" element={<NewApplication onSubmit={handleApplicationSubmit} />} />
                    <Route path="/list" element={<ApplicationList refreshTrigger={refreshApplications} />} />
                    <Route path="/id-cards" element={<IDCardManagement />} />
                    <Route path="/registry" element={<SoloParentRegistry />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/users" element={userRole === 'admin' ? <UsersPage /> : <Navigate to="/" replace />} />
                    <Route path="/logs" element={userRole === 'admin' ? <SystemLogs /> : <Navigate to="/" replace />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/print/:id" element={<PrintApplicationForm />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          ) : (
            <div className={`transition-opacity duration-500 ${isLoggingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
               <UserPortal 
                 onLogout={handleLogoutRequest} 
                 onApplicationSubmit={handleApplicationSubmit}
                 user={userData}
               />
            </div>
          )}
          
          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <LogOut size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Logout</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to end your session?</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 justify-end">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={performLogout}
                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 text-sm flex items-center space-x-2"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Logout Animation Overlay */}
          {isLoggingOut && (
            <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-700">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                {/* Logo Row */}
                <div className="flex items-center space-x-6 mb-12 animate-in slide-in-from-bottom-8 duration-700 fade-in">
                  <div className="w-20 h-20 bg-white rounded-full p-1 shadow-2xl shadow-white/10">
                    <img src={logo} alt="Pagsanjan Logo" className="w-full h-full object-contain rounded-full" />
                  </div>
                  <div className="w-20 h-20 bg-white rounded-full p-1 shadow-2xl shadow-white/10">
                    <img src={mswdoLogo} alt="MSWDO Logo" className="w-full h-full object-contain rounded-full" />
                  </div>
                </div>

                <div className="text-center space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-200 fade-in">
                  <h2 className="text-5xl font-bold text-white tracking-tight">
                    Logging Out
                  </h2>
                  <p className="text-slate-400 text-xl font-light">
                    Thank you for using the Solo Parent Information System.
                  </p>
                </div>

                <div className="mt-16 flex flex-col items-center space-y-4 animate-in fade-in duration-1000 delay-500">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-slate-500 text-sm font-medium uppercase tracking-widest animate-pulse">
                    Securely Clearing Session...
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-8 text-center text-slate-600 text-xs animate-in fade-in duration-1000 delay-700">
                <p>&copy; {new Date().getFullYear()} Municipality of Pagsanjan. All rights reserved.</p>
              </div>
            </div>
          )}
        </>
      )}
    </HashRouter>
    </NotificationProvider>
  );
};

export default App;
