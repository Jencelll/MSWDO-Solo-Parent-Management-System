import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, Info, Fingerprint, Scale, CheckCircle2, Loader2, Mail, Phone, MapPin, Sparkles, CircleAlert } from 'lucide-react';
import logo from '../assets/Pagsanjan.png';
import mswdoLogo from '../assets/MSWDOLogo.jpg';
import arko from '../assets/arko.jpg';
import { API_CONFIG } from '../config';

interface LoginProps {
  onLogin: (role: string, user?: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  // const [loginRole, setLoginRole] = useState<'admin' | 'user'>('user'); // Unified login removes manual role selection
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For admin login, keep the hardcoded check for now
      /*
      if (loginRole === 'admin') {
        // Check for hardcoded accounts
        if (username === 'admin' && password === 'pagsanjan2024') {
          setAuthSuccess(true);
          setTimeout(() => {
            onLogin('admin', { full_name: 'Administrator', username: 'admin' });
          }, 2000);
          return;
        }
        
        setError('Invalid Administrator credentials');
        setLoading(false);
        return;
      }
      */

      // Use the unified login endpoint
      const loginEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.UNIFIED_LOGIN}`;

      // Try Laravel API login
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store the authentication token
        if (data.token) {
          localStorage.setItem('token', data.token); // Store as 'token' to match other components
          localStorage.setItem('auth_token', data.token); // Keep for compatibility
        }
        
        setAuthSuccess(true);
        setTimeout(() => {
          onLogin(data.user.role, data.user);
        }, 2000);
      } else {
        // If login fails (401), check if this is a legacy local user and migrate them
        if (response.status === 401) {
          try {
            const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const localUser = localUsers.find((u: any) => 
              (u.email === username || u.username === username) && u.password === password
            );

            if (localUser) {
              console.log('Found legacy user, migrating to backend...', localUser);
              setLoading(true); // Keep loading state

              // Attempt to register this user in the backend
              const regResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                body: JSON.stringify({
                  full_name: localUser.name || localUser.username,
                  email: localUser.email,
                  username: localUser.username || localUser.email,
                  password: localUser.password,
                  password_confirmation: localUser.password
                }),
              });

              if (regResponse.ok) {
                const regData = await regResponse.json();
                console.log('Migration successful', regData);
                
                // Store token
                if (regData.token) {
                  localStorage.setItem('token', regData.token);
                  localStorage.setItem('auth_token', regData.token);
                }

                setAuthSuccess(true);
                setTimeout(() => {
                  onLogin('user', regData.user);
                }, 2000);
                return; // Exit success
              } else {
                console.error('Migration failed', await regResponse.text());
                // Fall through to error display
              }
            }
          } catch (migError) {
            console.error('Migration error:', migError);
          }
        }

        // Handle validation errors from Laravel
        const data = await response.json();
        console.log('Login failed:', data);
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('. ');
          setError(errorMessages);
        } else {
          setError(data.message || 'Invalid credentials');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (regPassword.length < 8 || !/\d/.test(regPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(regPassword)) {
      setError('Password must be at least 8 characters with a number and special character');
      setLoading(false);
      return;
    }

    try {
      // Try to register via API first
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          full_name: regName,
          email: regEmail,
          username: regEmail, // Use email as username for simplicity
          password: regPassword,
          password_confirmation: regConfirmPassword
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRegSuccess(true);
        setLoading(false);
        setTimeout(() => {
          setRegSuccess(false);
          setView('login');
          setUsername(regEmail); // Auto-fill email/username
          setError('Registration successful! Please log in.');
        }, 2000);
      } else {
        // Handle validation errors from Laravel
        const data = await response.json();
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('. ');
          setError(errorMessages);
        } else {
          setError(data.message || 'Registration failed');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration API error:', error);
      // Fallback to localStorage if API is not available
      try {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        // Check if user already exists
        if (users.some((u: any) => u.email === regEmail)) {
          setError('User already exists');
          setLoading(false);
          return;
        }

        users.push({
          name: regName,
          email: regEmail,
          username: regEmail, // Use email as username for simplicity
          password: regPassword,
          role: 'user'
        });
        localStorage.setItem('registeredUsers', JSON.stringify(users));

        setRegSuccess(true);
        setLoading(false);
        setTimeout(() => {
          setRegSuccess(false);
          setView('login');
          setUsername(regEmail); // Auto-fill email/username
          setError('Registration successful! Please log in.');
        }, 2000);
      } catch (fallbackError) {
        console.error('Fallback registration error:', fallbackError);
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 font-sans overflow-y-auto overflow-x-hidden">
      {/* Full Page Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={arko} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-violet-950/80 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full min-h-[500px] md:min-h-[600px] animate-in fade-in zoom-in-95 duration-700 border border-white/20 dark:border-slate-700/50">
        
        {/* Left Panel - Branding (Deep Blue/Violet) */}
        <div className="w-full md:w-5/12 relative p-6 md:p-12 text-white flex flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-900/90 to-indigo-900/90 shrink-0">
          
          <div className="relative z-10">
            {/* Logos */}
            <div className="flex items-center space-x-4 mb-4 md:mb-12">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-lg">
                <img src={logo} alt="Pagsanjan Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-lg">
                <img src={mswdoLogo} alt="MSWDO Logo" className="w-full h-full object-contain rounded-full" />
              </div>
            </div>
            
            {/* Title Block */}
            <div className="space-y-1 mb-4 md:mb-8">
              <p className="text-[8px] md:text-[10px] font-bold tracking-widest uppercase opacity-80">Republic of the Philippines</p>
              <h1 className="text-xl md:text-4xl font-bold leading-tight">
                Municipality of<br />
                Pagsanjan
              </h1>
            </div>
            
            <div className="w-12 h-1 bg-yellow-400 mb-4 md:mb-6"></div>
            
            <h2 className="text-sm md:text-lg font-medium leading-relaxed opacity-90">
              Municipal Social Welfare and Development Office
            </h2>
            <p className="text-[10px] md:text-xs mt-2 opacity-70 max-w-xs hidden md:block">
              Empowering solo parents through accessible digital services and streamlined social welfare programs.
            </p>
          </div>

          <div className="hidden md:block">
            <p className="text-[10px] opacity-60">© {new Date().getFullYear()} Municipal Social Welfare and Development Office Pagsanjan</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-7/12 p-6 md:p-12 bg-white dark:bg-slate-900 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            {/* Role Selection Toggle - REMOVED for Unified Login */}
            {/* 
            {!authSuccess && (
            <div className="flex justify-center mb-8">
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex items-center w-full max-w-[200px] relative transition-colors duration-300">
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-full shadow-sm transition-all duration-300 ease-out ${loginRole === 'admin' ? 'left-[calc(50%+2px)]' : 'left-1'}`}
                ></div>
                
                <button 
                  type="button"
                  onClick={() => setLoginRole('user')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 text-[10px] font-bold uppercase tracking-widest relative z-10 transition-colors duration-300 ${loginRole === 'user' ? 'text-violet-900 dark:text-violet-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <User size={12} />
                  <span>User</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setLoginRole('admin')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 text-[10px] font-bold uppercase tracking-widest relative z-10 transition-colors duration-300 ${loginRole === 'admin' ? 'text-violet-900 dark:text-violet-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <Shield size={12} />
                  <span>Admin</span>
                </button>
              </div>
            </div>
            )}
            */}

            {authSuccess ? (
              <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700 h-full relative">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-violet-400/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl animate-pulse delay-700"></div>
                </div>

                <div className="relative z-10 mb-8">
                  <div className="w-28 h-28 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 animate-[bounce_2s_infinite]">
                    <CheckCircle2 size={56} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-md animate-ping duration-1000">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-md">
                    <Sparkles size={16} className="text-white" />
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                  Welcome Back!
                </h2>
                
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-xs mx-auto leading-relaxed">
                  Authentication successful. Establishing secure connection...
                </p>

                {/* Progress Bar */}
                <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 animate-[width_2s_ease-in-out_forwards]" style={{ width: '100%' }}></div>
                </div>
                
                <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 animate-pulse">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Loading Dashboard</span>
                </div>
              </div>
            ) : view === 'login' ? (
              <>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sign In</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10">Enter your credentials to access the secure portal.</p>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email or Username</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="e.g., admin"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-12 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium py-3 px-4 rounded-lg flex items-center border border-red-100 dark:border-red-900/30">
                      <Info size={14} className="mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-900 dark:bg-violet-700 text-white py-4 rounded-full font-bold text-sm tracking-wide hover:bg-violet-800 dark:hover:bg-violet-600 transition-all shadow-lg shadow-violet-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group mt-8"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Not registered yet?</p>
                  <button 
                    onClick={() => setView('register')}
                    className="flex items-center justify-center space-x-2 w-full py-3 border border-slate-300 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                  >
                    <User size={16} />
                    <span>Apply for Solo Parent ID</span>
                  </button>
                  
                  <div className="mt-4">
                    <a href="#" className="text-xs text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Forgot your password?</a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setView('login')}
                  className="mb-6 flex items-center text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium"
                >
                  <ArrowRight size={16} className="rotate-180 mr-2" />
                  Back to Login
                </button>

                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Register to start your Solo Parent ID application.</p>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="Juan Dela Cruz"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input 
                        type="email" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="juan@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 mb-4">
                    <div className="flex items-center space-x-2 text-violet-900 dark:text-violet-400 mb-2">
                      <Lock size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Account Password</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      Create a password to access your Solo Parent portal account. Must be at least 8 characters with a number and special character.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Password *</label>
                        <div className="relative">
                          <input 
                            type={showRegPassword ? "text" : "password"} 
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className={`w-full bg-slate-200/50 dark:bg-slate-800/50 border ${(!regPassword || (regPassword.length >= 8 && /\d/.test(regPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(regPassword))) ? 'border-slate-200 dark:border-slate-700 focus:border-violet-500' : 'border-red-300 dark:border-red-700 focus:border-red-500'} rounded-xl py-3 px-4 pr-10 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder:text-slate-400`}
                            placeholder="Min 8 chars, 1 number, 1 special"
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confirm Password *</label>
                        <div className="relative">
                          <input 
                            type={showRegConfirmPassword ? "text" : "password"} 
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="w-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 pr-10 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
                            placeholder="Re-enter password"
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 pl-1">
                      <div className={`flex items-center space-x-2 text-xs font-medium transition-colors ${regPassword.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {regPassword.length >= 8 ? <CheckCircle2 size={12} /> : <CircleAlert size={12} />}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs font-medium transition-colors ${/\d/.test(regPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {/\d/.test(regPassword) ? <CheckCircle2 size={12} /> : <CircleAlert size={12} />}
                        <span>Contains a number</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs font-medium transition-colors ${/[!@#$%^&*(),.?":{}|<>]/.test(regPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(regPassword) ? <CheckCircle2 size={12} /> : <CircleAlert size={12} />}
                        <span>Contains a special character</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium py-3 px-4 rounded-lg flex items-center border border-red-100 dark:border-red-900/30">
                      <Info size={14} className="mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {regSuccess && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium py-3 px-4 rounded-lg flex items-center border border-green-100 dark:border-green-900/30">
                      <CheckCircle2 size={14} className="mr-2 flex-shrink-0" />
                      Registration successful! Redirecting to login...
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading || regSuccess}
                    className="w-full bg-violet-900 dark:bg-violet-700 text-white py-4 rounded-full font-bold text-sm tracking-wide hover:bg-violet-800 dark:hover:bg-violet-600 transition-all shadow-lg shadow-violet-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Register Account</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                   <p className="text-sm text-slate-500 dark:text-slate-400">
                     Already have an account?{' '}
                     <button onClick={() => setView('login')} className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
                       Sign In
                     </button>
                   </p>
                </div>
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
