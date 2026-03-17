import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, Edit, Trash2, Download, Calendar,
  XCircle, User, MapPin, Phone, Mail, Briefcase, GraduationCap, 
  Home,
  Banknote, Users, AlertCircle, CheckCircle, Copy, Clock, AlertTriangle, Printer, FileCheck, FileX, Archive, IdCard
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SOLO_PARENT_CATEGORIES, BENEFIT_CODES, BARANGAYS } from '../constants';
import { API_CONFIG } from '../config';
import IDCardModal from '../components/IDCardModal';

const SoloParentRegistry: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [registryData, setRegistryData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [subsidyFilter, setSubsidyFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  
  // Action Modal States
  const [updateQualificationModalOpen, setUpdateQualificationModalOpen] = useState(false);
  const [actionCategory, setActionCategory] = useState('');
  const [actionBenefit, setActionBenefit] = useState<string[]>([]);
  const [actionIdNumber, setActionIdNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Print ID Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

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

  // Generate years for filter (current year back to 2020)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const status = activeTab === 'active' ? 'Approved' : 'Archived';
        const response = await fetch(`/api/applications?status=${status}`, { headers });
        
        if (response.ok) {
          const result = await response.json();
          const apps = result.data || result;
          
          if (!Array.isArray(apps)) {
            console.error("Unexpected API response format:", result);
            setRegistryData([]);
            setFilteredData([]);
            setError("Unexpected data format from server");
            return;
          }

          const mappedData = apps.map((app: any) => {
            // Calculate age safely
            let calculatedAge: string | number = 'N/A';
            if (app.applicant?.dob) {
              try {
                const dob = new Date(app.applicant.dob);
                if (!isNaN(dob.getTime())) {
                  const ageDiff = Date.now() - dob.getTime();
                  const ageDate = new Date(ageDiff);
                  calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
                }
              } catch (e) {
                console.error("Error calculating age for app", app.id, e);
              }
            }

            // Calculate expiration status
            const expirationDate = app.expiration_date ? new Date(app.expiration_date) : null;
            const now = new Date();
            const isExpired = expirationDate && expirationDate < now;
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);
            const isNearingExpiration = expirationDate && expirationDate > now && expirationDate < thirtyDaysFromNow;

            return {
              id: app.id,
              soloParentId: app.id_number || app.case_number || 'N/A',
              fullName: app.applicant ? `${app.applicant.first_name} ${app.applicant.last_name}` : 'Unknown Applicant',
              barangay: app.applicant?.barangay || 'N/A',
              photoPath: app.photo_path || app.applicant?.photo_path,
              age: calculatedAge,
              sex: app.applicant?.sex || 'N/A',
              civilStatus: app.applicant?.classification_details || 'N/A', // Using classification as proxy
              status: app.status === 'Approved' ? 'Active' : app.status, // Map 'Approved' to 'Active' for registry view
              registrationDate: app.date_issued || app.created_at, // Use date_issued for year filter
              expirationDate: app.expiration_date,
              isExpired,
              isNearingExpiration,
              benefitCode: app.benefit_code
            };
          });

          // Sort alphabetically by full name
          mappedData.sort((a: any, b: any) => a.fullName.localeCompare(b.fullName));

          setRegistryData(mappedData);
          setFilteredData(mappedData);
        } else {
          const statusText = response.statusText;
          console.error("Failed to fetch registry data", response.status, statusText);
          setRegistryData([]);
          setFilteredData([]);
          setError(`Failed to fetch data: ${response.status} ${statusText}`);
        }
      } catch (error) {
        console.error("Failed to fetch registry data", error);
        setRegistryData([]);
        setFilteredData([]);
        setError(`Network error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    let result = registryData;

    if (selectedBarangay !== 'All') {
      result = result.filter(item => item.barangay === selectedBarangay);
    }

    if (selectedYear !== 'All') {
      // Assuming item has registrationDate in 'YYYY-MM-DD' format
      result = result.filter(item => item.registrationDate && item.registrationDate.startsWith(selectedYear));
    }

    if (subsidyFilter) {
      result = result.filter(item => item.benefitCode && item.benefitCode.split(',').includes('A'));
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.fullName.toLowerCase().includes(lowerQuery) ||
        item.soloParentId.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredData(result);
  }, [registryData, selectedBarangay, selectedYear, subsidyFilter, searchQuery]);

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
        console.log('Update details success:', data);
        setUpdateQualificationModalOpen(false);
        setViewModalOpen(false);
        alert('Details updated successfully!');
        // Refresh data
        window.location.reload(); 
      } else {
        const errorText = await res.text();
        console.error("Failed to update details", res.status, errorText);
        alert(`Failed to update details: ${res.status}\n${errorText}`);
      }
    } catch (error) {
      console.error("Error updating details:", error);
      alert(`Error updating details: ${error}`);
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

  const handleArchiveApplication = async (applicationId: number) => {
    if (window.confirm('Are you sure you want to archive this record? It will be moved to the Archived list.')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/applications/${applicationId}/archive`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          // Remove from local state
          const updatedRegistry = registryData.filter(item => item.id !== applicationId);
          setRegistryData(updatedRegistry);
        } else {
          alert('Failed to archive application.');
        }
      } catch (error) {
        console.error("Failed to archive application", error);
      }
    }
  };

  const handleDeleteApplication = async (applicationId: number) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/applications/${applicationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          // Remove from local state
          const updatedRegistry = registryData.filter(item => item.id !== applicationId);
          setRegistryData(updatedRegistry);
        } else {
          alert('Failed to delete application. Please try again.');
        }
      } catch (error) {
        console.error("Failed to delete application", error);
        alert('An error occurred while deleting the application.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Solo Parent Registry</h2>
          <p className="text-slate-500">Master list of all registered solo parents in Pagsanjan.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'active' 
              ? 'bg-white text-violet-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Active Registry
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'archived' 
              ? 'bg-white text-violet-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Archived
        </button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
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
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-full md:w-48">
              <Calendar size={18} className="text-slate-400" />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full cursor-pointer"
              >
                <option value="All">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSubsidyFilter(!subsidyFilter)}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium w-full md:w-auto ${
                subsidyFilter 
                  ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/20' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Banknote size={18} className={subsidyFilter ? 'text-white' : 'text-slate-400'} />
              <span>Subsidy Qualified</span>
            </button>

            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-full md:w-64">
              <Filter size={18} className="text-slate-400" />
              <select 
                value={selectedBarangay}
                onChange={(e) => setSelectedBarangay(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full cursor-pointer"
              >
                <option value="All">All Barangays</option>
                {BARANGAYS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <th className="px-4 py-3 md:px-6 md:py-4">Solo Parent ID</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Full Name</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Barangay</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Age</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                <th className="px-4 py-3 md:px-6 md:py-4">Expiration</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm font-mono text-slate-600">{row.soloParentId}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 overflow-hidden shrink-0 border border-violet-200">
                          {row.photoPath ? (
                              <img 
                                src={(() => {
                                  const existingPhoto = row.photoPath;
                                  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
                                  const path = existingPhoto.startsWith('/') ? existingPhoto : `/${existingPhoto}`;
                                  return existingPhoto.startsWith('http') ? existingPhoto : `${baseUrl}${path}`;
                                })()} 
                                alt={row.fullName} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.innerText = row.fullName.charAt(0);
                                }}
                              />
                          ) : (
                              row.fullName.charAt(0)
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{row.fullName}</span>
                          <span className="text-xs text-slate-500">{row.civilStatus} • {row.sex}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-600">{row.barangay}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-600">{row.age}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        row.isExpired ? 'bg-rose-50 text-rose-600' :
                        row.isNearingExpiration ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {row.isExpired ? 'EXPIRED' : row.isNearingExpiration ? 'RENEW SOON' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-slate-600">
                      {row.expirationDate ? new Date(row.expirationDate).toLocaleDateString() : 'N/A'}
                      {row.isNearingExpiration && (
                        <div className="flex items-center text-amber-600 text-[10px] font-bold mt-1">
                          <AlertTriangle size={10} className="mr-1" />
                          <span>Expires soon</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => handleViewApplication(row.id)}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handlePrintID(row.id)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Print ID Card"
                        >
                          <IdCard size={18} />
                        </button>
                        {activeTab === 'active' && userRole !== 'mayor' && (
                          <button 
                            onClick={() => handleArchiveApplication(row.id)}
                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Archive Record"
                          >
                            <Archive size={18} />
                          </button>
                        )}
                        {userRole !== 'mayor' && (
                          <>
                            <button 
                              onClick={() => navigate(`/edit/${row.id}`)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Details"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteApplication(row.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <Filter size={24} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No records found</p>
                      <p className="text-xs text-slate-400 max-w-xs text-center">
                        {searchQuery || selectedBarangay !== 'All' 
                          ? "Try adjusting your search or filter criteria." 
                          : "The registry is currently empty. Data will appear here once applications are approved."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">Showing {filteredData.length} of {registryData.length} records</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
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
                <button 
                  onClick={() => {
                    setViewModalOpen(false);
                    handlePrintID(selectedApplication.id);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-md shadow-emerald-600/20 text-sm whitespace-nowrap"
                >
                  <Printer size={16} />
                  <span>Print ID</span>
                </button>
                <button 
                  onClick={() => {
                    window.open(`#/print/${selectedApplication.id}`, '_blank');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-md shadow-blue-600/20 text-sm whitespace-nowrap"
                >
                  <Printer size={16} />
                  <span>Print Form</span>
                </button>
                {userRole !== 'mayor' && selectedApplication.status === 'Approved' && (
                  <button 
                    onClick={() => {
                      setActionCategory(selectedApplication.category_code || '');
                      setActionBenefit(selectedApplication.benefit_code ? selectedApplication.benefit_code.split(',') : []);
                      setActionIdNumber(selectedApplication.id_number || '');
                      setUpdateQualificationModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-md shadow-indigo-600/20 text-sm whitespace-nowrap"
                  >
                    <Banknote size={16} />
                    <span>Update</span>
                  </button>
                )}
                {userRole !== 'mayor' && (
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
                )}
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
                <Copy size={14} className="cursor-pointer hover:text-violet-600 transition-colors" onClick={() => navigator.clipboard.writeText(selectedApplication.case_number)} />
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

              {userRole !== 'mayor' && selectedApplication.status === 'Approved' && (
                  <div className="hidden"></div>
               )}

              <div className="flex-1 hidden md:block"></div>

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 ml-auto">
                <Calendar size={16} />
                <span className="text-sm font-medium">Applied on {new Date(selectedApplication.date_applied || selectedApplication.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-900 custom-scrollbar">
              
              {/* Expiration Alert */}
              {selectedApplication.expiration_date && new Date(selectedApplication.expiration_date) < new Date() && (
                <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-rose-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-rose-700">Solo Parent ID Expired</h4>
                    <p className="text-sm text-rose-600">This ID expired on {new Date(selectedApplication.expiration_date).toLocaleDateString()}. Please process renewal.</p>
                  </div>
                </div>
              )}
              {selectedApplication.expiration_date && new Date(selectedApplication.expiration_date) > new Date() && new Date(selectedApplication.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-amber-700">Renewal Needed Soon</h4>
                    <p className="text-sm text-amber-600">This ID will expire on {new Date(selectedApplication.expiration_date).toLocaleDateString()}. Please advise applicant to renew.</p>
                  </div>
                </div>
              )}

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
                        {new Date(selectedApplication.date_applied || selectedApplication.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Expiration Date</label>
                      <p className="font-bold text-slate-900 dark:text-white">
                         {selectedApplication.expiration_date ? new Date(selectedApplication.expiration_date).toLocaleDateString() : 'N/A'}
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

              {/* Family Members Section (Full Width) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow mb-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                  <Users className="text-violet-600 dark:text-violet-400" size={20} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Family Members</h3>
                  <span className="ml-auto bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                    {selectedApplication.applicant?.family_members?.length || 0}
                  </span>
                </div>
                <div className="p-0">
                  {selectedApplication.applicant?.family_members && selectedApplication.applicant.family_members.length > 0 ? (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-5 py-3">Name</th>
                          <th className="px-5 py-3">Birthday</th>
                          <th className="px-5 py-3">Age</th>
                          <th className="px-5 py-3">Relationship</th>
                          <th className="px-5 py-3">Occupation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {selectedApplication.applicant.family_members.map((member: any, index: number) => (
                          <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                            <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{member.full_name || member.name}</td>
                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{member.dob || 'N/A'}</td>
                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{member.age}</td>
                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{member.relationship}</td>
                            <td className="px-5 py-3 text-slate-500 dark:text-slate-400 italic">{member.occupation || 'Not specified'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic">No family members listed</div>
                  )}
                </div>
              </div>

              {/* Emergency Contacts Section (Full Width) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow mb-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                  <AlertCircle className="text-violet-600 dark:text-violet-400" size={20} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Emergency Contacts</h3>
                </div>
                <div className="space-y-3">
                  {selectedApplication.applicant?.emergency_contacts && selectedApplication.applicant.emergency_contacts.length > 0 ? (
                    selectedApplication.applicant.emergency_contacts.map((contact: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-600 text-violet-600 dark:text-violet-400">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{contact.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{contact.relationship}</p>
                          <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{contact.contact_number}</p>
                          {contact.address && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{contact.address}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic text-sm text-center">No emergency contacts listed</p>
                  )}
                </div>
              </div>

              {/* Special Indicators Section (Full Width) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow mb-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                  <CheckCircle className="text-violet-600 dark:text-violet-400" size={20} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Special Indicators</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.applicant?.is_pantawid_beneficiary && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-bold shadow-sm">
                      <CheckCircle size={14} /> Pantawid Beneficiary
                    </span>
                  )}
                  {selectedApplication.applicant?.is_indigenous_person && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-bold shadow-sm">
                      <CheckCircle size={14} /> Indigenous Person
                    </span>
                  )}
                  {selectedApplication.applicant?.is_lgbtq && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-bold shadow-sm">
                      <CheckCircle size={14} /> LGBTQ+
                    </span>
                  )}
                  {!selectedApplication.applicant?.is_pantawid_beneficiary && !selectedApplication.applicant?.is_indigenous_person && !selectedApplication.applicant?.is_lgbtq && (
                    <div className="w-full py-4 text-center">
                       <p className="text-slate-400 italic text-sm">No special indicators marked</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Section (Full Width, Read-only) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                  <FileCheck className="text-violet-600 dark:text-violet-400" size={20} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Documents</h3>
                </div>
                <div className="space-y-2">
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    selectedApplication.documents.map((doc: any, idx: number) => {
                      console.log("Document path:", doc.file_path);
                      return (
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
                        </div>
                      );
                    })
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
            </div>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {printModalOpen && printData && (
        <IDCardModal 
          isOpen={printModalOpen} 
          onClose={() => setPrintModalOpen(false)} 
          data={printData} 
          isAdmin={true}
        />
      )}

      {/* Update Qualification Modal */}
      {updateQualificationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
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
    </div>
  );
};

export default SoloParentRegistry;
