import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { adminNav } from './nav';

interface Props { onNavigate?: () => void; }

export function AdminSidebar({ onNavigate }: Props) {
  return (
    <aside
      className="h-full w-full flex flex-col bg-card border-r border-border"
      data-testid="admin-sidebar"
    >
      <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
        <span className="text-base font-bold tracking-tight">Cruzi</span>
        <span className="ml-2 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
          ADMIN
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {adminNav.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border text-[10px] text-muted-foreground shrink-0">
        Admin console · {new Date().getFullYear()}
      </div>
    </aside>
  );
}
