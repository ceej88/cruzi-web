import * as React from "react";
import { cn } from "@/lib/utils";
import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  userName,
  userAvatar,
  notificationCount = 0,
  onNotificationsClick,
  onSettingsClick,
  onLogout,
  rightContent,
  className,
}) => {
  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {userName && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="touch-target">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-outfit truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightContent}
        {onNotificationsClick && (
          <Button
            variant="ghost"
            size="icon"
            className="relative touch-target"
            onClick={onNotificationsClick}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-cruzi-danger text-[10px] font-bold text-white flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export { PageHeader };
