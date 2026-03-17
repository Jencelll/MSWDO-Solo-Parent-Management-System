
import React, { useState, useEffect } from 'react';
import { BARANGAYS } from '../constants';
import { Save, ChevronRight, ChevronLeft, Plus, Trash2, UserPlus, CreditCard, Clock, CheckCircle2, XCircle, Upload, User, Users, FileText, Check, AlertCircle } from 'lucide-react';
import { Applicant, EmploymentStatus } from '../types';
import { API_CONFIG } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../components/Notification';

const calculateAge = (dob: string | Date): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) ? 0 : Math.max(0, age);
};

const CATEGORIES = [
  { code: 'a1', desc: 'Birth of a Child as a consequence of rape' },
  { code: 'a2', desc: 'Widow/widower' },
  { code: 'a3', desc: 'Spouse of person deprived of liberty (PDL)' },
  { code: 'a4', desc: 'Spouse of person with disability (PWD)' },
  { code: 'a5', desc: 'Due to de facto separation' },
  { code: 'a6', desc: 'Due to nullity of marriage' },
  { code: 'a7', desc: 'Abandoned' },
  { code: 'b', desc: 'Spouse of the OFW / Relative of the OFW' },
  { code: 'c', desc: 'Unmarried mother/father who keeps and rears his/her child' },
  { code: 'd', desc: 'Legal guardian, adoptive or foster parent' },
  { code: 'e', desc: 'Any relative within the fourth (4th) degree of consanguinity or affinity' },
  { code: 'f', desc: 'Pregnant woman who provides sole parental care and support' },
];

const BENEFITS = [
  { code: 'A', desc: 'Subsidy, PhilHealth, Prioritization in housing' },
  { code: 'B', desc: '10% Discount and VAT Exemption on selected items' },
];

interface NewApplicationProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  variant?: 'admin' | 'user';
  application?: any; // Pass existing application for edit mode
}

const NewApplication: React.FC<NewApplicationProps> = ({ onSubmit, onCancel, variant = 'admin', application }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const targetId = id || (application ? application.id : null);
  const [view, setView] = useState<'landing' | 'new-form' | 'existing-form'>(
    variant === 'user' ? 'new-form' : (application || id ? 'new-form' : 'landing')
  );
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  
  const handleFileChange = (requirement: string, file: File) => {
    setFiles(prev => ({
      ...prev,
      [requirement]: file
    }));
  };

  const removeFile = (requirement: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[requirement];
      return newFiles;
    });
  };

  const [familyMembers, setFamilyMembers] = useState([
    { name: '', rel: '', age: '', dob: '', status: 'Single', edu: 'Elementary', occ: '', income: '', isPwd: 'No' }
  ]);

  // Pre-fill form if application is provided (for edit mode)
  useEffect(() => {
    console.log('Application data received:', application);
    if (application) {
      setIsLoadingData(true);
      const applicant = application.applicant;
      console.log('Applicant data:', applicant);
      if (applicant) {
        setFormData({
          firstName: applicant.first_name || '',
          middleName: applicant.middle_name || '',
          lastName: applicant.last_name || '',
          dob: applicant.dob || '',
          age: calculateAge(applicant.dob || ''),
          sex: applicant.sex || 'Female',
          civilStatus: applicant.civil_status || 'Single',
          placeOfBirth: applicant.place_of_birth || '',
          address: applicant.address || '',
          barangay: applicant.barangay || BARANGAYS[0],
          educationalAttainment: applicant.educational_attainment || 'High School',
          occupation: applicant.occupation || '',
          companyAgency: applicant.company_agency || '',
          employmentStatus: applicant.employment_status || EmploymentStatus.EMPLOYED,
          religion: applicant.religion || '',
          monthlyIncome: applicant.monthly_income || 0,
          contactNumber: applicant.contact_number || '',
          emailAddress: applicant.email_address || '',
          isPantawid: Boolean(applicant.is_pantawid_beneficiary),
          isIndigenous: Boolean(applicant.is_indigenous_person),
          isLGBTQ: Boolean(applicant.is_lgbtq),
          classificationDetails: applicant.classification_details || '',
          needsProblems: applicant.needs_problems || '',
          houseOwnershipStatus: applicant.house_ownership_status || '',
          houseCondition: applicant.house_condition || '',
          emergencyContact: applicant.emergency_contacts && applicant.emergency_contacts.length > 0 ? {
            fullName: applicant.emergency_contacts[0].full_name || '',
            relationship: applicant.emergency_contacts[0].relationship || '',
            address: applicant.emergency_contacts[0].address || '',
            contactNumber: applicant.emergency_contacts[0].contact_number || ''
          } : { fullName: '', relationship: '', address: '', contactNumber: '' }
        });

        if (applicant.family_members && applicant.family_members.length > 0) {
          setFamilyMembers(applicant.family_members.map((m: any) => ({
            name: m.full_name || '',
            rel: m.relationship || '',
            age: calculateAge(m.dob || '').toString(),
            dob: m.dob || '',
            status: m.civil_status || 'Single',
            edu: m.educational_attainment || 'Elementary',
            occ: m.occupation || '',
            income: m.monthly_income ? m.monthly_income.toString() : '',
            isPwd: m.is_pwd ? 'Yes' : 'No'
          })));
        }
      }
      setIsLoadingData(false);
    }
  }, [application]);

  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPLICATIONS}/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            const applicant = data.applicant;
            
            if (data.documents) {
              setExistingDocuments(data.documents);
            }
            
            setFormData({
              firstName: applicant.first_name,
              middleName: applicant.middle_name || '',
              lastName: applicant.last_name,
              dob: applicant.dob,
              age: calculateAge(applicant.dob),
              sex: applicant.sex,
              civilStatus: applicant.civil_status || 'Single',
              placeOfBirth: applicant.place_of_birth || '',
              address: applicant.address,
              barangay: applicant.barangay,
              educationalAttainment: applicant.educational_attainment || 'High School',
              occupation: applicant.occupation || '',
              companyAgency: applicant.company_agency || '',
              employmentStatus: applicant.employment_status || EmploymentStatus.EMPLOYED,
              religion: applicant.religion || '',
              monthlyIncome: applicant.monthly_income || 0,
              contactNumber: applicant.contact_number || '',
              emailAddress: applicant.email_address || '',
              isPantawid: Boolean(applicant.is_pantawid_beneficiary),
              isIndigenous: Boolean(applicant.is_indigenous_person),
              isLGBTQ: Boolean(applicant.is_lgbtq),
              classificationDetails: applicant.classification_details || '',
              needsProblems: applicant.needs_problems || '',
              houseOwnershipStatus: applicant.house_ownership_status || '',
              houseCondition: applicant.house_condition || '',
              emergencyContact: applicant.emergency_contacts && applicant.emergency_contacts.length > 0 ? {
                fullName: applicant.emergency_contacts[0].full_name || '',
                relationship: applicant.emergency_contacts[0].relationship || '',
                address: applicant.emergency_contacts[0].address || '',
                contactNumber: applicant.emergency_contacts[0].contact_number || ''
              } : { fullName: '', relationship: '', address: '', contactNumber: '' }
            });

            if (applicant.family_members && applicant.family_members.length > 0) {
               setFamilyMembers(applicant.family_members.map((m: any) => ({
                 name: m.full_name || '',
                 rel: m.relationship || '',
                 age: calculateAge(m.dob || '').toString(),
                 dob: m.dob || '',
                 status: m.civil_status || 'Single',
                 edu: m.educational_attainment || 'Elementary',
                 occ: m.occupation || '',
                 income: m.monthly_income ? m.monthly_income.toString() : '',
                 isPwd: m.is_pwd ? 'Yes' : 'No'
               })));
            }

            setView('new-form');
          }
        } catch (error) {
          console.error("Error fetching application", error);
        }
      };
      fetchApplication();
    }
  }, [id]);

  const [formData, setFormData] = useState<Partial<Applicant>>({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    age: 0,
    sex: 'Female',
    civilStatus: 'Single',
    placeOfBirth: '',
    address: '',
    barangay: BARANGAYS[0],
    educationalAttainment: 'High School',
    occupation: '',
    companyAgency: '',
    employmentStatus: EmploymentStatus.EMPLOYED,
    religion: '',
    monthlyIncome: 0,
    contactNumber: '',
    emailAddress: '',
    isPantawid: false,
    isIndigenous: false,
    isLGBTQ: false,
    classificationDetails: '',
    needsProblems: '',
    houseOwnershipStatus: '',
    houseCondition: '',
    emergencyContact: {
      fullName: '',
      relationship: '',
      address: '',
      contactNumber: ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        // Handle checkboxes if any
    } else if (type === 'radio') {
        // Handle radio buttons (pantawid, indigenous, lgbtq)
        if (name === 'pantawid') setFormData(prev => ({ ...prev, isPantawid: value === 'Yes' }));
        if (name === 'indigenous') setFormData(prev => ({ ...prev, isIndigenous: value === 'Yes' }));
        if (name === 'lgbtq') setFormData(prev => ({ ...prev, isLGBTQ: value === 'Yes' }));
    } else if (name === 'contactNumber') {
        // Enforce numeric only and max 11 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 11);
        setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
        if (name === 'dob') {
                setFormData(prev => ({ ...prev, [name]: value, age: calculateAge(value) }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
    }
  };

  const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      
      let finalValue = value;
      if (name === 'contactNumber') {
         finalValue = value.replace(/\D/g, '').slice(0, 11);
      }

      setFormData(prev => ({
          ...prev,
          emergencyContact: {
              ...(prev.emergencyContact || { fullName: '', relationship: '', address: '', contactNumber: '' }),
              [name]: finalValue
          }
      }));
  };

  const handleFamilyMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...familyMembers];
    // @ts-ignore
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };

    if (field === 'dob') {
        // @ts-ignore
        updatedMembers[index].age = calculateAge(value).toString();
    }

    setFamilyMembers(updatedMembers);
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, boolean> = {};
    
    if (currentStep === 1) {
      if (!formData.firstName?.trim()) newErrors.firstName = true;
      if (!formData.lastName?.trim()) newErrors.lastName = true;
      if (!formData.dob) newErrors.dob = true;
      if (!formData.sex) newErrors.sex = true;
      if (!formData.civilStatus) newErrors.civilStatus = true;
      if (!formData.address?.trim()) newErrors.address = true;
      if (!formData.barangay) newErrors.barangay = true;
      
      // Validate Contact Number if provided
      if (formData.contactNumber && formData.contactNumber.length !== 11) {
         newErrors.contactNumber = true;
         alert('Contact number must be 11 digits.');
      }

      if (view === 'existing-form') {
        if (!existingData.categoryCode) newErrors.categoryCode = true;
        if (!existingData.benefitCode) newErrors.benefitCode = true;
        if (!existingData.dateIssued) newErrors.dateIssued = true;
        if (!existingData.expirationDate) newErrors.expirationDate = true;
      }
    } else if (currentStep === 2) {
      const hasEmptyFields = familyMembers.some(m => !m.name.trim() || !m.rel.trim());
      if (hasEmptyFields) {
         newErrors.familyMembers = true;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setIsTransitioning(true);
      setStep(step + 1);
      window.scrollTo(0, 0);
      setTimeout(() => setIsTransitioning(false), 1000);
    } else {
      if (step === 2) {
        notification.error('Please ensure all family members have a Name and Relationship entered.');
      } else {
        notification.error('Please fill in all required fields.');
      }
    }
  };

  const [existingData, setExistingData] = useState<{
    idNumber: string;
    categoryCode: string;
    benefitCode: string[];
    dateIssued: string;
    expirationDate: string;
  }>({
    idNumber: '',
    categoryCode: '',
    benefitCode: [],
    dateIssued: '',
    expirationDate: '',
  });

  const handleBenefitChange = (code: string, checked: boolean) => {
    setExistingData(prev => {
        const current = prev.benefitCode;
        if (checked) {
            if (current.length >= 2) return prev; 
            return { ...prev, benefitCode: [...current, code] };
        } else {
            return { ...prev, benefitCode: current.filter(c => c !== code) };
        }
    });
  };

  const handleExistingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dateIssued' && value) {
        const issuedDate = new Date(value);
        if (!isNaN(issuedDate.getTime())) {
            const expirationDate = new Date(issuedDate);
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            
            const yyyy = expirationDate.getFullYear();
            const mm = String(expirationDate.getMonth() + 1).padStart(2, '0');
            const dd = String(expirationDate.getDate()).padStart(2, '0');
            const formattedExpiration = `${yyyy}-${mm}-${dd}`;
            
            setExistingData(prev => ({ 
                ...prev, 
                [name]: value,
                expirationDate: formattedExpiration
            }));
            return;
        }
    }

    setExistingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validate emergency contact if any field is filled
    if (formData.emergencyContact && 
        (formData.emergencyContact.fullName?.trim() || 
         formData.emergencyContact.relationship?.trim() || 
         formData.emergencyContact.address?.trim() || 
         formData.emergencyContact.contactNumber?.trim())) {
      
      // If any emergency contact field is filled, fullName is required
      if (!formData.emergencyContact.fullName?.trim()) {
        notification.error('Please provide the emergency contact name or clear all emergency contact fields.');
        return;
      }

      if (formData.emergencyContact.contactNumber && formData.emergencyContact.contactNumber.length !== 11) {
        notification.error('Emergency contact number must be 11 digits.');
        return;
      }
    }

    // Additional validation for existing records
    if (view === 'existing-form') {
        if (!existingData.categoryCode || existingData.benefitCode.length === 0 || !existingData.dateIssued || !existingData.expirationDate) {
            notification.error('Please fill in all required existing record details (Category, Benefit, Date Issued, Expiration).');
            return;
        }
    }
    
    setIsSubmitting(true);
    
    try {
      // Construct final applicant object matching API requirements
      const submissionData: any = {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        dob: formData.dob,
        sex: formData.sex,
        place_of_birth: formData.placeOfBirth,
        address: formData.address,
        barangay: formData.barangay,
        educational_attainment: formData.educationalAttainment,
        occupation: formData.occupation,
        company_agency: formData.companyAgency,
        employment_status: formData.employmentStatus,
        religion: formData.religion,
        monthly_income: formData.monthlyIncome,
        contact_number: formData.contactNumber,
        email_address: formData.emailAddress,
        is_pantawid_beneficiary: formData.isPantawid,
        is_indigenous_person: formData.isIndigenous,
        is_lgbtq: formData.isLGBTQ,
        classification_details: formData.classificationDetails,
        needs_problems: formData.needsProblems,
        house_ownership_status: formData.houseOwnershipStatus,
        house_condition: formData.houseCondition,
        family_members: familyMembers.map(m => ({
          full_name: m.name,
          relationship: m.rel,
          age: parseInt(m.age) || 0,
          dob: m.dob,
          civil_status: m.status,
          educational_attainment: m.edu,
          occupation: m.occ,
          monthly_income: parseFloat(m.income) || 0,
          is_pwd: m.isPwd === 'Yes'
        })),
        emergency_contacts: formData.emergencyContact && formData.emergencyContact.fullName?.trim() ? [{
          full_name: formData.emergencyContact.fullName.trim(),
          relationship: formData.emergencyContact.relationship?.trim() || '',
          address: formData.emergencyContact.address?.trim() || '',
          contact_number: formData.emergencyContact.contactNumber?.trim() || ''
        }] : []
      };

      // Add existing record specific fields
      if (view === 'existing-form') {
          submissionData.id_number = existingData.idNumber;
          submissionData.category_code = existingData.categoryCode;
          submissionData.benefit_code = existingData.benefitCode.join(',');
          submissionData.date_issued = existingData.dateIssued;
          submissionData.expiration_date = existingData.expirationDate;
      }

      console.log('Submitting application:', submissionData);

      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPLICATIONS}`;
      // Use id from params (admin edit) OR application.id (user edit)
      
      if (targetId) {
          url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPLICATIONS}/${targetId}`;
      } else if (view === 'existing-form') {
          url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPLICATIONS_EXISTING}`;
      }
      
      const method = targetId ? 'PUT' : 'POST';

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        // Upload documents if any
        const appId = targetId || result.data?.id || result.id;
        if (appId && Object.keys(files).length > 0) {
            const formData = new FormData();
            Object.entries(files).forEach(([type, file]) => {
                formData.append('documents[]', file as Blob);
                formData.append('types[]', type);
            });

            try {
                const uploadResponse = await fetch(`${API_CONFIG.BASE_URL}/api/applications/${appId}/documents`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {
                    console.error('File upload failed');
                    notification.warning('Application submitted, but some documents failed to upload. Please try uploading them again later.');
                }
            } catch (uploadError) {
                console.error('Error uploading documents:', uploadError);
                notification.warning('Application submitted, but an error occurred while uploading documents.');
            }
        }

        notification.success(view === 'existing-form' ? 'Existing record encoded and registered successfully!' : (targetId ? 'Application updated successfully!' : 'Application submitted successfully!'));
        if (onSubmit) {
          onSubmit();
        }
        
        // Only navigate for admin users (who use routing)
        // User portal handles view switching via onSubmit callback
        if (variant !== 'user') {
          navigate('/list');
        }
      } else {
        // Show specific error message for duplicate application
        if (result.application) {
             notification.error("You already have an active application. The page will refresh to load your application status.");
             window.location.reload();
             return;
        }
        if (result.errors && result.errors.general) {
          notification.error(result.errors.general[0]);
        } else {
          notification.error(`Error ${targetId ? 'updating' : 'submitting'} application: ` + (result.message || 'Unknown error') + (result.errors ? '\n' + JSON.stringify(result.errors) : ''));
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      notification.error(`Error submitting application: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  useEffect(() => {
    if (view === 'landing' && variant !== 'user') {
      const fetchRecent = async () => {
        try {
          // Use the full URL if getApiUrl is meant to be used, otherwise rely on proxy/CORS
          // Based on existing code (line 28), it uses relative path or relies on proxy
          // But to be safe and consistent with possible proxy setup
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD_RECENT}`);
          if (response.ok) {
            const data = await response.json();
            setRecentRecords(data.map((item: any) => ({
              name: item.applicant ? `${item.applicant.first_name} ${item.applicant.last_name}` : 'N/A',
              barangay: item.applicant?.barangay || 'N/A',
              status: item.status,
              date: new Date(item.created_at).toLocaleDateString()
            })));
          }
        } catch (error) {
          console.error('Failed to fetch recent records:', error);
        }
      };
      fetchRecent();
    }
  }, [view]);

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', rel: '', age: '', dob: '', status: 'Single', edu: 'Elementary', occ: '', income: '', isPwd: 'No' }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  if (view === 'landing') {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Add Solo Parent Record</h2>
          <p className="text-slate-500 dark:text-slate-400">Select the type of registration you wish to process.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setView('new-form')}
            className="text-left group relative bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <UserPlus size={120} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="bg-violet-100 dark:bg-violet-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
                <UserPlus size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">New Solo Parent Applicant</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Create a record for a new applicant who does not yet have a Solo Parent ID.</p>
              </div>
              <div className="flex items-center text-violet-600 dark:text-violet-400 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform">
                <span>Start Registration</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setView('existing-form')}
            className="text-left group relative bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <CreditCard size={120} className="text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform duration-300">
                <CreditCard size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">Existing Solo Parent Record</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Encode a record for an applicant who already possesses a valid Solo Parent ID.</p>
              </div>
              <div className="flex items-center text-fuchsia-600 dark:text-fuchsia-400 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform">
                <span>Encode Existing</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 font-bold text-xs tracking-wider uppercase">
            <Clock size={14} />
            <span>Recently Added Records</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Barangay</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{record.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{record.barangay}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Active' || record.status === 'Approved' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' 
                          : record.status === 'Pending' 
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                            : record.status === 'Disapproved'
                              ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {record.status === 'Active' || record.status === 'Approved' ? <CheckCircle2 size={12} className="mr-1" /> : 
                         record.status === 'Disapproved' ? <XCircle size={12} className="mr-1" /> :
                         <Clock size={12} className="mr-1" />}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{record.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {isLoadingData && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <span className="ml-3 text-slate-600">Loading application data...</span>
        </div>
      )}
      
      {!isLoadingData && (
        <>
          {variant === 'admin' && (
            <button 
              onClick={() => setView('landing')}
              className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium"
            >
              <ChevronLeft size={20} />
              <span>Back to Selection</span>
            </button>
          )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {view === 'new-form' 
              ? (variant === 'user' ? 'My Solo Parent Application' : (id ? 'Edit Solo Parent Application' : 'New Solo Parent Application')) 
              : 'Existing Solo Parent Record'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {view === 'new-form' ? (id ? 'Update existing application details' : 'RA 11861 Expanded Solo Parents Welfare Act') : 'Encode details for existing Solo Parent ID holder'}
          </p>
        </div>
        <div className="w-full max-w-4xl mx-auto py-8 px-2 md:px-4">
          <div className="relative">
            {/* Progress Bar Container */}
            <div className="absolute top-5 left-0 w-full px-8 md:px-12 -translate-y-1/2 -z-0">
               <div className="relative w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                 <div 
                   className="absolute left-0 top-0 h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
                   style={{ width: `${((step - 1) / 3) * 100}%` }}
                 ></div>
               </div>
            </div>

            <div className="flex justify-between items-start relative z-10 w-full">
              {[
                { num: 1, label: "Personal Info", icon: User },
                { num: 2, label: "Family Members", icon: Users },
                { num: 3, label: "Documents", icon: Upload },
                { num: 4, label: "Classification", icon: FileText }
              ].map((item) => (
                <div key={item.num} className="flex flex-col items-center group flex-1">
                  <div 
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-[3px] md:border-[4px] relative mb-2 md:mb-3
                      ${step >= item.num 
                        ? 'bg-violet-600 border-white dark:border-slate-900 text-white shadow-xl shadow-violet-600/20 scale-110' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      }
                      ${step === item.num ? 'ring-2 md:ring-4 ring-violet-100 dark:ring-violet-900/30' : ''}
                    `}
                  >
                    {step > item.num ? (
                      <Check size={14} className="md:w-4 md:h-4 animate-in zoom-in duration-300" strokeWidth={3} />
                    ) : (
                      <item.icon size={14} className="md:w-4 md:h-4" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className={`flex flex-col items-center text-center transition-all duration-300 ${
                    step === item.num ? 'opacity-100 transform translate-y-0' : 'opacity-60 transform translate-y-1'
                  }`}>
                    <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider leading-tight hidden sm:block
                      ${step >= item.num ? 'text-violet-700 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}
                    `}>
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit} onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
            e.preventDefault();
          }
        }}>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {view === 'existing-form' && (
                <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 p-6 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-800 mb-8">
                  <div className="flex items-center space-x-2 pb-4 border-b border-fuchsia-200 dark:border-fuchsia-800 mb-6">
                    <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">ID</div>
                    <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wide text-sm">Existing Record Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Solo Parent ID Number</label>
                      <input 
                        type="text" 
                        name="idNumber" 
                        value={existingData.idNumber} 
                        onChange={handleExistingChange} 
                        className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 border rounded-xl px-4 py-3 outline-none dark:text-white" 
                        placeholder="Leave blank to auto-generate" 
                      />
                      <p className="text-[10px] text-slate-400">If blank: PSG-SP-YYYY-XXXXX</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Category <span className="text-red-500">*</span></label>
                      <select 
                        name="categoryCode" 
                        value={existingData.categoryCode} 
                        onChange={handleExistingChange} 
                        className={`w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 outline-none dark:text-white ${errors.categoryCode ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`}
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat.code} value={cat.code}>{cat.code.toUpperCase()} - {cat.desc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Benefit Level (Select up to 2) <span className="text-red-500">*</span></label>
                      <div className={`space-y-2 bg-white dark:bg-slate-800 border rounded-xl p-3 ${errors.benefitCode ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`}>
                        {BENEFITS.map(ben => (
                          <label key={ben.code} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                            <input 
                              type="checkbox"
                              checked={existingData.benefitCode.includes(ben.code)}
                              onChange={(e) => handleBenefitChange(ben.code, e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                              disabled={!existingData.benefitCode.includes(ben.code) && existingData.benefitCode.length >= 2}
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{ben.code} - {ben.desc}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date Issued <span className="text-red-500">*</span></label>
                        <input 
                          type="date" 
                          name="dateIssued" 
                          value={existingData.dateIssued} 
                          onChange={handleExistingChange} 
                          className={`w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 outline-none dark:text-white ${errors.dateIssued ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Expiration Date <span className="text-red-500">*</span></label>
                        <input 
                          type="date" 
                          name="expirationDate" 
                          value={existingData.expirationDate} 
                          onChange={handleExistingChange} 
                          className={`w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 outline-none dark:text-white ${errors.expirationDate ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">I</div>
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wide text-sm">Identifying Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Row 1: First Name, Middle Name, Last Name */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all dark:text-white uppercase ${errors.firstName ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`} placeholder="" />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Middle Name</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all dark:text-white uppercase" placeholder="" />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all dark:text-white uppercase ${errors.lastName ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`} placeholder="" />
                </div>

                {/* Row 2: Date of Application, DOB, Age */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date of Application</label>
                  <input type="date" className="w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white cursor-not-allowed" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-3 outline-none dark:text-white ${errors.dob ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`} />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Age</label>
                  <input type="number" name="age" value={formData.age} readOnly className="w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white cursor-not-allowed" />
                </div>

                {/* Row 3: Sex, Civil Status, Religion */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sex <span className="text-red-500">*</span></label>
                  <select name="sex" value={formData.sex} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white">
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Civil Status <span className="text-red-500">*</span></label>
                  <select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white">
                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                    <option>Separated</option>
                    <option>Annulled</option>
                  </select>
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Religion</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white" placeholder="Catholic, INC, etc." />
                </div>

                {/* Row 4: Educational Attainment, Place of Birth */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Educational Attainment</label>
                  <select name="educationalAttainment" value={formData.educationalAttainment} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white">
                    <option>Elementary</option>
                    <option>High School</option>
                    <option>College</option>
                    <option>Vocational</option>
                    <option>Post-Graduate</option>
                    <option>None</option>
                  </select>
                </div>
                <div className="md:col-span-8 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Place of Birth</label>
                  <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white uppercase" placeholder="City/Municipality, Province" />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Barangay <span className="text-red-500">*</span></label>
                  <select name="barangay" value={formData.barangay} onChange={handleInputChange} className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-3 outline-none dark:text-white ${errors.barangay ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`}>
                    {BARANGAYS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>

                {/* Row 6: Address */}
                <div className="md:col-span-12 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Address <span className="text-red-500">*</span></label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-3 outline-none dark:text-white uppercase ${errors.address ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`} placeholder="House No., Street Name, Subdivision/Sitio" />
                </div>

                {/* Row 7: Email, Contact */}
                <div className="md:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
                  <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white" placeholder="email@example.com" />
                </div>
                <div className="md:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contact Number</label>
                  <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-3 outline-none dark:text-white ${errors.contactNumber ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-600'}`} placeholder="0912 345 6789" maxLength={11} />
                </div>

                {/* Row 8: Employment */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Employment Status</label>
                  <select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white">
                    <option>Employed</option>
                    <option>Self-employed</option>
                    <option>Not employed</option>
                  </select>
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Occupation</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white uppercase" placeholder="e.g. VENDOR, OFFICE WORKER" />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Company/Agency</label>
                  <input type="text" name="companyAgency" value={formData.companyAgency} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white uppercase" />
                </div>

                {/* Row 9: Income, Pantawid, Indigenous */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Monthly Income</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                    <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl pl-8 pr-4 py-3 outline-none dark:text-white" placeholder="0.00" />
                  </div>
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Pantawid Beneficiary?</label>
                  <div className="flex items-center space-x-6 h-[50px] px-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="pantawid" value="Yes" checked={formData.isPantawid === true} onChange={handleInputChange} className="w-4 h-4 text-violet-600 dark:text-violet-400 focus:ring-violet-500" />
                      <span className="text-sm dark:text-slate-300">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="pantawid" value="No" checked={formData.isPantawid === false} onChange={handleInputChange} className="w-4 h-4 text-violet-600 dark:text-violet-400 focus:ring-violet-500" />
                      <span className="text-sm dark:text-slate-300">No</span>
                    </label>
                  </div>
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Indigenous Person?</label>
                  <div className="flex items-center space-x-6 h-[50px] px-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="indigenous" value="Yes" checked={formData.isIndigenous === true} onChange={handleInputChange} className="w-4 h-4 text-violet-600 dark:text-violet-400 focus:ring-violet-500" />
                      <span className="text-sm dark:text-slate-300">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="indigenous" value="No" checked={formData.isIndigenous === false} onChange={handleInputChange} className="w-4 h-4 text-violet-600 dark:text-violet-400 focus:ring-violet-500" />
                      <span className="text-sm dark:text-slate-300">No</span>
                    </label>
                  </div>
                </div>

                {/* Row 10: LGBTQ */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">LGBTQ+?</label>
                  <div className="flex items-center space-x-6 h-[50px] px-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="lgbtq" value="Yes" checked={formData.isLGBTQ === true} onChange={handleInputChange} className="w-4 h-4 text-violet-600 dark:text-violet-400 focus:ring-violet-500" />
                      <span className="text-sm dark:text-slate-300">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="lgbtq" value="No" checked={formData.isLGBTQ === false} onChange={handleInputChange} className="w-4 h-4 text-violet-600 dark:text-violet-400 focus:ring-violet-500" />
                      <span className="text-sm dark:text-slate-300">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">II</div>
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wide text-sm">Family Composition</h3>
              </div>

              {errors.familyMembers && (
                <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center text-rose-600 dark:text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  Please provide the Name and Relationship for all family members listed.
                </div>
              )}

              <div className={`overflow-x-auto rounded-2xl border ${errors.familyMembers ? 'border-rose-300 dark:border-rose-700 ring-1 ring-rose-300 dark:ring-rose-700' : 'border-slate-200 dark:border-slate-700'}`}>
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      <th className="px-4 py-3 min-w-[200px]">Full Name</th>
                      <th className="px-4 py-3 min-w-[150px]">Relationship</th>
                      <th className="px-4 py-3 min-w-[80px]">Age</th>
                      <th className="px-4 py-3 min-w-[150px]">Birthday</th>
                      <th className="px-4 py-3 min-w-[150px]">Civil Status</th>
                      <th className="px-4 py-3 min-w-[80px]">PWD</th>
                      <th className="px-4 py-3 min-w-[150px]">Educational</th>
                      <th className="px-4 py-3 min-w-[150px]">Occupation</th>
                      <th className="px-4 py-3 min-w-[120px]">Monthly Inc.</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {familyMembers.map((member, idx) => (
                      <tr key={idx}>
                        <td className="p-2"><input type="text" value={member.name} onChange={(e) => handleFamilyMemberChange(idx, 'name', e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none p-2 dark:text-white dark:placeholder-slate-500" placeholder="Child's Name" /></td>
                        <td className="p-2"><input type="text" value={member.rel} onChange={(e) => handleFamilyMemberChange(idx, 'rel', e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none p-2 dark:text-white dark:placeholder-slate-500" placeholder="Daughter/Son" /></td>
                        <td className="p-2"><input type="number" value={member.age} readOnly className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 rounded border-none focus:ring-0 outline-none p-2 dark:text-white cursor-not-allowed" placeholder="0" /></td>
                        <td className="p-2"><input type="date" value={member.dob} onChange={(e) => handleFamilyMemberChange(idx, 'dob', e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none p-2 dark:text-white" /></td>
                        <td className="p-2">
                          <select value={member.status} onChange={(e) => handleFamilyMemberChange(idx, 'status', e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none p-2 dark:text-white">
                            <option className="dark:bg-slate-800">Single</option>
                            <option className="dark:bg-slate-800">Married</option>
                            <option className="dark:bg-slate-800">Widowed</option>
                            <option className="dark:bg-slate-800">Separated</option>
                            <option className="dark:bg-slate-800">Annulled</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <select value={member.isPwd || 'No'} onChange={(e) => handleFamilyMemberChange(idx, 'isPwd', e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none p-2 dark:text-white">
                            <option className="dark:bg-slate-800" value="No">No</option>
                            <option className="dark:bg-slate-800" value="Yes">Yes</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <select value={member.edu} onChange={(e) => handleFamilyMemberChange(idx, 'edu', e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none p-2 dark:text-white">
                            <option className="dark:bg-slate-800">Elementary</option>
                            <option className="dark:bg-slate-800">High School</option>
                            <option className="dark:bg-slate-800">College</option>
                            <option className="dark:bg-slate-800">Vocational</option>
                            <option className="dark:bg-slate-800">None</option>
                          </select>
                        </td>
                        <td className="p-2"><input type="text" value={member.occ} onChange={(e) => handleFamilyMemberChange(idx, 'occ', e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none p-2 dark:text-white dark:placeholder-slate-500" placeholder="Occupation" /></td>
                        <td className="p-2"><input type="number" value={member.income} onChange={(e) => handleFamilyMemberChange(idx, 'income', e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none p-2 dark:text-white dark:placeholder-slate-500" placeholder="0.00" /></td>
                        <td className="p-2">
                          <button onClick={() => removeFamilyMember(idx)} type="button" className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-2">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button 
                  type="button"
                  onClick={addFamilyMember}
                  className="w-full py-4 text-violet-600 dark:text-violet-400 text-sm font-bold flex items-center justify-center space-x-2 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors border-t border-slate-200 dark:border-slate-700"
                >
                  <Plus size={16} />
                  <span>Add Family Member</span>
                </button>
              </div>

            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">III</div>
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wide text-sm">Document Requirements</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Solo Parent Application Form",
                  "Sworn Statement (Affidavit of Solo Parent)",
                  "Brgy Cert of Solo Parent",
                  "Brgy Cert of Applicant",
                  "Brgy Cert of Children",
                  "Birth Certificate (PSA) of the Child/ren",
                  "Marriage Contract (for married)",
                  "Death Cert (for widow)",
                  "1x1 ID Picture (2pcs)",
                  "Photo of Parent and Child/ren",
                  "ITR (for working applicants)",
                  "Applicant's Narrative"
                ].map((req, idx) => {
                  const existingDoc = existingDocuments.find(d => d.type === req);
                  return (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4 flex items-center justify-between hover:border-violet-300 dark:hover:border-violet-500 transition-colors group">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{req}</p>
                      {files[req] ? (
                        <p className="text-xs text-emerald-600 font-medium flex items-center">
                          <CheckCircle2 size={12} className="mr-1" />
                          New: {files[req].name} ({(files[req].size / 1024).toFixed(1)} KB)
                        </p>
                      ) : existingDoc ? (
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-blue-600 font-medium flex items-center">
                            <CheckCircle2 size={12} className="mr-1" />
                            Uploaded: 
                          </p>
                          <a 
                            href={existingDoc.file_path.startsWith('/storage/') ? existingDoc.file_path : existingDoc.file_path.startsWith('storage/') ? `/${existingDoc.file_path}` : `/storage/${existingDoc.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 font-medium hover:underline truncate max-w-[150px]"
                            title="View uploaded file"
                          >
                            {existingDoc.file_path.split('/').pop()}
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500">PDF, JPG or PNG (Max 5MB)</p>
                      )}
                    </div>
                    {files[req] ? (
                      <button
                        type="button"
                        onClick={() => removeFile(req)}
                        className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <label className="cursor-pointer bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors flex items-center space-x-2">
                        <Upload size={14} />
                        <span>{existingDoc ? 'Replace' : 'Upload'}</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileChange(req, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">IV</div>
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wide text-sm">Classification & Needs</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Classification/Circumstances (Dahilan bakit naging solo parent)</label>
                    <textarea name="classificationDetails" value={formData.classificationDetails} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-500 dark:text-white" placeholder="Explain the circumstances here..."></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Needs/Problems (Kinakailangan/Problema)</label>
                    <textarea name="needsProblems" value={formData.needsProblems} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-500 dark:text-white" placeholder="List any specific needs or problems..."></textarea>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700 pt-6">
                <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">V</div>
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wide text-sm">House ownership status</h3>
              </div>
              <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">House ownership status</label>
                    <input type="text" name="houseOwnershipStatus" value={formData.houseOwnershipStatus} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white" placeholder="Enter house ownership status" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">What is your house made of?</label>
                    <input type="text" name="houseCondition" value={formData.houseCondition} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white" placeholder="Enter house material" />
                  </div>
              </div>

              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-700 pt-6">
                <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">VI</div>
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wide text-sm">In Case of Emergency</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contact Name <span className="text-red-500">*</span> <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Required if any emergency contact info is provided)</span></label>
                  <input type="text" name="fullName" value={formData.emergencyContact?.fullName || ''} onChange={handleEmergencyChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white" placeholder="Emergency contact person's name" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Relationship</label>
                  <input type="text" name="relationship" value={formData.emergencyContact?.relationship || ''} onChange={handleEmergencyChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white" placeholder="e.g. Mother, Father, Sister" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contact Number</label>
                  <input type="tel" name="contactNumber" value={formData.emergencyContact?.contactNumber || ''} onChange={handleEmergencyChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white" placeholder="0912 345 6789" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Address</label>
                  <input type="text" name="address" value={formData.emergencyContact?.address || ''} onChange={handleEmergencyChange} className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none dark:text-white" placeholder="Complete address" />
                </div>
              </div>

              <div className="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-2xl border border-violet-100 dark:border-violet-800 mt-12">
                <p className="text-sm text-violet-800 dark:text-violet-300 font-medium italic">
                  "I hereby certify that the information given above are true and correct. I further understand that any misinterpretation that may have made will subject me to criminal and civil liabilities provided for by existing laws."
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row justify-between pt-8 border-t border-slate-100 dark:border-slate-700 gap-4">
            {step > 1 && (
              <button 
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={20} />
                <span>Back</span>
              </button>
            )}
            <div className={`flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto ${step === 1 ? 'ml-auto' : ''}`}>
              <button 
                type="button"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  } else if (variant !== 'user') {
                    navigate('/list');
                  }
                }}
                className="w-full md:w-auto px-6 py-3 font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center"
              >
                Cancel
              </button>
              {step < 4 ? (
                <button 
                  type="button"
                  onClick={handleNext}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95"
                >
                  <span>Continue</span>
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={isSubmitting || isTransitioning}
                  className={`w-full md:w-auto flex items-center justify-center space-x-2 px-10 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 ${isSubmitting || isTransitioning ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  <span>{isSubmitting ? (targetId ? 'Updating...' : 'Submitting...') : (targetId ? 'Update Application' : 'Submit Application')}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
        </>
      )}
    </div>
  );
};

export default NewApplication;
