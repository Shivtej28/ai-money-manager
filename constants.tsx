
import React from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Settings,
  Tags,
  Landmark
} from 'lucide-react';
import { Transaction, Investment, Loan, NavItem, Category, Bank } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { label: 'Transactions', path: '/transactions', icon: <ArrowRightLeft size={20} /> },
  { label: 'Banks', path: '/banks', icon: <Landmark size={20} /> },
  { label: 'Investments', path: '/investments', icon: <TrendingUp size={20} /> },
  { label: 'Loans', path: '/loans', icon: <Wallet size={20} /> },
  { label: 'Categories', path: '/categories', icon: <Tags size={20} /> },
  { label: 'Reports', path: '/reports', icon: <PieChart size={20} /> },
  { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];
