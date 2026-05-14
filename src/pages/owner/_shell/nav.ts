import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Users, ShieldCheck, School, MessageSquare, Bell,
  CreditCard, MessageCircle, FileText, ScrollText, Sparkles
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const adminNav: AdminNavItem[] = [
  { label: 'Overview',             to: '/owner',               icon: LayoutDashboard, end: true },
  { label: 'Users',                to: '/owner/users',         icon: Users },
  { label: 'Instructor approvals', to: '/owner/instructors',   icon: ShieldCheck },
  { label: 'Schools',              to: '/owner/schools',       icon: School },
  { label: 'Subscriptions',        to: '/owner/subscriptions', icon: CreditCard },
  { label: 'Messaging',            to: '/owner/messaging',     icon: MessageSquare },
  { label: 'Notifications',        to: '/owner/notifications', icon: Bell },
  { label: 'Feedback',             to: '/owner/feedback',      icon: MessageCircle },
  { label: 'Audit',                to: '/owner/audit',         icon: ScrollText },
  { label: 'Blog',                 to: '/owner/blog',          icon: FileText },
  { label: 'Growth',               to: '/owner/growth',        icon: Sparkles },
];
