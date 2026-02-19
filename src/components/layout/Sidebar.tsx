import { NavLink, useLocation } from "react-router-dom";
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
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
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

export function Sidebar({ isOpen, onOpenChange, isCollapsed, onCollapsedChange }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const sidebarContent = (collapsed: boolean) => (
    <aside className={cn(
      "sticky top-0 flex h-screen flex-col bg-black text-white transition-all duration-300 relative",
      collapsed ? "w-16" : "w-60"
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
        collapsed ? "justify-center px-2 py-5" : "gap-3 px-4 py-5"
      )}>
        <img
          src="https://i.postimg.cc/FHmp3GT8/Gemini-Generated-Image-ib23j0ib23j0ib23.png"
          alt="TikTok Sync"
          className="h-8 w-8 rounded-lg object-cover"
        />
        {!collapsed && <span className="text-sm font-semibold">TikTok Sync</span>}
      </div>

      <div className="h-[1px] bg-white/10 mx-4" />


      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-card border-l-4 border-primary text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  {!collapsed && item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <div className="mt-6 px-4 mb-2">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Administração</p>
          </div>
        )}
      </nav>


      <div className="border-t border-white/10 p-2">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && "Sair"}
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
            className="absolute inset-0 bg-black/60"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute left-0 top-0 h-full w-60 animate-slide-in-right">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black border border-white/60"
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
