import { supabase } from "@/integrations/supabase/client";

/**
 * Stripe Service - Frontend wrapper for Stripe edge functions
 */

export interface CheckoutResult {
  url: string;
}

export interface ConnectStatus {
  connected: boolean;
  status: "not_connected" | "pending" | "active" | "restricted";
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
  dashboardUrl?: string;
  accountId?: string;
}

export interface TrialInfo {
  isTrialing: boolean;
  trialEndsAt?: string;
  daysRemaining?: number;
}

/**
 * Create a Stripe Checkout session for Elite tier upgrade
 */
export async function createCheckoutSession(): Promise<CheckoutResult> {
  const { data, error } = await supabase.functions.invoke("create-checkout-session");
  
  if (error) {
    console.error("Error creating checkout session:", error);
    throw new Error(error.message || "Failed to create checkout session");
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data as CheckoutResult;
}

/**
 * Open the Stripe Customer Portal for subscription management
 */
export async function openBillingPortal(): Promise<CheckoutResult> {
  const { data, error } = await supabase.functions.invoke("create-billing-portal");
  
  if (error) {
    console.error("Error creating billing portal session:", error);
    throw new Error(error.message || "Failed to open billing portal");
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data as CheckoutResult;
}

/**
 * Create a Stripe Connect account for instructor payouts
 */
export async function createConnectAccount(): Promise<CheckoutResult> {
  const { data, error } = await supabase.functions.invoke("create-connect-account");
  
  if (error) {
    console.error("Error creating Connect account:", error);
    throw new Error(error.message || "Failed to create payment account");
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data as CheckoutResult;
}

/**
 * Get the status of instructor's Stripe Connect account
 */
export async function getConnectStatus(): Promise<ConnectStatus> {
  const { data, error } = await supabase.functions.invoke("get-connect-status");
  
  if (error) {
    console.error("Error fetching Connect status:", error);
    throw new Error(error.message || "Failed to fetch payment status");
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data as ConnectStatus;
}

/**
 * Create a top-up payment for student lesson credits
 */
export async function createTopUpPayment(hours: number, amount: number): Promise<CheckoutResult> {
  const { data, error } = await supabase.functions.invoke("create-topup-payment", {
    body: { hours, amount },
  });
  
  if (error) {
    console.error("Error creating top-up payment:", error);
    throw new Error(error.message || "Failed to create payment");
  }
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data as CheckoutResult;
}
