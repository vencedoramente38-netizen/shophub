import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Particles from "@/components/ui/Particles";
import ShineBorder from "@/components/ui/ShineBorder";
import { RainbowButton } from "@/components/ui/RainbowButton";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: user, error } = await (supabase
        .from("users" as any) as any)
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;

      if (!user) {
        toast.error("Usuário não encontrado");
        return;
      }

      if (user.password !== password) {
        toast.error("Senha incorreta");
        return;
      }

      // Check expiry
      if (user.expires_at) {
        const expiryDate = new Date(user.expires_at);
        if (expiryDate < new Date()) {
          toast.error("Seu plano expirou. Renove sua assinatura.");
          return;
        }
      }

      localStorage.setItem("session", JSON.stringify(user));
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050505] text-white overflow-hidden">
      <Particles className="absolute inset-0 z-0" quantity={40} />

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img
            src="https://i.postimg.cc/FHmp3GT8/Gemini-Generated-Image-ib23j0ib23j0ib23.png"
            alt="TikTok Sync"
            className="h-20 w-20 rounded-2xl object-cover shadow-2xl"
          />
          <h1 className="text-3xl font-black text-white italic tracking-tighter">TIKTOK SYNC</h1>
        </div>

        <ShineBorder
          color={["#fe2c55", "#a855f7", "#06b6d4"]}
          borderRadius={32}
          className="w-full"
        >
          <div className="p-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Fazer Login</h2>
                <p className="text-sm text-white/50">Entre para acessar seu painel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-black/40 border-white/10 h-12 rounded-xl text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-black/40 border-white/10 h-12 rounded-xl pr-10 text-white placeholder:text-white/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <RainbowButton
                  type="submit"
                  className="w-full h-12 mt-4 font-black italic tracking-tighter"
                  disabled={isLoading}
                >
                  {isLoading ? "ENTRANDO..." : "ENTRAR AGORA"}
                </RainbowButton>
              </form>
            </div>
          </div>
        </ShineBorder>
      </div>
    </div>
  );
}