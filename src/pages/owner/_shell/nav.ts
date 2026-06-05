import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Users, GraduationCap, CreditCard, CalendarDays,
  ClipboardCheck, LifeBuoy, ShieldAlert,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const adminNav: AdminNavItem[] = [
  { label: 'Overview',     to: '/owner',              icon: LayoutDashboard, end: true },
  { label: 'Students',     to: '/owner/students',     icon: Users },
  { label: 'Instructors',  to: '/owner/instructors',  icon: GraduationCap },
  { label: 'Payments',     to: '/owner/payments',     icon: CreditCard },
  { label: 'Lessons',      to: '/owner/lessons',      icon: CalendarDays },
  { label: 'Test Booking', to: '/owner/test-booking', icon: ClipboardCheck },
  { label: 'Support',      to: '/owner/support',      icon: LifeBuoy },
  { label: 'Admin Tools',  to: '/owner/admin-tools',  icon: ShieldAlert },
];
