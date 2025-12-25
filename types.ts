
import React from 'react';

export type CategoryType = 'income' | 'expense' | 'transfer';
export type AccountType = 'savings' | 'checking';

export interface Category {
  id?: number;
  name: string;
  type: CategoryType;
  is_parent: boolean;
  parent_id?: number;
  is_default: boolean;
  colour: string; // Matches OpenAPI 'colour'
  icon: string;
  sub_categories: Category[];
}

export interface Bank {
  id: number;
  name: string;
  account_type: AccountType;
  balance: number;
  institution?: string; // Optional helper
  accountNumber?: string; // Optional helper
  icon?: string; // Added to match mock data usage
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  type: 'expense' | 'income';
  date: string;
  description: string;
  bank_id: number;
}

// Added Investment interface to resolve import errors
export interface Investment {
  id: string;
  name: string;
  investedAmount: number;
  currentValue: number;
  changePercent: number;
}

// Added Loan interface to resolve import errors
export interface Loan {
  id: string;
  name: string;
  emi: number;
  remainingBalance: number;
  interestRate: number;
  totalDurationMonths: number;
  paidMonths: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  profile_pic: string | null;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}
