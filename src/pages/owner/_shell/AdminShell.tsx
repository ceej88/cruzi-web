import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

export function AdminShell() {
  return (
    <div className="h-screen w-screen flex bg-background text-foreground" data-testid="admin-shell">
      <div className="hidden lg:block w-[240px] shrink-0 h-full">
        <AdminSidebar />
      </div>

      <div className="flex-1 min-w-0 flex flex-col h-full">
        <AdminTopBar />
        <main className="flex-1 min-h-0 overflow-y-auto" data-testid="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
