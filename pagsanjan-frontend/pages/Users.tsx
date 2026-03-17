import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  ShieldCheck, 
  Users, 
  MoreVertical, 
  Trash2,
  RefreshCw,
  Filter,
  User as UserIcon,
  Loader2,
  Lock,
  X
} from 'lucide-react';
import { API_CONFIG } from '../config';

interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'user' | 'mayor' | 'printing_staff';
  status: 'active' | 'inactive';
  avatar?: string;
  created_at: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role: 'staff',
    confirmPassword: '' // Added for validation if needed, though backend handles it
  });

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.LIST}`;
      
      // Map tabs to roles
      const roleMap: Record<string, string> = {
        'admins': 'admin',
        'staff': 'staff'
      };

      if (activeTab !== 'all' && roleMap[activeTab]) {
        url += `?role=${roleMap[activeTab]}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Creating user at:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.CREATE}`);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: formData.role
        })
      });

      if (response.ok) {
        setIsEnrollModalOpen(false);
        setFormData({
            full_name: '',
            email: '',
            username: '',
            password: '',
            role: 'staff',
            confirmPassword: ''
        });
        fetchUsers();
        alert('User created successfully');
      } else {
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            alert('Session expired. Please log in again.');
            window.location.reload();
            return;
        }
        const errorText = await response.text();
        let errorMessage = 'Failed to create user';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        console.error('Server response error:', errorMessage);
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`An error occurred: ${error.message || 'Check console for details'}. Please ensure the backend server is running.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeletePassword('');
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.DELETE(userToDelete.id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePassword })
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setDeletePassword('');
        alert('User deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user', error);
      alert('An error occurred while deleting the user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-700';
      case 'staff': return 'bg-cyan-100 text-cyan-700';
      case 'printing_staff': return 'bg-purple-100 text-purple-700';
      case 'user': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Accounts Management</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Unified access control for Admins, Staff, and PWD Members.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'admins', label: 'Administrators' },
            { id: 'staff', label: 'Staff' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="ml-2 bg-slate-900 text-white px-1.5 py-0.5 rounded-md text-[10px]">
                  {loading ? '...' : users.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
           <button 
             onClick={fetchUsers}
             className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white"
             title="Refresh"
           >
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <button 
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex-1 md:flex-none bg-violet-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center space-x-2 active:scale-95"
          >
            <UserPlus size={18} />
            <span>Create New Account</span>
          </button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, ID or username..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Identity</th>
                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Role</th>
                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Unit/Area</th>
                <th className="text-left py-3 px-4 md:py-4 md:px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 md:py-4 md:px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <div className="flex justify-center items-center space-x-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 md:py-4 md:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 group-hover:bg-white group-hover:shadow-md transition-all">
                          {getInitials(user.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors truncate max-w-[150px] md:max-w-none">{user.full_name}</p>
                          <p className="text-xs text-slate-400 font-mono">ID: {user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 md:py-4 md:px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 md:py-4 md:px-6 text-sm text-slate-500 font-medium">
                      MSWDO - Main Office
                    </td>
                    <td className="py-3 px-4 md:py-4 md:px-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className="text-xs font-bold text-slate-600 uppercase">{user.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 md:py-4 md:px-6 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                        <button 
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users size={20} className="text-slate-300" />
                    </div>
                    <span className="text-xs font-medium">No users found</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Visual only for now) */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">
                Showing <span className="text-slate-900 font-bold">{filteredUsers.length}</span> results
            </p>
            <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-lg">1</button>
                <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600">Next</button>
            </div>
        </div>
      </div>

      {/* Create User Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEnrollModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 bg-slate-900 flex justify-between items-start shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <UserPlus className="text-white" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Create New Account</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Add new admin or staff to the system</p>
                </div>
              </div>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input 
                        required
                        type="text" 
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all" 
                        placeholder="e.g. Juan Dela Cruz" 
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all" 
                        placeholder="email@pagsanjan.gov.ph" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                        <input 
                            required
                            type="text" 
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all" 
                            placeholder="username" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                        <select 
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as any})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all appearance-none"
                        >
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            <option value="printing_staff">Printing Staff</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                    <input 
                        required
                        type="password" 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-violet-500 transition-all" 
                        placeholder="••••••••" 
                    />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button 
                        type="button"
                        onClick={() => setIsEnrollModalOpen(false)}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center space-x-2"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        <span>Create Account</span>
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-rose-50 p-6 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-900">Confirm Deletion</h3>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Security Check Required</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-rose-400 hover:text-rose-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={confirmDeleteUser} className="p-6 space-y-4">
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-sm text-rose-800 font-medium">
                  You are about to delete the account for <span className="font-bold">{userToDelete.full_name}</span>.
                  This action cannot be undone.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Enter Admin Password to Confirm
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    type="password" 
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none text-sm font-bold text-slate-700 focus:bg-white focus:border-rose-500 transition-all placeholder:text-slate-400" 
                    placeholder="Admin Password"
                    autoFocus
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isDeleting || !deletePassword}
                  className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:shadow-none flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Delete Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
