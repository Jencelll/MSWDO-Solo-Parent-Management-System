
import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  LogOut, 
  FileText, 
  Users,
  ShieldCheck,
  Activity,
  CreditCard
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'new-application', label: 'New Application', icon: <UserPlus size={20} />, path: '/new' },
  { id: 'applications', label: 'Applications List', icon: <ClipboardList size={20} />, path: '/list' },
  { id: 'id-cards', label: 'ID Cards', icon: <CreditCard size={20} />, path: '/id-cards' },
  { id: 'registry', label: 'Registry', icon: <Users size={20} />, path: '/registry' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} />, path: '/reports' },
  { id: 'users', label: 'Users', icon: <Users size={20} />, path: '/users' },
  { id: 'system-logs', label: 'System Logs', icon: <Activity size={20} />, path: '/logs' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];

export const SOLO_PARENT_CATEGORIES = [
  { code: 'a1', label: 'Birth due to rape' },
  { code: 'a2', label: 'Widow/widower' },
  { code: 'a3', label: 'Spouse of PDL' },
  { code: 'a4', label: 'Spouse of PWD' },
  { code: 'a5', label: 'De facto separation' },
  { code: 'a6', label: 'Nullity of marriage' },
  { code: 'a7', label: 'Abandoned' },
  { code: 'b', label: 'Spouse/Relative of OFW' },
  { code: 'c', label: 'Unmarried parent' },
  { code: 'd', label: 'Legal/Adoptive parent' },
  { code: 'e', label: 'Relative (4th degree)' },
  { code: 'f', label: 'Pregnant sole provider' },
];

export const BENEFIT_CODES = [
  { code: 'A', label: 'Subsidy + PhilHealth + Housing' },
  { code: 'B', label: '10% Discount + VAT Exemption' },
];

export const BARANGAYS = [
  'Anibong', 'Biñan', 'Buboy', 'Cabanbanan', 'Calusiche', 'Dingin', 'Lambac', 'Layugan', 'Magdapio', 'Maulawin', 'Pinagsanjan', 'Poblacion Uno', 'Poblacion Dos', 'Sabang', 'Sampaloc', 'San Isidro'
];
