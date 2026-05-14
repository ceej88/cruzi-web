import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { adminNav } from './nav';
import { AdminSidebar } from './AdminSidebar';
import { supabase } from '@/integrations/supabase/client';

function useBreadcrumb(): string {
  const { pathname } = useLocation();
  const match = adminNav
    .slice()
    .sort((a, b) => b.to.length - a.to.length)
    .find(n => (n.end ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + '/')));
  return match?.label ?? 'Admin';
}

export function AdminTopBar() {
  const navigate = useNavigate();
  const crumb = useBreadcrumb();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    navigate('/auth', { replace: true });
  };

  return (
    <header
      className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-3 lg:px-6 shrink-0 z-10"
      data-testid="admin-topbar"
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            data-testid="button-mobile-menu"
            aria-label="Open admin navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[260px]">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">Sidebar links for admin sections</SheetDescription>
          <AdminSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-medium truncate" data-testid="text-breadcrumb">
          {crumb}
        </h1>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        data-testid="button-signout"
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </header>
  );
}
