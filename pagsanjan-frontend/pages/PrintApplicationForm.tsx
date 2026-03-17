import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApplicationRecord } from '../types';
import logo from '../assets/Pagsanjan.png';
import mswdoLogo from '../assets/MSWDOLogo.jpg';
import soloParentLogo from '../assets/log02.jpg';
import { Loader2, Printer } from 'lucide-react';

const PrintApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/applications/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setApplication(data);
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  if (!application || !application.applicant) {
    return <div className="p-8 text-center text-red-500">Application not found</div>;
  }

  const { applicant } = application as any;
  const rawFamilyMembers = applicant.family_members || [];

  // Filter family members based on PWD status and age
  // PWD members are always included regardless of age
  // Non-PWD members are excluded if they are 23 or older
  const familyMembers = rawFamilyMembers.filter((member: any) => {
    const isPwd = member.is_pwd || member.isPwd === 'Yes' || member.isPwd === true;
    const age = member.age || calculateAge(member.dob);
    
    if (isPwd) return true;
    return age < 23;
  });

  return (
    <div className="bg-white min-h-screen print:min-h-0 p-8 print:p-0 text-slate-900 font-sans">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
              margin: 0.5in;
            }
            html, body {
              height: auto;
            }
          }
        `}
      </style>
      
      {/* Print Controls - Hidden when printing */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-end print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors shadow-lg"
        >
          <Printer size={20} />
          Print Form
        </button>
      </div>

      {/* Form Container - A4 Width */}
      <div className="max-w-[210mm] mx-auto bg-white print:max-w-none text-black leading-tight text-xs">
        
        {/* Header */}
        <div className="relative mb-1">
          <div className="flex items-start justify-between">
            <img src={logo} alt="LGU Logo" className="w-24 h-24 object-contain" />
            <div className="text-center flex-1 pt-1">
              <p className="text-xs">Republic of the Philippines</p>
              <p className="text-xs font-bold">Municipal Social Welfare and Development Office</p>
              <p className="text-xs">Pagsanjan, Laguna Region IV-A</p>
              <h1 className="text-lg font-bold mt-1 uppercase">APPLICATION FORM FOR SOLO PARENT</h1>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex gap-2 mb-1">
                <img src={mswdoLogo} alt="MSWDO Logo" className="w-20 h-20 object-contain" />
                <img src={soloParentLogo} alt="Solo Parent Logo" className="w-20 h-20 object-contain" />
              </div>
              <div className="w-[1in] h-[1in] border border-black bg-white"></div>
            </div>
          </div>
          <div className="flex justify-end mt-1">
            <p className="text-right text-[10px]">
              Case Number: <span className="inline-block border-b border-black w-32 text-center font-bold">{application.case_number}</span>
              <br/>
              <span className="text-[9px] block text-center w-full ml-auto" style={{maxWidth: '8rem'}}>(10 digit PSGC-YYMM-sequential 6 digits)</span>
            </p>
          </div>
        </div>

        {/* I. IDENTIFYING INFORMATION */}
        <div className="mb-1">
          <h2 className="font-bold mb-0.5 text-xs">I. IDENTIFYING INFORMATION</h2>
          <table className="w-full border-collapse border border-black text-[10px]">
            <tbody>
              <tr>
                <td className="border border-black px-1 py-0.5 w-[60%]">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Full Name:</span>
                    <span className="uppercase font-bold">{applicant.last_name}, {applicant.first_name} {applicant.middle_name}</span>
                  </div>
                </td>
                <td className="border border-black px-1 py-0.5 w-[20%]">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Age:</span>
                    <span className="font-bold">{applicant.age || calculateAge(applicant.dob)}</span>
                  </div>
                </td>
                <td className="border border-black px-1 py-0.5 w-[20%]">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Sex:</span>
                    <span className="uppercase font-bold">{applicant.sex}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Date of Birth:</span>
                    <span className="font-bold">{applicant.dob ? new Date(applicant.dob).toLocaleDateString() : ''}</span>
                  </div>
                </td>
                <td className="border border-black px-1 py-0.5" colSpan={2}>
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Place of Birth:</span>
                    <span className="uppercase font-bold">{applicant.place_of_birth}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5" colSpan={3}>
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Address:</span>
                    <span className="uppercase font-bold">{applicant.address}, {applicant.barangay}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Educational Attainment:</span>
                    <span className="uppercase font-bold">{applicant.educational_attainment}</span>
                  </div>
                </td>
                <td className="border border-black px-1 py-0.5" colSpan={2}>
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Civil Status:</span>
                    <span className="uppercase font-bold">{applicant.civil_status}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Occupation:</span>
                    <span className="uppercase font-bold">{applicant.occupation}</span>
                  </div>
                </td>
                <td className="border border-black px-1 py-0.5" colSpan={2}>
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Religion:</span>
                    <span className="uppercase font-bold">{applicant.religion}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Company/Agency:</span>
                    <span className="uppercase font-bold">{applicant.company_agency}</span>
                  </div>
                </td>
                <td className="border border-black px-1 py-0.5" colSpan={2}>
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Monthly Income:</span>
                    <span className="font-bold">₱ {Number(applicant.monthly_income).toLocaleString()}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5" colSpan={3}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold whitespace-nowrap">Employment Status:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px] font-bold">
                        {applicant.employment_status === 'Employed' ? '✓' : ''}
                      </div>
                      <span>Employed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px] font-bold">
                        {applicant.employment_status === 'Self-employed' ? '✓' : ''}
                      </div>
                      <span>Self-employed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px] font-bold">
                        {applicant.employment_status === 'Not employed' ? '✓' : ''}
                      </div>
                      <span>Not employed</span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Contact number/s:</span>
                    <span className="font-bold">{applicant.contact_number}</span>
                  </div>
                </td>
                <td className="border border-black px-1 py-0.5" colSpan={2}>
                  <div className="flex items-baseline">
                    <span className="font-bold mr-1 whitespace-nowrap">Email Address:</span>
                    <span className="font-bold">{applicant.email_address}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black px-1 py-0.5" colSpan={3}>
                  <div className="flex justify-between px-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">Pantawid Beneficiary?</span>
                      <div className="flex items-center gap-1">
                         <span className={`font-bold ${applicant.is_pantawid_beneficiary ? 'underline' : ''}`}>Y</span>
                         <span>_</span>
                         <span className={`font-bold ${!applicant.is_pantawid_beneficiary ? 'underline' : ''}`}>N</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">Indigenous Person?</span>
                      <div className="flex items-center gap-1">
                         <span className={`font-bold ${applicant.is_indigenous_person ? 'underline' : ''}`}>Y</span>
                         <span>_</span>
                         <span className={`font-bold ${!applicant.is_indigenous_person ? 'underline' : ''}`}>N</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">LGBTQ+?</span>
                      <div className="flex items-center gap-1">
                         <span className={`font-bold ${applicant.is_lgbtq ? 'underline' : ''}`}>Y</span>
                         <span>_</span>
                         <span className={`font-bold ${!applicant.is_lgbtq ? 'underline' : ''}`}>N</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* II. FAMILY COMPOSITION */}
        <div className="mb-1">
          <h2 className="font-bold text-center mb-0.5 text-xs">II. FAMILY COMPOSITION</h2>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="text-center">
                <th className="border border-black px-1 py-0.5 font-bold">Name<br/>(First, Middle, Last)</th>
                <th className="border border-black px-1 py-0.5 font-bold">Relationship</th>
                <th className="border border-black px-1 py-0.5 font-bold">Age</th>
                <th className="border border-black px-1 py-0.5 font-bold">Birthday<br/>(mm/dd/yy)</th>
                <th className="border border-black px-1 py-0.5 font-bold">Civil Status</th>
                <th className="border border-black px-1 py-0.5 font-bold">PWD</th>
                <th className="border border-black px-1 py-0.5 font-bold">Educational<br/>Attainment</th>
                <th className="border border-black px-1 py-0.5 font-bold">Occupation</th>
                <th className="border border-black px-1 py-0.5 font-bold">Monthly<br/>Income</th>
              </tr>
            </thead>
            <tbody>
              {familyMembers.map((member: any, index: number) => (
                <tr key={index}>
                  <td className="border border-black px-1 py-0.5 uppercase font-semibold">{member.full_name}</td>
                  <td className="border border-black px-1 py-0.5 uppercase text-center">{member.relationship}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{member.age || calculateAge(member.dob)}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{member.dob ? new Date(member.dob).toLocaleDateString() : ''}</td>
                  <td className="border border-black px-1 py-0.5 uppercase text-center">{member.civil_status || 'Single'}</td>
                  <td className="border border-black px-1 py-0.5 uppercase text-center">{(member.is_pwd || member.isPwd === 'Yes') ? 'YES' : 'NO'}</td>
                  <td className="border border-black px-1 py-0.5 uppercase text-center">{member.educational_attainment || 'Elementary'}</td>
                  <td className="border border-black px-1 py-0.5 uppercase text-center">{member.occupation}</td>
                  <td className="border border-black px-1 py-0.5 text-right">{member.monthly_income ? `₱ ${Number(member.monthly_income).toLocaleString()}` : ''}</td>
                </tr>
              ))}
              {/* Fill with fewer empty rows to save space */}
              {[...Array(Math.max(0, 5 - familyMembers.length))].map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                  <td className="border border-black px-1 py-0.5 h-5"></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[9px] mt-0.5 text-center italic">NOTE: Include family member and other members of the household especially minor children. Use back side for additional members.</p>
        </div>
        
        {/* III. Classification */}
        <div className="mb-1">
          <h2 className="font-bold text-xs">III. Classification/Circumstances of being a solo parent (Dahilan bakit naging solo parent)?</h2>
          <div className="border-b border-black mt-1 pb-0.5 uppercase font-bold text-xs min-h-[1.2em]">{applicant.classification_details}</div>
        </div>

        {/* IV. Needs */}
        <div className="mb-1">
          <h2 className="font-bold text-xs">IV. Needs/Problems of being a solo parent (Kinakailangan/Problema ng isang solo parent)?</h2>
          <div className="border-b border-black mt-1 pb-0.5 uppercase font-bold text-xs min-h-[1.2em]">{applicant.needs_problems}</div>
        </div>

        {/* V. House ownership */}
        <div className="mb-1">
          <div className="flex items-end mb-1">
            <span className="font-bold mr-2 text-xs">V. House ownership status:</span>
            <span className="flex-1 border-b border-black uppercase font-bold text-xs px-2">{applicant.house_ownership_status}</span>
          </div>
          <div className="flex items-end">
            <span className="font-bold mr-2 ml-4 text-xs">What is your house made of?</span>
            <span className="flex-1 border-b border-black uppercase font-bold text-xs px-2">{applicant.house_condition}</span>
          </div>
        </div>

        {/* VI. Emergency */}
        <div className="mb-1">
          <h2 className="font-bold mb-0.5 text-xs">VI. IN CASE OF EMERGENCY</h2>
          <div className="flex gap-2 mb-0.5">
            <div className="flex-1 flex items-end">
              <span className="font-bold mr-2 text-xs">Name:</span>
              <span className="flex-1 border-b border-black uppercase font-bold text-xs px-2">{applicant.emergency_contacts?.[0]?.full_name}</span>
            </div>
            <div className="flex-1 flex items-end">
              <span className="font-bold mr-2 text-xs">Relationship:</span>
              <span className="flex-1 border-b border-black uppercase font-bold text-xs px-2">{applicant.emergency_contacts?.[0]?.relationship}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-end">
              <span className="font-bold mr-2 text-xs">Address:</span>
              <span className="flex-1 border-b border-black uppercase font-bold text-xs px-2">{applicant.emergency_contacts?.[0]?.address}</span>
            </div>
            <div className="flex-1 flex items-end">
              <span className="font-bold mr-2 text-xs">Contact number/s:</span>
              <span className="flex-1 border-b border-black uppercase font-bold text-xs px-2">{applicant.emergency_contacts?.[0]?.contact_number}</span>
            </div>
          </div>
        </div>

        {/* Certification */}
        <div className="mb-1 mt-1">
          <p className="text-justify text-[10px] mb-1 indent-8 leading-tight">
            I hereby certify that the information given above are true and correct. I further understand that any misinterpretation that may have been made will subject me to criminal and civil liabilities provided for by existing laws. In addition, I hereby give my consent to share the information above to the member agencies of the Inter-Agency Coordinating and Monitoring Committee on solo parents.
          </p>
          
          <div className="flex justify-between items-end px-8 mt-8">
            <div className="text-center w-56">
              <div className="border-b border-black mb-1 uppercase font-bold text-xs">{applicant.first_name} {applicant.middle_name} {applicant.last_name}</div>
              <p className="font-bold text-[10px]">Signature/Thumbmark over Printed Name</p>
            </div>
            <div className="text-center w-40">
              <div className="border-b border-black mb-1 font-bold text-xs">
                {new Date().toLocaleDateString()}
              </div>
              <p className="font-bold text-[10px]">Date</p>
            </div>
          </div>
        </div>

        {/* Office Use */}
        <div className="mt-1 border-t-2 border-dashed border-slate-300 pt-0.5">
          <p className="font-bold text-center mb-0.5 text-xs">FOR SPO/SPD/MSWDO USE ONLY</p>
          
          <div className="flex justify-between mb-0.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold">STATUS:</span>
              <div className="flex items-center gap-1 ml-2">
                <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px] font-bold">
                  {application.status === 'Approved' ? '✓' : ''}
                </div>
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px] font-bold">
                  {/* Check if new/renewal */}
                </div>
                <span>New Renewal</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px] font-bold">
                  {application.status === 'Rejected' ? '✓' : ''}
                </div>
                <span>Disapproved</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-0.5 text-xs">
            <div className="flex-1 flex items-end">
              <span className="font-bold mr-2 whitespace-nowrap">Solo Parent ID Number:</span>
              <span className="flex-1 border-b border-black px-2 font-bold">{application.id_number}</span>
            </div>
            <div className="w-64 flex items-end">
              <span className="font-bold mr-2 whitespace-nowrap">Date Issuance:</span>
              <span className="flex-1 border-b border-black px-2"></span>
            </div>
          </div>
          <div className="flex items-end text-xs">
            <span className="font-bold mr-2">Solo parent category:</span>
            <span className="flex-1 border-b border-black px-2 font-bold">{application.category_code}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper for age calc
function calculateAge(dob: string) {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default PrintApplicationForm;
