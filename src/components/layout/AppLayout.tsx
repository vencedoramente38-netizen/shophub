import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!supabase) {
          setAccessDenied("Erro: Cliente Supabase não inicializado.");
          setIsLoading(false);
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setAccessDenied("Erro ao iniciar sessão.");
          setIsLoading(false);
          return;
        }

        const session = sessionData?.session;

        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('plan, access_until')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setAccessDenied("Erro ao verificar seu perfil. Verifique os logs.");
          setIsLoading(false);
          return;
        }

        if (!profile) {
          setAccessDenied("Usuário sem perfil configurado.");
          setIsLoading(false);
          return;
        }

        if (profile.plan === 'vitalicio') {
          setIsLoading(false);
          return;
        }

        if (profile.plan === 'mensal') {
          if (profile.access_until) {
            const accessUntil = new Date(profile.access_until);
            const now = new Date();

            if (accessUntil > now) {
              setIsLoading(false);
              return;
            }
          }
          setAccessDenied("Seu plano expirou. Renove para continuar.");
          setIsLoading(false);
          return;
        }

        setAccessDenied("Plano inválido. Entre em contato com o suporte.");
        setIsLoading(false);
      } catch (e: any) {
        console.error("Crash in checkAccess:", e);
        setAccessDenied(`Erro fatal: ${e.message || "Desconhecido"}`);
        setIsLoading(false);
      }
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
        <div className="relative z-10 w-full max-w-md space-y-6 px-4 text-center">
          <div className="rounded-3xl border border-white/10 bg-card p-8">
            <div className="mb-4 text-5xl">🔒</div>
            <h1 className="text-xl font-bold text-white mb-2">Acesso Bloqueado</h1>
            <p className="text-muted-foreground mb-6">{accessDenied}</p>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login");
              }}
              className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-background text-white overflow-hidden font-poppins">
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
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

      {/* Mobile floating button */}
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
