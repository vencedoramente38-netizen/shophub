import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, CheckCircle2, Clock } from "lucide-react";
import Particles from "@/components/ui/Particles";
import ShineBorder from "@/components/ui/ShineBorder";
import { RainbowButton } from "@/components/ui/RainbowButton";
import { toast } from "sonner";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activationKey, setActivationKey] = useState("");
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Check if email exists
      const { data: existingUser } = await (supabase
        .from("users" as any) as any)
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingUser) {
        toast.error("Este e-mail já está cadastrado");
        setIsLoading(false);
        return;
      }

      // 2. Check key
      const { data: keyData, error: keyError } = await (supabase
        .from("keys" as any) as any)
        .select("*")
        .eq("key", activationKey.toUpperCase())
        .maybeSingle();

      if (keyError || !keyData) {
        toast.error("Chave de ativação inválida");
        setIsLoading(false);
        return;
      }

      if (keyData.used) {
        toast.error("Esta chave já foi utilizada");
        setIsLoading(false);
        return;
      }

      if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
        toast.error("Esta chave está expirada");
        setIsLoading(false);
        return;
      }

      // 3. Create user
      const expiresAt = keyData.type === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const newUser = {
        name,
        email,
        password,
        key_used: keyData.key,
        plan_type: keyData.type,
        activated_at: new Date().toISOString(),
        expires_at: expiresAt
      };

      const { data: createdUser, error: createError } = await (supabase
        .from("users" as any) as any)
        .insert(newUser)
        .select()
        .single();

      if (createError) throw createError;

      // 4. Mark key as used
      await (supabase
        .from("keys" as any) as any)
        .update({ used: true, used_at: new Date().toISOString(), used_by: email })
        .eq("key", keyData.key);

      localStorage.setItem("session", JSON.stringify(createdUser));
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/40 p-1 rounded-2xl mb-8">
                <TabsTrigger
                  value="entrar"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black transition-all"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="criar"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-black transition-all"
                >
                  Criar conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="entrar" className="space-y-4 text-white">
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
              </TabsContent>

              <TabsContent value="criar" className="space-y-4 text-white">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu Nome"
                      className="bg-black/40 border-white/10 h-10 rounded-xl text-white placeholder:text-white/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="bg-black/40 border-white/10 h-10 rounded-xl text-white placeholder:text-white/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="bg-black/40 border-white/10 h-10 rounded-xl text-white placeholder:text-white/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-white">Confirmar</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        className="bg-black/40 border-white/10 h-10 rounded-xl text-white placeholder:text-white/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-key" className="text-white">Chave de Ativação</Label>
                    <Input
                      id="signup-key"
                      type="text"
                      value={activationKey}
                      onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
                      placeholder="CREATOR-MES-XXXX"
                      className="bg-black/40 border-white/10 h-10 rounded-xl font-mono text-white placeholder:text-white/50"
                      required
                    />
                  </div>

                  <div className="flex gap-2 py-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[#06b6d4] text-[10px] font-bold">
                      <Clock size={12} /> Mensal · 30 dias
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] text-[10px] font-bold">
                      <CheckCircle2 size={12} /> Vitalício ♾️
                    </div>
                  </div>

                  <RainbowButton
                    type="submit"
                    className="w-full h-12 mt-2 font-black italic tracking-tighter"
                    disabled={isLoading}
                  >
                    {isLoading ? "CRIANDO..." : "CRIAR CONTA"}
                  </RainbowButton>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </ShineBorder>
      </div>
    </div>
  );
}