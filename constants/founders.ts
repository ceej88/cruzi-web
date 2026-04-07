/**
 * Founder accounts that always have Premium access and are never charged.
 * These user IDs bypass all subscription checks and upgrade prompts.
 */
export const FOUNDER_USER_IDS = [
  '1d7f7c79-f5c3-4ec8-a85e-8475b4ad5f06', // Erica Vale
] as const;

export function isFounder(userId: string | undefined): boolean {
  if (!userId) return false;
  return FOUNDER_USER_IDS.includes(userId as any);
}
