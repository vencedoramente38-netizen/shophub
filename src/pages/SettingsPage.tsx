import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Bell, Shield, Save, Plus, Trash2, RotateCcw, Lock, Unlock, Eye, EyeOff, Copy, Users, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from "@/hooks/useNotifications";
import { useProducts } from "@/hooks/useProducts";
import { Product, defaultProducts } from "@/data/products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { RainbowButton } from "@/components/ui/RainbowButton";

interface DBUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  plan_type: string;
  activated_at: string;
  expires_at: string | null;
  created_at?: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

interface DashboardMetrics {
  faturamento: number;
  pedidos: number;
  comissao: number;
  cliques: number;
  produtosAtivos: number;
}

interface SalesData {
  name: string;
  value: number;
}

export default function SettingsPage() {
  const { notificationsEnabled, setNotificationsEnabled } = useNotifications();
  const { products, isLoading: isProductsLoading, addProduct, updateProduct: updateProductInDb, deleteProduct: deleteProductFromDb, restoreDefaults } = useProducts();

  const [profile, setProfile] = useState<UserProfile>({
    name: "Admin",
    email: "admin@tiktoksync.com",
    avatarUrl: "https://i.pravatar.cc/150?u=admin",
  });

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    faturamento: 12580.50,
    pedidos: 154,
    comissao: 2450.00,
    cliques: 5420,
    produtosAtivos: 12,
  });

  const [salesData, setSalesData] = useState<SalesData[]>([
    { name: "Seg", value: 1200 },
    { name: "Ter", value: 1800 },
    { name: "Qua", value: 1560 },
    { name: "Qui", value: 2400 },
    { name: "Sex", value: 3100 },
    { name: "Sáb", value: 2800 },
    { name: "Dom", value: 3400 },
  ]);

  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    priceText: "",
    imageUrl: "",
    linkTiktok: "",
    category: "Eletrônicos",
    rating: 4.5,
    commission: "20%",
    scoreViral: 50,
  });

  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    plan_type: "mensal"
  });

  useEffect(() => {
    const fetchSettingsData = async () => {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) setProfile(JSON.parse(savedProfile));

      const savedSales = localStorage.getItem("salesEvolution");
      if (savedSales) setSalesData(JSON.parse(savedSales));
    };
    fetchSettingsData();
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchDbUsers();
    }
  }, [isAdminAuthenticated]);

  const fetchDbUsers = async () => {
    const { data, error } = await (supabase
      .from("users" as any) as any)
      .select("*")
      .order("activated_at", { ascending: false });
    if (!error && data) setDbUsers(data as unknown as DBUser[]);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);

    try {
      const { error } = await supabase
        .from("users")
        .insert({
          name: newUserForm.name,
          email: newUserForm.email.trim().toLowerCase(),
          password: newUserForm.password,
          plan_type: newUserForm.plan_type,
          activated_at: new Date().toISOString(),
          expires_at: newUserForm.plan_type === 'mensal'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null
        });

      if (error) throw error;

      toast.success("Usuário criado com sucesso!");
      setNewUserForm({ name: "", email: "", password: "", plan_type: "mensal" });
      fetchDbUsers();

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FE2C55', '#40E0D0', '#FFFFFF']
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleAdminAuth = () => {
    if (adminPassword === ">admin321") {
      setIsAdminAuthenticated(true);
      toast.success("Acesso Admin concedido!");
    } else {
      toast.error("Senha incorreta!");
    }
  };

  const saveProfile = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    toast.success("Perfil salvo!");
  };

  const saveMetrics = async () => {
    try {
      const { error } = await (supabase
        .from("dashboard_metrics" as any) as any)
        .update({
          faturamento: metrics.faturamento,
          pedidos: metrics.pedidos,
          comissao: metrics.comissao,
          cliques: metrics.cliques,
          produtos_ativos: metrics.produtosAtivos,
        })
        .eq("id", 1);

      if (error) throw error;

      localStorage.setItem("salesEvolution", JSON.stringify(salesData));
      toast.success("Metricas salvas com sucesso!");
    } catch (error) {
      console.error("Error saving metrics:", error);
      toast.error("Erro ao salvar metricas");
    }
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    const success = await updateProductInDb(editingProduct.id, editingProduct);
    if (success) {
      setEditingProduct(null);
      toast.success("Produto atualizado!");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.priceText) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    const success = await addProduct({
      name: newProduct.name!,
      priceText: newProduct.priceText!,
      imageUrl: newProduct.imageUrl || "",
      linkTiktok: newProduct.linkTiktok || "",
      category: newProduct.category || "Geral",
      rating: newProduct.rating || 5,
      commission: newProduct.commission || "10%",
      scoreViral: newProduct.scoreViral || 50,
      active: true
    });
    if (success) {
      setNewProduct({
        name: "",
        priceText: "",
        imageUrl: "",
        linkTiktok: "",
        category: "Eletrônicos",
        rating: 4.5,
        commission: "20%",
        scoreViral: 50,
      });
      toast.success("Produto adicionado!");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8 space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Shield className="text-[#FE2C55]" /> PAINEL DE CONTROLE
          </h2>
          <p className="text-white/40 font-medium">Gerencie o sistema, usuários e produtos ativos</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className="text-white/40 hover:text-white rounded-2xl h-14 px-8 border border-white/5"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Recarregar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black/40 rounded-[32px] border border-white/5 p-8 backdrop-blur-xl">
            <h3 className="text-xl font-black text-white italic mb-8 flex items-center gap-2">
              <User size={20} className="text-[#FE2C55]" /> PERFIL ADMIN
            </h3>

            <div className="space-y-6">
              <div className="flex justify-center mb-8">
                <div className="relative group cursor-pointer">
                  <img src={profile.avatarUrl} className="w-24 h-24 rounded-3xl border-2 border-white/10 group-hover:border-[#FE2C55] transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 rounded-3xl transition-all">
                    <Save size={20} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Nome Visível</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-black border-white/10 h-14 rounded-2xl px-6 focus:border-[#FE2C55] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 ml-1">E-mail de Notificação</Label>
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-black border-white/10 h-14 rounded-2xl px-6 focus:border-[#FE2C55] transition-all"
                  />
                </div>
                <Button onClick={saveProfile} className="w-full bg-white text-black hover:bg-white/90 h-14 rounded-2xl font-black italic mt-4">
                  SALVAR ALTERAÇÕES ⚡
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-black/40 rounded-[32px] border border-white/5 p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white italic flex items-center gap-2">
                <Bell size={20} className="text-[#FE2C55]" /> NOTIFICAÇÕES
              </h3>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                className="data-[state=checked]:bg-[#FE2C55]"
              />
            </div>
            <p className="text-sm text-white/40">Ative para receber alertas sobre novos usuários e vendas realizadas.</p>
          </div>
        </div>

        {/* Dashboard & Admin Settings */}
        <div className="lg:col-span-2 space-y-8">
          {!isAdminAuthenticated ? (
            <div className="bg-black/40 rounded-[32px] border border-[#FE2C55]/20 p-12 text-center backdrop-blur-xl">
              <div className="w-20 h-20 bg-[#FE2C55]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock size={32} className="text-[#FE2C55]" />
              </div>
              <h3 className="text-2xl font-black text-white italic mb-2 tracking-tighter">ACESSO RESTRITO</h3>
              <p className="text-white/40 mb-8 max-w-xs mx-auto text-sm">Insira a chave mestra para desbloquear as configurações avançadas e gestão de produtos.</p>

              <div className="max-w-xs mx-auto space-y-4">
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="SENHA MESTRA"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-black border-white/10 h-14 rounded-2xl px-6 text-center tracking-[0.5em] font-bold focus:border-[#FE2C55] transition-all"
                  />
                </div>
                <Button
                  onClick={handleAdminAuth}
                  className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white h-14 rounded-2xl font-black italic"
                >
                  DESBLOQUEAR ACESSO ⚡
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-black/40 rounded-[32px] border border-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white italic flex items-center gap-2">
                    <Shield size={20} className="text-green-500" /> PRODUTOS & MÉTRICAS
                  </h3>
                  <Unlock size={18} className="text-white/20" />
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/40">Faturamento Mensal</Label>
                      <Input
                        type="number"
                        value={metrics.faturamento}
                        onChange={(e) => setMetrics({ ...metrics, faturamento: Number(e.target.value) })}
                        className="bg-black border-white/10 h-14 rounded-2xl px-6"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/40">Total Pedidos</Label>
                      <Input
                        type="number"
                        value={metrics.pedidos}
                        onChange={(e) => setMetrics({ ...metrics, pedidos: Number(e.target.value) })}
                        className="bg-black border-white/10 h-14 rounded-2xl px-6"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/40">Comissão Admin</Label>
                      <Input
                        type="number"
                        value={metrics.comissao}
                        onChange={(e) => setMetrics({ ...metrics, comissao: Number(e.target.value) })}
                        className="bg-black border-white/10 h-14 rounded-2xl px-6"
                      />
                    </div>
                  </div>
                  <Button onClick={saveMetrics} className="w-full bg-white text-black hover:bg-white/90 h-14 rounded-2xl font-black italic">
                    ATUALIZAR DASHBOARD 🚀
                  </Button>
                </div>
              </div>

              <div className="bg-black/40 rounded-[32px] border border-white/5 p-8 backdrop-blur-xl">
                <h3 className="text-xl font-black text-white italic mb-10 border-l-4 border-[#FE2C55] pl-4">GERENCIAR PRODUTOS DISPONÍVEIS</h3>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/40">Nome do Produto</Label>
                      <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="bg-black border-white/10 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/40">Preço Est.</Label>
                      <Input value={newProduct.priceText} onChange={(e) => setNewProduct({ ...newProduct, priceText: e.target.value })} className="bg-black border-white/10 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/40">URL da Imagem</Label>
                      <Input value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} className="bg-black border-white/10 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/40">Link TikTok</Label>
                      <Input value={newProduct.linkTiktok} onChange={(e) => setNewProduct({ ...newProduct, linkTiktok: e.target.value })} className="bg-black border-white/10 h-12 rounded-xl" />
                    </div>
                    <Button onClick={handleAddProduct} className="lg:col-span-4 bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90 h-14 rounded-2xl font-black italic mt-2">
                      + ADICIONAR NOVO PRODUTO NA VITRINE
                    </Button>
                  </div>

                  {editingProduct && (
                    <div className="p-8 bg-[#FE2C55]/10 border-2 border-[#FE2C55]/30 rounded-[32px] space-y-6 animate-in slide-in-from-top-4">
                      <h4 className="font-black italic text-white flex items-center justify-between">
                        EDITANDO: {editingProduct.name.toUpperCase()}
                        <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)} className="text-white/40 hover:text-white"><Plus className="rotate-45" /></Button>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase text-white/40">Nome</Label>
                          <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="bg-black border-white/10 h-12 rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase text-white/40">Preço</Label>
                          <Input value={editingProduct.priceText} onChange={(e) => setEditingProduct({ ...editingProduct, priceText: e.target.value })} className="bg-black border-white/10 h-12 rounded-xl" />
                        </div>
                        <div className="space-y-1 lg:col-span-2">
                          <Label className="text-[10px] font-black uppercase text-white/40">URL da Imagem</Label>
                          <Input value={editingProduct.imageUrl} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} className="bg-black border-white/10 h-12 rounded-xl" />
                        </div>
                      </div>
                      <Button onClick={saveProduct} className="bg-white text-black hover:bg-white/90 h-14 px-10 rounded-2xl font-black italic">
                        ATUALIZAR PRODUTO ⚡
                      </Button>
                    </div>
                  )}
                </div>

                {/* User management section */}
                <div className="space-y-6 pt-10 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white border-l-4 border-[#FE2C55] pl-4">Gestão de Usuários</h4>
                  </div>

                  <div className="bg-black/40 rounded-3xl border border-white/5 p-8">
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">Nome Completo</Label>
                        <Input
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                          placeholder="Nome do Cliente"
                          className="bg-black border-white/10 h-10 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">E-mail de Acesso</Label>
                        <Input
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                          placeholder="email@cliente.com"
                          className="bg-black border-white/10 h-10 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">Senha Inicial</Label>
                        <Input
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                          placeholder="Defina uma senha"
                          className="bg-black border-white/10 h-10 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">Tipo de Plano</Label>
                        <select
                          value={newUserForm.plan_type}
                          onChange={(e) => setNewUserForm({ ...newUserForm, plan_type: e.target.value })}
                          className="flex h-10 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FE2C55]"
                        >
                          <option value="mensal">Mensal (30 dias)</option>
                          <option value="vitalicio">Vitalício</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 lg:col-span-4 mt-2">
                        <RainbowButton
                          type="submit"
                          className="h-12 w-full md:w-auto px-10 font-black italic tracking-tighter text-white"
                          disabled={isCreatingUser}
                        >
                          {isCreatingUser ? "CRIANDO..." : "CRIAR ACESSO AGORA ⚡"}
                        </RainbowButton>
                      </div>
                    </form>
                  </div>

                  <div className="space-y-6 pt-6">
                    <h4 className="text-lg font-bold text-white border-l-4 border-white pl-4">Usuários Cadastrados</h4>
                    <div className="bg-black/40 rounded-3xl border border-white/5 p-6 overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black uppercase text-white/40 border-b border-white/5">
                            <th className="pb-4 px-2">Nome / E-mail</th>
                            <th className="pb-4 px-2">Plano</th>
                            <th className="pb-4 px-2">Ativação</th>
                            <th className="pb-4 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {dbUsers.map((u) => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-4 px-2">
                                <p className="font-bold text-white">{u.name}</p>
                                <p className="text-xs text-white/40">{u.email}</p>
                              </td>
                              <td className="py-4 px-2">
                                {u.plan_type === 'vitalicio' ? (
                                  <div className="flex items-center gap-1.5 text-[#a855f7] text-[10px] font-bold">
                                    <CheckCircle2 size={12} /> Vitalício
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-[#06b6d4] text-[10px] font-bold">
                                    <Clock size={12} /> Mensal
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-2 text-white/40 text-xs">
                                {u.activated_at ? new Date(u.activated_at).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 px-2">
                                {u.expires_at && new Date(u.expires_at) < new Date() ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-bold uppercase transition-all">Expirado</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[10px] font-bold uppercase transition-all">Ativo</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
