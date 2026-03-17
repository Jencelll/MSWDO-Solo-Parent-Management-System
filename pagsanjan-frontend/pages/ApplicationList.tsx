
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  FileCheck, 
  FileX, 
  UserPlus,
  Edit,
  Copy,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  Home,
  GraduationCap,
  Banknote,
  Users, 
  Trash, 
  Printer,
  IdCard
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SOLO_PARENT_CATEGORIES, BENEFIT_CODES } from '../constants';
import { API_CONFIG } from '../config';
import IDCardModal from '../components/IDCardModal';

interface ApplicationListProps {
  refreshTrigger?: number;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ refreshTrigger = 0 }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  
  // Action Modal States
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [updateQualificationModalOpen, setUpdateQualificationModalOpen] = useState(false);
  const [disapproveModalOpen, setDisapproveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<number | null>(null);
  const [actionCategory, setActionCategory] = useState('');
  const [actionBenefit, setActionBenefit] = useState<string[]>([]);
  const [actionIdNumber, setActionIdNumber] = useState('');
  const [actionRemarks, setActionRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Print ID Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const handleVerifyDocument = async (docId: number, status: 'Verified' | 'Rejected') => {
    if (!selectedApplication) return;
    
    // Optimistic update
    const updatedDocuments = selectedApplication.documents.map((doc: any) => 
        doc.id === docId ? { ...doc, status } : doc
    );
    setSelectedApplication({ ...selectedApplication, documents: updatedDocuments });

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/applications/${selectedApplication.id}/documents/${docId}/verify`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        // Revert on failure if needed
        const errorText = await res.text();
        console.error("Failed to update document status", res.status, errorText);
        alert(`Failed to update document: ${res.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Error updating document status:", error);
      alert(`Error updating document: ${error}`);
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    setIsProcessing(true);
    
    // Clear any previous error states if needed
    console.log('Approving application:', selectedApplication.id);
    console.log('Category:', actionCategory, 'Benefit:', actionBenefit);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/applications/${selectedApplication.id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category_code: actionCategory,
          benefit_code: actionBenefit.join(','),
          id_number: actionIdNumber
        })
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Approval success:', data);
        setApproveModalOpen(false);
        setViewModalOpen(false);
        setRefreshKey(prev => prev + 1); // Trigger refresh
        alert('Application approved successfully!');
      } else {
        const errorText = await res.text();
        console.error("Failed to approve", res.status, errorText);
        alert(`Failed to approve: ${res.status}\n${errorText}`);
      }
    } catch (error) {
      console.error("Error approving:", error);
      alert(`Error approving: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateQualification = async () => {
    if (!selectedApplication) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/applications/${selectedApplication.id}/update-qualification`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category_code: actionCategory,
          benefit_code: actionBenefit.join(','),
          id_number: actionIdNumber
        })
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Update qualification success:', data);
        setUpdateQualificationModalOpen(false);
        setViewModalOpen(false);
        setRefreshKey(prev => prev + 1);
        alert('Qualification updated successfully!');
      } else {
        const errorText = await res.text();
        console.error("Failed to update qualification", res.status, errorText);
        alert(`Failed to update qualification: ${res.status}\n${errorText}`);
      }
    } catch (error) {
      console.error("Error updating qualification:", error);
      alert(`Error updating qualification: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisapprove = async () => {
    if (!selectedApplication) return;
    setIsProcessing(true);
    
    console.log('Disapproving application:', selectedApplication.id);
    console.log('Remarks:', actionRemarks);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/applications/${selectedApplication.id}/disapprove`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ remarks: actionRemarks })
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Disapproval success:', data);
        setDisapproveModalOpen(false);
        setViewModalOpen(false);
        setRefreshKey(prev => prev + 1);
        alert('Application disapproved successfully!');
      } else {
        const errorText = await res.text();
        console.error("Failed to disapprove", res.status, errorText);
        alert(`Failed to disapprove: ${res.status}\n${errorText}`);
      }
    } catch (error) {
      console.error("Error disapproving:", error);
      alert(`Error disapproving: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (applicationId: number) => {
    setApplicationToDelete(applicationId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!applicationToDelete) return;
    setIsProcessing(true);

    try {
      const baseUrl = API_CONFIG?.BASE_URL || '';
      const url = `${baseUrl}/api/applications/${applicationToDelete}`;
      console.log('Attempting to delete application:', url);

      // Check for token
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        alert('You are not authenticated. Please log in again.');
        return;
      }

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        setApplications(prev => prev.filter(app => app.id !== applicationToDelete));
        setDeleteModalOpen(false);
        setApplicationToDelete(null);
      } else {
        const errorText = await res.text();
        console.error("Failed to delete application", res.status, errorText);
        alert(`Failed to delete application: ${res.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert(`Error deleting application: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewApplication = async (applicationId: number) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/applications/${applicationId}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedApplication(data);
        setViewModalOpen(true);
      } else {
        console.error("Failed to fetch application details", res.status);
      }
    } catch (error) {
      console.error("Failed to fetch application details", error);
    }
  };

  const handlePrintID = async (applicationId: number) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Need full details for ID card
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/applications/${applicationId}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setPrintData(data);
        setPrintModalOpen(true);
      } else {
        console.error("Failed to fetch data for ID printing", res.status);
      }
    } catch (error) {
      console.error("Failed to fetch data for ID printing", error);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        if (filter !== 'All') params.append('status', filter);
        if (searchQuery) params.append('search', searchQuery);

        const res = await fetch(`${API_CONFIG.BASE_URL}/api/applications?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data.data || []);
          setPagination({
            current_page: data.current_page || 1,
            last_page: data.last_page || 1,
            total: data.total || 0,
            from: data.from || 0,
            to: data.to || 0
          });
        } else {
          console.error("Failed to fetch applications", res.status);
        }
      } catch (error) {
        console.error("Failed to fetch applications", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [refreshTrigger, filter, searchQuery, currentPage, refreshKey]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Application Management</h2>
          <p className="text-slate-500 dark:text-slate-400">View and process solo parent ID requests.</p>
        </div>
        <Link 
          to="/new" 
          className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          <span>New Applicant</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 w-full overflow-x-auto pb-2 xl:pb-0 no-scrollbar">
            {['All', 'Pending', 'Approved', 'Disapproved'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === tab ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Quick find..." 
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchParams(prev => {
                    const newParams = new URLSearchParams(prev);
                    if (query) {
                      newParams.set('search', query);
                    } else {
                      newParams.delete('search');
                    }
                    return newParams;
                  });
                  setCurrentPage(1);
                }}
                className="w-full sm:w-64 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/10 transition-all dark:text-white dark:placeholder-slate-400" 
              />
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none justify-center p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center">
                <Filter size={20} />
              </button>
              <button className="flex-1 sm:flex-none justify-center flex items-center space-x-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-600">
                <Download size={18} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px] md:min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-700">
                <th className="px-4 py-3 md:px-6 md:py-4">Applicant Name</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Barangay</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Case Number</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Submission Date</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Dependents</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {applications.length > 0 ? (
                applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0 overflow-hidden">
                        {(() => {
                            const photoPath = app.photo_path || app.applicant?.photo_path;
                            if (photoPath) {
                                const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
                                const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
                                const fullUrl = photoPath.startsWith('http') ? photoPath : `${baseUrl}${path}`;
                                return (
                                  <img 
                                    src={fullUrl} 
                                    alt="Applicant" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).parentElement!.innerText = app.applicant?.first_name?.charAt(0) || 'A';
                                    }}
                                  />
                                );
                            }
                            return app.applicant?.first_name?.charAt(0) || 'A';
                        })()}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px] md:max-w-none">
                        {app.applicant?.first_name} {app.applicant?.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">{app.applicant?.barangay}</td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300 whitespace-nowrap">{app.case_number}</span>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(app.created_at || app.date_applied).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      app.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      app.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      app.status === 'Disapproved' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    {(() => {
                      const members = app.applicant?.family_members || [];
                      const pwdCount = members.filter((m: any) => m.is_pwd || m.isPwd === 'Yes' || m.isPwd === true).length;
                      const qualifiedCount = members.filter((m: any) => {
                        const isPwd = m.is_pwd || m.isPwd === 'Yes' || m.isPwd === true;
                        if (isPwd) return true;
                        
                        let age = m.age;
                        if (!age && m.dob) {
                            const birthDate = new Date(m.dob);
                            const today = new Date();
                            age = today.getFullYear() - birthDate.getFullYear();
                            const mDiff = today.getMonth() - birthDate.getMonth();
                            if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) age--;
                        }
                        return age < 23;
                      }).length;
                      
                      return (
                        <div className="flex flex-col text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{qualifiedCount} Qualified</span>
                          {pwdCount > 0 && (
                            <span className="text-violet-600 dark:text-violet-400 font-medium">({pwdCount} PWD)</span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleViewApplication(app.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {app.status === 'Approved' && (
                        <button 
                          onClick={() => handlePrintID(app.id)}
                          className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          title="Print ID Card"
                        >
                          <IdCard size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/edit/${app.id}`)}
                        className="p-2 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                        title="Edit Application"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(app.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="Delete Application"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p>No applications found.</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Database connection required.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Showing {pagination.from} to {pagination.to} of {pagination.total} results</p>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold bg-white dark:bg-slate-700 transition-colors ${currentPage === 1 ? 'text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed' : 'text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
              disabled={currentPage === pagination.last_page}
              className={`px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold bg-white dark:bg-slate-700 transition-colors ${currentPage === pagination.last_page ? 'text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed' : 'text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Modal - Redesigned */}
      {viewModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-white dark:bg-slate-900 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Application Details</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Review applicant information and status</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedApplication.status === 'Approved' && (
                  <button 
                    onClick={() => {
                      setViewModalOpen(false);
                      handlePrintID(selectedApplication.id);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-md shadow-emerald-600/20 text-sm whitespace-nowrap"
                  >
                    <IdCard size={16} />
                    <span>Print ID</span>
                  </button>
                )}
                <button 
                  onClick={() => {
                    window.open(`#/print/${selectedApplication.id}`, '_blank');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-md shadow-blue-600/20 text-sm whitespace-nowrap"
                >
                  <Printer size={16} />
                  <span>Print Form</span>
                </button>
                <button 
                  onClick={() => {
                    setViewModalOpen(false);
                    navigate(`/edit/${selectedApplication.id}`);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold transition-colors shadow-md shadow-violet-600/20 text-sm whitespace-nowrap"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Applicant Summary Banner */}
            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-6 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-lg">
                  {selectedApplication.applicant?.first_name?.charAt(0) || 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-white text-lg">
                    {selectedApplication.applicant?.first_name} {selectedApplication.applicant?.last_name}
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-sm font-medium uppercase tracking-wider text-slate-400">Case:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedApplication.case_number}</span>
                <Copy size={14} className="cursor-pointer hover:text-violet-600 transition-colors" />
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                 selectedApplication.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                 selectedApplication.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {selectedApplication.status === 'Approved' && <CheckCircle size={14} className="inline mr-1" />}
                {selectedApplication.status}
              </span>

              {selectedApplication.benefit_code && selectedApplication.benefit_code.includes('A') && (
                <span className="px-3 py-1 rounded-full text-sm font-bold border bg-indigo-50 text-indigo-600 border-indigo-200">
                  <Banknote size={14} className="inline mr-1" />
                  Subsidy Qualified
                </span>
              )}

              <div className="flex-1 hidden md:block"></div>

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 ml-auto">
                <Calendar size={16} />
                <span className="text-sm font-medium">Applied on {new Date(selectedApplication.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-900 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Personal Information */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                    <User className="text-violet-600 dark:text-violet-400" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Full Name</label>
                      <p className="font-bold text-slate-900 dark:text-white truncate" title={`${selectedApplication.applicant?.first_name} ${selectedApplication.applicant?.last_name}`}>
                        {selectedApplication.applicant?.first_name} {selectedApplication.applicant?.middle_name} {selectedApplication.applicant?.last_name}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Date of Birth</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {new Date(selectedApplication.applicant?.dob).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Sex</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedApplication.applicant?.sex}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Place of Birth</label>
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {selectedApplication.applicant?.place_of_birth || 'Not Specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                    <MapPin className="text-violet-600 dark:text-violet-400" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Contact Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Address</label>
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {selectedApplication.applicant?.address}, {selectedApplication.applicant?.barangay}, Pagsanjan, Laguna
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Barangay</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedApplication.applicant?.barangay}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Contact Number</label>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <p className="font-bold text-slate-900 dark:text-white font-mono">
                          {selectedApplication.applicant?.contact_number}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Email Address</label>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {selectedApplication.applicant?.email_address || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Information */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                    <Briefcase className="text-violet-600 dark:text-violet-400" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Application Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Case Number</label>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
                        {selectedApplication.case_number}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Status</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                         selectedApplication.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                         selectedApplication.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                         'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {selectedApplication.status}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Date Applied</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {new Date(selectedApplication.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Expiration Date</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                         {selectedApplication.expiration_date ? new Date(selectedApplication.expiration_date).toLocaleDateString() : 
                          new Date(new Date(selectedApplication.created_at).setFullYear(new Date(selectedApplication.created_at).getFullYear() + 1)).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Qualified Benefits</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.benefit_code ? (
                          selectedApplication.benefit_code.split(',').filter((code: string) => code === 'A').length > 0 ? (
                            selectedApplication.benefit_code.split(',').map((code: string) => (
                              <span key={code} className={`px-2 py-1 rounded text-xs font-bold ${
                                code === 'A' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' :
                                code === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {code === 'A' ? 'Subsidy + PhilHealth + Housing' : 
                                 code === 'B' ? '10% Discount + VAT Exemption' : code}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-sm italic">Standard Benefits Only</span>
                          )
                        ) : (
                          <span className="text-slate-500 text-sm italic">No benefits assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                    <GraduationCap className="text-violet-600 dark:text-violet-400" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Additional Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Educational Attainment</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedApplication.applicant?.educational_attainment || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Occupation</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedApplication.applicant?.occupation || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Monthly Income</label>
                      <p className="font-bold text-slate-900 dark:text-white font-mono">
                        ₱{selectedApplication.applicant?.monthly_income?.toLocaleString() || '0.00'}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Employment Status</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedApplication.applicant?.employment_status || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Housing Information */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                    <Home className="text-violet-600 dark:text-violet-400" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Housing Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">House Ownership</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedApplication.applicant?.house_ownership_status || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">House Condition</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedApplication.applicant?.house_condition || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Family Composition (Full Width) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow mb-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                  <Users className="text-violet-600 dark:text-violet-400" size={20} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Family Composition</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Relationship</th>
                        <th className="px-3 py-2">Age</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Education</th>
                        <th className="px-3 py-2">Occupation</th>
                        <th className="px-3 py-2">PWD</th>
                        <th className="px-3 py-2 text-right">Monthly Income</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                      {selectedApplication.applicant?.family_members && selectedApplication.applicant.family_members.length > 0 ? (
                        selectedApplication.applicant.family_members.map((member: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{member.full_name}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{member.relationship}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{member.age || (member.dob ? new Date().getFullYear() - new Date(member.dob).getFullYear() : '')}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{member.civil_status || 'Single'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{member.educational_attainment || 'Elementary'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{member.occupation || 'N/A'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{member.is_pwd ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300 text-right">₱{Number(member.monthly_income || 0).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-3 py-4 text-center text-slate-400 italic">No family members listed</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Documents Section (Full Width) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                  <FileCheck className="text-violet-600 dark:text-violet-400" size={20} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Documents</h3>
                </div>
                <div className="space-y-2">
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    selectedApplication.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                            <FileCheck size={16} />
                          </div>
                          <div className="min-w-0">
                            <a 
                              href={doc.file_path.startsWith('/storage/') ? doc.file_path : doc.file_path.startsWith('storage/') ? `/${doc.file_path}` : `/storage/${doc.file_path}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-bold text-slate-900 dark:text-white text-sm truncate hover:text-violet-600 block"
                            >
                              {doc.type}
                            </a>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(doc.created_at).toLocaleDateString()} • 
                              <span className={`ml-1 font-bold ${
                                doc.status === 'Verified' ? 'text-emerald-600 dark:text-emerald-400' :
                                doc.status === 'Rejected' ? 'text-rose-600 dark:text-rose-400' :
                                'text-slate-500 dark:text-slate-400'
                              }`}>{doc.status || 'Pending'}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleVerifyDocument(doc.id, 'Verified')}
                            className={`p-1.5 rounded transition-colors ${
                              doc.status === 'Verified' 
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30'
                            }`}
                            title="Verify"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleVerifyDocument(doc.id, 'Rejected')}
                            className={`p-1.5 rounded transition-colors ${
                              doc.status === 'Rejected' 
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                              : 'text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30'
                            }`}
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
                      <FileX size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-slate-400 text-sm">No files uploaded</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>

               {/* Action Buttons based on Status */}
               {selectedApplication.status === 'Approved' && (
                  <button 
                    onClick={() => {
                      setActionCategory(selectedApplication.category_code || '');
                      setActionBenefit(selectedApplication.benefit_code ? selectedApplication.benefit_code.split(',') : []);
                      setActionIdNumber(selectedApplication.id_number || '');
                      setUpdateQualificationModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center gap-2"
                  >
                    <Banknote size={18} />
                    <span>Update Details</span>
                  </button>
               )}

               {(selectedApplication.status === 'Pending' || selectedApplication.status === 'Disapproved') && (
                  <>
                    {selectedApplication.status === 'Pending' && (
                        <button 
                          onClick={() => {
                            setActionRemarks('');
                            setDisapproveModalOpen(true);
                          }}
                          className="px-6 py-2.5 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <XCircle size={18} />
                          <span>Disapprove</span>
                        </button>
                    )}
                    <button 
                      onClick={() => {
                        setActionCategory('');
                        setActionBenefit([]);
                        setActionIdNumber('');
                        setApproveModalOpen(true);
                      }}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      <span>{selectedApplication.status === 'Disapproved' ? 'Re-Approve' : 'Approve Application'}</span>
                    </button>
                  </>
               )}

              <button 
                onClick={() => {
                  setViewModalOpen(false);
                  navigate(`/edit/${selectedApplication.id}`);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Edit size={18} />
                <span>Edit Application</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Approve Application</h3>
              <button 
                onClick={() => setApproveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Please assign a category and benefit code to approve this application for 
                <span className="font-bold text-slate-900 dark:text-white"> {selectedApplication?.applicant?.first_name} {selectedApplication?.applicant?.last_name}</span>.
              </p>
              
              <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">ID Number</label>
                    <input 
                      type="text"
                      value={actionIdNumber}
                      onChange={(e) => setActionIdNumber(e.target.value)}
                      placeholder="Enter ID Number"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Category Code</label>
                  <select 
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {SOLO_PARENT_CATEGORIES.map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.code} - {cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Benefit Code</label>
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                    {BENEFIT_CODES.map(ben => (
                      <label key={ben.code} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                        <input 
                          type="checkbox"
                          checked={actionBenefit.includes(ben.code)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                                setActionBenefit(prev => {
                                    if (prev.length >= 2) return prev;
                                    return [...prev, ben.code];
                                });
                            } else {
                              setActionBenefit(prev => prev.filter(c => c !== ben.code));
                            }
                          }}
                          disabled={!actionBenefit.includes(ben.code) && actionBenefit.length >= 2}
                          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{ben.code} - {ben.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                disabled={!actionCategory || actionBenefit.length === 0 || !actionIdNumber || isProcessing}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
              >
                {isProcessing ? <span>Processing...</span> : <span>Confirm Approval</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Qualification Modal */}
      {updateQualificationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Update Details</h3>
              <button 
                onClick={() => setUpdateQualificationModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Update the qualification category, benefit code, or ID number for 
                <span className="font-bold text-slate-900 dark:text-white"> {selectedApplication?.applicant?.first_name} {selectedApplication?.applicant?.last_name}</span>.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">ID Number</label>
                  <input 
                    type="text"
                    value={actionIdNumber}
                    onChange={(e) => setActionIdNumber(e.target.value)}
                    placeholder="Enter ID Number"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Category Code</label>
                  <select 
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {SOLO_PARENT_CATEGORIES.map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.code} - {cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Benefit Code</label>
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                    {BENEFIT_CODES.map(ben => (
                      <label key={ben.code} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                        <input 
                          type="checkbox"
                          checked={actionBenefit.includes(ben.code)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                                setActionBenefit(prev => {
                                    if (prev.length >= 2) return prev;
                                    return [...prev, ben.code];
                                });
                            } else {
                              setActionBenefit(prev => prev.filter(c => c !== ben.code));
                            }
                          }}
                          disabled={!actionBenefit.includes(ben.code) && actionBenefit.length >= 2}
                          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{ben.code} - {ben.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setUpdateQualificationModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                  onClick={handleUpdateQualification}
                  disabled={!actionCategory || actionBenefit.length === 0 || !actionIdNumber || isProcessing}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                >
                  {isProcessing ? <span>Processing...</span> : <span>Update Details</span>}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Disapprove Modal */}
      {disapproveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Disapprove Application</h3>
              <button 
                onClick={() => setDisapproveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-100 dark:border-rose-800">
                <AlertCircle className="text-rose-600 dark:text-rose-400 shrink-0" size={20} />
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  You are about to disapprove the application for 
                  <span className="font-bold"> {selectedApplication?.applicant?.first_name} {selectedApplication?.applicant?.last_name}</span>.
                  This action cannot be undone.
                </p>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Reason for Disapproval</label>
                <textarea 
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Please state the reason..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 resize-none dark:text-white dark:placeholder-slate-400"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setDisapproveModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDisapprove}
                disabled={!actionRemarks || isProcessing}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
              >
                {isProcessing ? <span>Processing...</span> : <span>Confirm Disapproval</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Application</h3>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-100 dark:border-rose-800">
                <AlertCircle className="text-rose-600 dark:text-rose-400 shrink-0" size={20} />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                    Are you sure you want to delete this applicant?
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    This action cannot be undone. The applicant's record will be permanently removed from the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isProcessing}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
              >
                {isProcessing ? <span>Deleting...</span> : <span>Yes, Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print ID Modal */}
      <IDCardModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        data={printData}
      />
    </div>
  );
};

export default ApplicationList;
