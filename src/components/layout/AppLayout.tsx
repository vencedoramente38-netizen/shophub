import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { toast } from "sonner";
import Particles from "@/components/ui/Particles";

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const checkAccess = () => {
      const sessionData = localStorage.getItem("session");

      if (!sessionData) {
        navigate("/login");
        return;
      }

      try {
        const userData = JSON.parse(sessionData);

        // Check if plan expired
        if (userData.expires_at) {
          const expiryDate = new Date(userData.expires_at);
          if (expiryDate < new Date()) {
            toast.error("Seu plano expirou. Renove para continuar.");
            localStorage.removeItem("session");
            navigate("/login");
            return;
          }
        }

        setUser(userData);
        setIsLoading(false);
      } catch (e) {
        console.error("Error parsing session:", e);
        localStorage.removeItem("session");
        navigate("/login");
      }
    };

    checkAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-background text-white overflow-hidden font-poppins">
      <Particles className="absolute inset-0 z-0" quantity={100} staticity={50} ease={50} color="#ffffff" refresh={false} />
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
          user={user}
        />

        <main className="relative flex-1 flex flex-col overflow-hidden">
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
              <div className="mx-auto max-w-6xl w-full space-y-6">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={() => setIsSidebarOpen((v) => !v)}
        className="fixed bottom-5 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black border border-white/60 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
