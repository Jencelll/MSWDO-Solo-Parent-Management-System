import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Printer, 
  CheckCircle, 
  Clock, 
  User, 
  MapPin,
  Calendar,
  Filter,
  MapPin as MapPinIcon,
  IdCard,
  CheckSquare,
  Square
} from 'lucide-react';
import { API_CONFIG } from '../config';
import { BARANGAYS } from '../constants';
import IDCardModal from '../components/IDCardModal';
import ConfirmModal from '../components/ConfirmModal';
import cardFront from '../assets/solo_parent.jpg';
import cardBack from '../assets/back.jpg';

const IDCardManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'printed'>('pending');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingPrintId, setPendingPrintId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
    setSelectedIds([]); // Reset selection on tab/filter change
  }, [activeTab, searchQuery, selectedBarangay, refreshKey]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
      
      const queryParams = new URLSearchParams({
        status: 'Approved',
        search: searchQuery
      });

      if (selectedBarangay && selectedBarangay !== 'All') {
        queryParams.append('barangay', selectedBarangay);
      }

      const response = await fetch(`${baseUrl}/api/applications?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter based on activeTab
        const filtered = (data.data || []).filter((app: any) => {
          const isPrinted = app.is_printed === 1 || app.is_printed === true;
          return activeTab === 'printed' ? isPrinted : !isPrinted;
        });
        setApplications(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (application: any) => {
    console.log('IDCardManagement: handlePrint called for application:', application);
    setSelectedApplication(application);
    setPrintModalOpen(true);
  };

  const handleMarkAsPrinted = async (id: number) => {
    console.log('handleMarkAsPrinted called for ID:', id);
    setPendingPrintId(id);
    setConfirmModalOpen(true);
  };

  const confirmMarkAsPrinted = async () => {
    console.log('confirmMarkAsPrinted triggered, current pendingPrintId:', pendingPrintId);
    if (!pendingPrintId) {
      console.warn('confirmMarkAsPrinted: No ID found in state');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
      console.log(`Sending mark-printed request for ID ${pendingPrintId} to ${baseUrl}`);
      
      const response = await fetch(`${baseUrl}/api/applications/${pendingPrintId}/mark-printed`, {
        method: 'GET', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Mark-printed request successful');
        setRefreshKey(prev => prev + 1);
        setPrintModalOpen(false);
        setConfirmModalOpen(false); // Close modal here instead of relying on ConfirmModal's internal onClose
      } else {
        const text = await response.text();
        console.error('Failed to mark printed:', text);
        alert('Error: ' + text);
      }
    } catch (error) {
      console.error('Error marking as printed', error);
      alert('Network error occurred while marking as printed');
    } finally {
      setPendingPrintId(null);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map(app => app.id));
    }
  };

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getAbsoluteUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('data:')) return path;
    if (path.startsWith('http')) return path;
    return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleBatchPrint = async () => {
      if (selectedIds.length === 0) return;

      const selectedApps = applications.filter(app => selectedIds.includes(app.id));

      if (selectedApps.length === 0) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for this website to print.');
        return;
      }

      const frontUrl = getAbsoluteUrl(cardFront);
      const backUrl = getAbsoluteUrl(cardBack);

      // We need to preload images to ensure they display before printing? 
      // Browsers handle this reasonably well usually if we include them in img tags.

      const styles = `
        <style>
          @page { size: auto; margin: 5mm; }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif; 
            background-color: white;
          }
          .cards-wrapper {
            display: flex;
            flex-direction: column;
            gap: 2mm;
            align-items: center;
          }
          .card-row {
            display: flex;
            flex-direction: row;
            gap: 0;
            page-break-inside: avoid;
            margin-bottom: 0;
          }
          .card-container {
            width: 103mm;
            height: 64mm;
            position: relative;
            overflow: hidden;
            border: 0.1mm solid #ddd; 
            /* background-image set inline */
            background-size: 100% 100%;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .field {
            position: absolute;
            font-size: 10pt; /* Adjusted for print scaling */
            font-weight: bold;
            color: #0f172a;
            white-space: nowrap;
            transform-origin: top left;
             /* Scale down a bit to match the visual editor if needed, 
                but visual editor uses mm coordinates directly. 
                103mm width in pixels is approx 390px at 96dpi. 
                Visual editor was 500px width.
                So we need to scale the coordinates from the editor (based on 500px width) 
                to the print width (103mm).
                
                Actually, the editor used percentages or scaled mm?
                The editor code says: 
                name: { x: 38.6, y: 32.3 }, // mm
                
                We can just use mm for position.
             */
          }
          .photo-box {
            position: absolute;
            width: 25.4mm; /* 1 inch */
            height: 25.5.4mm;
            object-fit: cover;
            border-radius: 1mm;
          }
          
          /* Utility classes for text sizing */
          .text-xs { font-size: 7pt; }
          .text-sm { font-size: 9pt; }
          .text-md { font-size: 10pt; }
          .text-lg { font-size: 12pt; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
        </style>
      `;

      let cardsHtml = '';

      for (const app of selectedApps) {
        const applicant = app.applicant || {};
        const fullName = `${applicant.first_name || ''} ${applicant.middle_name || ''} ${applicant.last_name || ''}`.trim();
        
        // Process photo
        const photoPath = app.photo_path || applicant.photo_path;
        let photoUrl = '';
        if (photoPath) {
             const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
             const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
             photoUrl = photoPath.startsWith('http') ? photoPath : `${baseUrl}${path}`;
        }

        // Family members calculation
        const familyMembers = applicant.family_members || [];
        const validDependents = familyMembers.filter((member: any) => {
            const isPwd = member.is_pwd || member.isPwd === 'Yes' || member.isPwd === true;
            const memberAge = member.age !== undefined ? member.age : calculateAge(member.dob);
            if (isPwd) return true;
            if (typeof memberAge === 'string' && memberAge === 'N/A') return true; 
            return Number(memberAge) < 23;
        }).slice(0, 5); // Limit to 5

        const dependentsHtml = validDependents.map((child: any, index: number) => {
            // Adjusted positioning: Lifted slightly to avoid touching bottom lines
            const baseY = 28.2 + (index * 3.6); 
            
            // Use full_name if available, else combine first/last. 
            let displayName = child.full_name || `${child.first_name || ''} ${child.last_name || ''}`.trim();
            // clean up "undefined undefined" which happens if fields are missing in legacy data
            if (displayName.trim() === 'undefined undefined' || displayName.trim() === '') displayName = '';
            
            const name = displayName.substring(0, 30).toUpperCase();
            const dob = child.dob ? new Date(child.dob).toLocaleDateString() : '';
            const rel = (child.relationship || 'CHILD').toUpperCase();
            
            // Adjusted X coordinates for Birthdate and Relationship to center/align better in columns
            return `
                <div class="field text-xs" style="left: 7.3mm; top: ${baseY}mm; width: 45mm;">${name}</div>
                <div class="field text-xs" style="left: 51mm; top: ${baseY}mm; width: 30mm; text-align: center;">${dob}</div>
                <div class="field text-xs" style="left: 80mm; top: ${baseY}mm;">${rel}</div>
            `;
        }).join('');

        // Front Card HTML
        const frontHtml = `
            <div class="card-container" style="background-image: url('${frontUrl}')">
                ${photoUrl ? `<img src="${photoUrl}" class="photo-box" style="left: 3.7mm; top: 24.2mm;" />` : ''}
                <div class="field uppercase text-sm" style="left: 38.6mm; top: 32.3mm; width: 60mm;">${fullName}</div>
                <div class="field uppercase text-sm" style="left: 58mm; top: 42.0mm;">${app.category_code || app.category?.description || ''}</div>
                <div class="field text-sm" style="left: 66.2mm; top: 37.0mm;">${app.benefit_code || ''}</div>
                <div class="field font-mono text-sm" style="left: 11.1mm; top: 52.5mm; letter-spacing: 0px;">${app.id_number || ''}</div>
                <div class="field text-sm" style="left: 16.5mm; top: 56.3mm;">${app.expiration_date ? (() => {
                    const d = new Date(app.expiration_date);
                    return `${d.getMonth() + 1}/${d.getFullYear()}`;
                })() : 'Valid Until Revoked'}</div>
            </div>
        `;

        // Back Card HTML
        const emergencyContact = (applicant.emergency_contacts && applicant.emergency_contacts[0]) || {};
        
        const backHtml = `
            <div class="card-container" style="background-image: url('${backUrl}')">
                <div class="field uppercase text-xs" style="left: 23.9mm; top: 4.8mm;">${applicant.address || ''}, ${applicant.barangay || ''}</div>
                <div class="field uppercase text-xs" style="left: 26mm; top: 8mm;">${applicant.dob ? new Date(applicant.dob).toLocaleDateString() : ''}</div>
                <div class="field uppercase text-xs" style="left: 55mm; top: 8mm;">${applicant.place_of_birth || ''}</div>
                
                <div class="field uppercase text-xs" style="left: 14.7mm; top: 14.5mm;">${emergencyContact.name || ''}</div>
                <div class="field uppercase text-xs" style="left: 17mm; top: 17.5mm;">${emergencyContact.address || ''}</div>
                <div class="field uppercase text-xs" style="left: 17.5mm; top: 20.5mm;">${emergencyContact.relationship || ''}</div>
                <div class="field text-xs" style="left: 60mm; top: 20mm;">${emergencyContact.contact_number || ''}</div>
                
                ${dependentsHtml}
            </div>
        `;

        cardsHtml += `
            <div class="card-row">
                ${frontHtml}
                ${backHtml}
            </div>
        `;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Batch Print - ${selectedApps.length} ID Cards</title>
            ${styles}
          </head>
          <body>
            <div class="cards-wrapper">
                ${cardsHtml}
            </div>
            <script>
                // Auto print after images load (simplified with timeout for now)
                setTimeout(() => {
                    window.print();
                    // window.close(); // Optional: close after print
                }, 1000);
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Open confirm modal to mark as printed
      setBatchConfirmOpen(true);
  };

  const handleBatchMarkAsPrinted = async () => {
    setLoading(true);
    let successCount = 0;
    
    try {
        const token = localStorage.getItem('token');
        const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
        
        // We do this sequentially or in parallel? Parallel is faster.
        await Promise.all(selectedIds.map(async (id) => {
            try {
                const response = await fetch(`${baseUrl}/api/applications/${id}/mark-printed`, {
                    method: 'GET', 
                    headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                    }
                });
                if (response.ok) successCount++;
            } catch (e) {
                console.error(`Failed to mark ${id} as printed`, e);
            }
        }));
        
        alert(`Successfully marked ${successCount} out of ${selectedIds.length} as printed.`);
        setBatchConfirmOpen(false);
        setSelectedIds([]);
        setRefreshKey(prev => prev + 1);
    } catch (error) {
        console.error("Batch update error", error);
        alert("An error occurred during batch update.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ID Card Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage and print Solo Parent ID cards.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-violet-500 transition-all">
            <MapPinIcon size={18} className="text-slate-400" />
            <select 
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer min-w-[140px] appearance-none pr-4"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1rem' }}
            >
              <option value="All">All Barangays</option>
              {BARANGAYS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search applicant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-64 h-[42px]"
            />
          </div>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl border border-violet-100 dark:border-violet-800 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <span className="font-bold text-violet-700 dark:text-violet-300">{selectedIds.length} Selected</span>
                <button onClick={() => setSelectedIds([])} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 underline">Clear Selection</button>
            </div>
            <button 
                onClick={handleBatchPrint}
                className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-violet-700 transition-all"
            >
                <Printer size={18} />
                <span>Print Selected ({selectedIds.length})</span>
            </button>
          </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'pending' 
              ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Pending Print</span>
            {activeTab === 'pending' && <span className="bg-violet-100 text-violet-600 text-xs px-2 py-0.5 rounded-full">{applications.length}</span>}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('printed')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'printed' 
              ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>Printed</span>
          </div>
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <Printer size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No applications found</h3>
            <p className="text-slate-500 dark:text-slate-400">There are no applications in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="p-4 w-10">
                    <button onClick={handleSelectAll} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Select All">
                        {selectedIds.length > 0 && selectedIds.length === applications.length ? (
                            <CheckSquare size={20} className="text-violet-600" />
                        ) : selectedIds.length > 0 ? (
                            <div className="w-5 h-5 flex items-center justify-center"><div className="w-3 h-3 bg-violet-600 rounded-sm"></div></div>
                        ) : (
                            <Square size={20} className="text-slate-400" />
                        )}
                    </button>
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID Number</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Issued</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedIds.includes(app.id) ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''}`}>
                    <td className="p-4">
                        <button onClick={() => handleSelect(app.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                            {selectedIds.includes(app.id) ? (
                                <CheckSquare size={20} className="text-violet-600" />
                            ) : (
                                <Square size={20} className="text-slate-300" />
                            )}
                        </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-bold overflow-hidden">
                           {app.photo_path || app.applicant?.photo_path ? (
                             <img 
                               src={(() => {
                                 const photoPath = app.photo_path || app.applicant?.photo_path;
                                 const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
                                 const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
                                 return photoPath.startsWith('http') ? photoPath : `${baseUrl}${path}`;
                               })()}
                               alt="Applicant" 
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 (e.target as HTMLImageElement).style.display = 'none';
                                 (e.target as HTMLImageElement).parentElement!.innerText = app.applicant?.first_name?.[0] + app.applicant?.last_name?.[0];
                               }}
                             />
                           ) : (
                             `${app.applicant?.first_name?.[0]}${app.applicant?.last_name?.[0]}`
                           )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {app.applicant?.first_name} {app.applicant?.middle_name} {app.applicant?.last_name}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={10} /> {app.applicant?.barangay}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">
                      {app.id_number || '-'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {app.category?.description || app.category_code}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {app.date_issued ? new Date(app.date_issued).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-right">
                      {activeTab === 'pending' ? (
                        <button 
                          onClick={() => handlePrint(app)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                        >
                          <IdCard size={16} />
                          Print
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-emerald-600 font-bold text-sm">
                          <CheckCircle size={16} />
                          <span>Printed on {app.date_printed ? new Date(app.date_printed).toLocaleDateString() : ''}</span>
                          <button 
                            onClick={() => handlePrint(app)}
                            className="ml-2 text-slate-400 hover:text-violet-600"
                            title="Reprint"
                          >
                            <IdCard size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ID Card Modal */}
      {printModalOpen && selectedApplication && (
        <IDCardModal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          data={selectedApplication}
          onPrintComplete={() => handleMarkAsPrinted(selectedApplication.id)}
        />
      )}

      {/* Single Print Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingPrintId(null);
        }}
        onConfirm={() => {
          console.log('ConfirmModal: onConfirm called');
          confirmMarkAsPrinted();
        }}
        title="Mark as Printed"
        message="Are you sure you want to mark this ID card as printed? This will move it to the 'Printed' tab."
        confirmText="Yes, Mark as Printed"
        type="info"
      />

      {/* Batch Print Confirm Modal */}
      <ConfirmModal
        isOpen={batchConfirmOpen}
        onClose={() => setBatchConfirmOpen(false)}
        onConfirm={handleBatchMarkAsPrinted}
        title="Mark Batch as Printed"
        message={`You have printed ${selectedIds.length} ID cards. Do you want to mark them all as "Printed" in the system and move them to the Printed tab?`}
        confirmText="Yes, Mark All as Printed"
        type="info"
      />
    </div>
  );

};

export default IDCardManagement;
