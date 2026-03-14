import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Video,
  Film,
  FileText,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
  Clock
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  user: any;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Radar de Produtos", path: "/produtos" },
  { icon: Video, label: "Sync Lab", path: "/criar-video" },
  { icon: Film, label: "Sync Editor", path: "/editar-videos" },
  { icon: Zap, label: "Viral Sync", path: "/viral-sync" },
  { icon: FileText, label: "Meus Prompts", path: "/meus-prompts" },
  { icon: Settings, label: "Configuracoes", path: "/configuracoes" },
];

export function Sidebar({ isOpen, onOpenChange, isCollapsed, onCollapsedChange, user }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("session");
    navigate("/login");
  };

  const getDaysRemaining = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const sidebarContent = (collapsed: boolean) => (
    <aside className={cn(
      "sticky top-0 flex h-screen flex-col bg-black text-white transition-all duration-300 relative",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Circular collapse toggle - desktop only */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg border-2 border-background hover:bg-primary/90 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <div className={cn(
        "flex items-center border-b border-white/10",
        collapsed ? "justify-center px-2 py-6" : "gap-3 px-4 py-6"
      )}>
        <img
          src="https://i.postimg.cc/FHmp3GT8/Gemini-Generated-Image-ib23j0ib23j0ib23.png"
          alt="TikTok Sync"
          className="h-10 w-10 rounded-xl object-cover"
        />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-black italic tracking-tighter">TIKTOK SYNC</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 scrollbar-hide">
        {/* User Profile Info */}
        {!collapsed && user && (
          <div className="px-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 truncate mb-3">{user.email}</p>

              {user.plan_type === 'lifetime' ? (
                <div className="flex items-center gap-1.5 w-fit px-2 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] text-[10px] font-bold">
                  <CheckCircle2 size={12} /> Vitalício ♾️
                </div>
              ) : (
                <div className="flex items-center gap-1.5 w-fit px-2 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[#06b6d4] text-[10px] font-bold">
                  <Clock size={12} /> Mensal · {getDaysRemaining(user.expires_at)} dias
                </div>
              )}
            </div>
          </div>
        )}

        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all group",
                    collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-3",
                    isActive
                      ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-primary/60 group-hover:text-primary")} />
                  {!collapsed && item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center rounded-xl text-sm font-bold text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all",
            collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-3"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && "Sair da Conta"}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        {sidebarContent(isCollapsed)}
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 animate-in slide-in-from-left duration-300">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent(false)}
          </div>
        </div>
      )}
    </>
  );
}
