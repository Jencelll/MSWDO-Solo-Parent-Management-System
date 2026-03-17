
export enum ApplicationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DISAPPROVED = 'Disapproved'
}

export enum EmploymentStatus {
  EMPLOYED = 'Employed',
  SELF_EMPLOYED = 'Self-employed',
  NOT_EMPLOYED = 'Not employed'
}

export interface FamilyMember {
  id?: number;
  fullName: string;
  relationship: string;
  age: number;
  dob: string;
  civilStatus: string;
  educationalAttainment: string;
  occupation: string;
  monthlyIncome: number;
}

export interface EmergencyContact {
  fullName: string;
  relationship: string;
  address: string;
  contactNumber: string;
}

export interface Applicant {
  id?: number;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  civilStatus: string;
  placeOfBirth: string;
  address: string;
  barangay: string;
  educationalAttainment: string;
  occupation: string;
  companyAgency: string;
  employmentStatus: EmploymentStatus;
  religion: string;
  monthlyIncome: number;
  contactNumber: string;
  emailAddress: string;
  isPantawid: boolean;
  isIndigenous: boolean;
  isLGBTQ: boolean;
  classificationDetails: string;
  needsProblems: string;
  houseOwnershipStatus: string;
  houseCondition: string;
  familyComposition: FamilyMember[];
  emergencyContact: EmergencyContact;
}

export interface ApplicationRecord {
  id: number;
  applicant: Applicant;
  caseNumber: string;
  idNumber?: string;
  status: ApplicationStatus;
  categoryCode?: string;
  benefitCode?: string;
  dateApplied: string;
  dateIssued?: string;
}

export interface DashboardStats {
  totalApplications: number;
  pending: number;
  approved: number;
  disapproved: number;
  totalRegistered: number;
  avgProcessingTime: string;
}
