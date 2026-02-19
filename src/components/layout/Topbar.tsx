import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, User, Settings, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/produtos": "Radar de Produtos",
  "/criar-video": "Sync Lab",
  "/editar-videos": "Sync Editor",
  "/meus-prompts": "Meus Prompts",
  "/tutorial": "Tutorial",
  "/configuracoes": "Configuracoes",
};

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export function Topbar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "", avatarUrl: "" });

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const currentTitle = pageTitles[location.pathname] || "TikTok Sync";
  const displayName = profile.name || user?.email?.split("@")[0] || "Usuário";
  const displayEmail = profile.email || user?.email || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-black px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-black text-white tracking-tight">{currentTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/5">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-white/10 p-0" align="end">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="font-semibold text-white">Notificacoes</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma notificacao
                </p>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "cursor-pointer border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <p className="text-sm text-white">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notification.time.toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
              <Avatar className="h-8 w-8 cursor-pointer border border-white/20">
                <AvatarImage src={profile.avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-card border-white/10 p-0" align="end">
            <PopoverHeader>
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile.avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <PopoverTitle>{displayName}</PopoverTitle>
                <PopoverDescription className="truncate">{displayEmail}</PopoverDescription>
              </div>
            </PopoverHeader>
            <PopoverBody className="space-y-1 px-2 py-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/5"
                size="sm"
                asChild
              >
                <a href="/configuracoes">
                  <User className="mr-2 h-4 w-4" />
                  Ver perfil
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/5"
                size="sm"
                asChild
              >
                <a href="/configuracoes">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuracoes
                </a>
              </Button>
            </PopoverBody>
            <PopoverFooter>
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/10 text-white/80 hover:text-white hover:bg-white/5"
                size="sm"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
