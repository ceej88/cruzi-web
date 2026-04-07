import { supabase } from "@/integrations/supabase/client";
import { Transaction, PendingVerification, FinancialInsights, PaymentMethod } from "@/types/financial";

/**
 * Financial Service - Handles dual-stream ledger operations
 */

/**
 * Student: Notify instructor of a bank transfer
 */
export async function notifyBankTransfer(
  hours: number,
  amount: number,
  reference?: string
): Promise<{ success: boolean; transactionId?: string }> {
  const { data, error } = await supabase.functions.invoke("notify-bank-transfer", {
    body: { hours, amount, reference },
  });

  if (error) {
    console.error("Error notifying bank transfer:", error);
    throw new Error(error.message || "Failed to notify bank transfer");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return { success: true, transactionId: data.transactionId };
}

/**
 * Instructor: Get pending verification requests
 */
export async function getPendingVerifications(): Promise<PendingVerification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("credit_transactions")
    .select(`
      id,
      student_id,
      amount_paid,
      hours,
      student_notes,
      created_at
    `)
    .eq("instructor_id", user.id)
    .eq("status", "pending_verification")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending verifications:", error);
    throw new Error("Failed to fetch pending verifications");
  }

  // Get student details
  const studentIds = [...new Set(data?.map(t => t.student_id) || [])];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, email")
    .in("user_id", studentIds);

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  return (data || []).map(t => {
    const profile = profileMap.get(t.student_id);
    return {
      id: t.id,
      studentId: t.student_id,
      studentName: profile?.full_name || "Unknown Student",
      studentEmail: profile?.email || "",
      amount: t.amount_paid,
      hours: t.hours,
      studentNotes: t.student_notes,
      createdAt: t.created_at,
    };
  });
}

/**
 * Instructor: Verify or reject a manual payment
 */
export async function verifyManualPayment(
  transactionId: string,
  confirm: boolean,
  notes?: string
): Promise<{ success: boolean }> {
  const { data, error } = await supabase.functions.invoke("verify-manual-payment", {
    body: { transactionId, confirm, notes },
  });

  if (error) {
    console.error("Error verifying payment:", error);
    throw new Error(error.message || "Failed to verify payment");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return { success: true };
}

/**
 * Instructor: Get all transactions (full ledger)
 */
export async function getTransactionLedger(): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("credit_transactions")
    .select(`
      id,
      student_id,
      amount_paid,
      hours,
      payment_method,
      status,
      created_at,
      student_notes,
      instructor_notes,
      verified_at
    `)
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }

  // Get student names
  const studentIds = [...new Set(data?.map(t => t.student_id) || [])];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", studentIds);

  const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

  return (data || []).map(t => ({
    id: t.id,
    pupilId: t.student_id,
    pupilName: profileMap.get(t.student_id) || "Unknown",
    amount: t.amount_paid,
    hours: t.hours,
    method: (t.payment_method || "STRIPE") as "STRIPE" | "BANK_TRANSFER" | "CASH",
    status: mapDbStatus(t.status),
    timestamp: t.created_at,
    studentNotes: t.student_notes,
    instructorNotes: t.instructor_notes,
    verifiedAt: t.verified_at,
  }));
}

/**
 * Get financial insights for the instructor
 */
export async function getFinancialInsights(): Promise<FinancialInsights> {
  const transactions = await getTransactionLedger();
  const pendingList = await getPendingVerifications();

  const completedTransactions = transactions.filter(t => t.status === "COMPLETED");
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    pendingPayouts: 0, // Will be updated from Stripe Connect balance
    availableBalance: 0, // Will be updated from Stripe Connect balance
    totalRevenue,
    pendingVerifications: pendingList.length,
    transactions,
  };
}

/**
 * Instructor: Add manual credit for cash or other payment
 */
export async function addManualCredit(
  studentId: string,
  hours: number,
  amount: number,
  method: PaymentMethod = "CASH",
  notes?: string
): Promise<{ success: boolean; newBalance?: number; transactionId?: string }> {
  const { data, error } = await supabase.functions.invoke("add-manual-credit", {
    body: { studentId, hours, amount, method, notes },
  });

  if (error) {
    console.error("Error adding manual credit:", error);
    throw new Error(error.message || "Failed to add credits");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return { success: true, newBalance: data.newBalance, transactionId: data.transactionId };
}

// Helper to map database status to our enum
function mapDbStatus(dbStatus: string): Transaction["status"] {
  const statusMap: Record<string, Transaction["status"]> = {
    pending: "PENDING",
    pending_verification: "PENDING_VERIFICATION",
    completed: "COMPLETED",
    rejected: "REJECTED",
    refunded: "REFUNDED",
  };
  return statusMap[dbStatus] || "PENDING";
}
