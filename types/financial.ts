// Financial Transaction Types for Dual-Stream Ledger

export type PaymentMethod = 'STRIPE' | 'BANK_TRANSFER' | 'CASH';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'PENDING_VERIFICATION' | 'REJECTED' | 'REFUNDED';

export interface Transaction {
  id: string;
  pupilId: string;
  pupilName: string;
  amount: number;
  hours: number;
  method: PaymentMethod;
  status: TransactionStatus;
  timestamp: string;
  studentNotes?: string;
  instructorNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface PendingVerification {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  hours: number;
  studentNotes?: string;
  createdAt: string;
}

export interface FinancialInsights {
  pendingPayouts: number;
  availableBalance: number;
  totalRevenue: number;
  pendingVerifications: number;
  transactions: Transaction[];
}

export interface FinancialContext {
  transactions: Transaction[];
  students: { name: string; creditBalance: number }[];
  totalRevenue: number;
  pendingVerifications: number;
}
