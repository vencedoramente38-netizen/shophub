import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import { User, Bell, Shield, Save, Plus, Trash2, RotateCcw, Lock, Unlock, Eye, EyeOff } from "lucide-react";
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

  // Admin Authentication
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    avatarUrl: "",
  });
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    faturamento: 0,
    pedidos: 0,
    comissao: 0,
    cliques: 0,
    produtosAtivos: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    nome: "",
    preco: 0,
    precoTexto: "",
    comissao: 0,
    imageUrl: "",
    linkTiktok: "",
    categoria: "",
    avaliacao: 4.5,
    vendas: 0,
    concorrencia: "Baixa" as Product["concorrencia"],
    scoreViral: 50,
  });

  useEffect(() => {
    const fetchSettingsData = async () => {
      // Profile from LocalStorage
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error("Error parsing profile:", e);
        }
      }

      // Metrics from Supabase
      try {
        const { data: metricsData, error: metricsError } = await supabase
          .from("dashboard_metrics")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (metricsError) throw metricsError;
        if (metricsData) {
          setMetrics({
            faturamento: metricsData.faturamento || 0,
            pedidos: metricsData.pedidos || 0,
            comissao: metricsData.comissao || 0,
            cliques: metricsData.cliques || 0,
            produtosAtivos: metricsData.produtos_ativos || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching admin metrics:", error);
      }

      // Sales Data
      const savedSales = localStorage.getItem("salesEvolution");
      if (savedSales) {
        try {
          setSalesData(JSON.parse(savedSales));
        } catch (e) {
          console.error("Error parsing sales evolution:", e);
        }
      } else {
        setSalesData([
          { name: "Jan", value: 0 },
          { name: "Fev", value: 0 },
          { name: "Mar", value: 0 },
          { name: "Abr", value: 0 },
          { name: "Mai", value: 0 },
          { name: "Jun", value: 0 },
        ]);
      }
    };

    fetchSettingsData();
  }, []);

  const handleAdminAuth = () => {
    if (adminPassword === "admin321") {
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
      const { error } = await supabase
        .from("dashboard_metrics")
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

  const updateSalesValue = (index: number, value: number) => {
    setSalesData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value } : item))
    );
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    await updateProductInDb(editingProduct);
    setEditingProduct(null);
  };

  const addNewProduct = async () => {
    if (!newProduct.nome) {
      toast.error("Nome do produto é obrigatório!");
      return;
    }
    await addProduct({
      nome: newProduct.nome,
      categoria: newProduct.categoria || "Outros",
      preco: newProduct.preco,
      precoTexto: newProduct.precoTexto || `R$ ${newProduct.preco.toFixed(2)}`,
      avaliacao: newProduct.avaliacao,
      vendas: newProduct.vendas,
      comissao: newProduct.comissao,
      concorrencia: newProduct.concorrencia,
      imageUrl: newProduct.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      linkTiktok: newProduct.linkTiktok || "https://shop.tiktok.com",
      scoreViral: newProduct.scoreViral,
    });
    setNewProduct({
      nome: "",
      preco: 0,
      precoTexto: "",
      comissao: 0,
      imageUrl: "",
      linkTiktok: "",
      categoria: "",
      avaliacao: 4.5,
      vendas: 0,
      concorrencia: "Baixa",
      scoreViral: 50,
    });
  };

  const deleteProduct = async (id: number) => {
    await deleteProductFromDb(id);
    if (editingProduct?.id === id) {
      setEditingProduct(null);
    }
  };

  const handleRestoreDefaults = () => {
    restoreDefaults();
  };

  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setProfile((p) => ({ ...p, avatarUrl: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter">CONFIGURAÇÕES</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie seu perfil e acesso ao sistema.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-[40px] border border-white/5 bg-black/40 backdrop-blur-md p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#FE2C55] flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Meu Perfil</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-black uppercase">Nome de Exibição</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Seu nome"
                className="bg-black border-white/10 h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-black uppercase">E-mail de Contato</Label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="seu@email.com"
                className="bg-black border-white/10 h-12 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-black uppercase">Avatar (URL ou Arquivo)</Label>
              <div className="flex gap-4 items-center">
                {profile.avatarUrl && (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="h-12 w-12 rounded-full object-cover border-2 border-[#FE2C55]"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAvatarUpload}
                  className="bg-white/5 border-white/10 rounded-xl h-12"
                >
                  Upload
                </Button>
                <Input
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
                  placeholder="Link da imagem..."
                  className="bg-black border-white/10 h-12 rounded-2xl flex-1"
                />
              </div>
            </div>
          </div>

          <Button onClick={saveProfile} className="w-full bg-white text-black hover:bg-white/90 h-14 rounded-2xl font-black italic text-lg shadow-lg">
            SALVAR PERFIL
          </Button>
        </div>

        {/* Notifications */}
        <div className="rounded-[40px] border border-white/5 bg-black/40 backdrop-blur-md p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-black border border-white/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Notificações</h3>
          </div>

          <div className="flex items-center justify-between p-6 bg-[#050505] rounded-3xl border border-white/5">
            <div>
              <p className="font-bold text-white">Alertas de Atividade</p>
              <p className="text-xs text-muted-foreground">
                Novas métricas e atualizações de produtos.
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </div>
      </div>

      {/* Admin Section */}
      <div className="rounded-[40px] border border-white/5 bg-[#050505] p-8 space-y-8 mt-10">
        {!isAdminAuthenticated ? (
          <div className="max-w-md mx-auto py-12 text-center space-y-6">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
              <Lock className="h-8 w-8 text-white/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white italic">ÁREA RESTRITA</h3>
              <p className="text-sm text-muted-foreground">Insira a senha mestra para desbloquear o Painel Admin.</p>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                placeholder="Senha de acesso..."
                className="bg-black border-white/10 h-14 rounded-2xl pr-12 text-center font-bold tracking-widest"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <Button
              onClick={handleAdminAuth}
              className="w-full h-14 rounded-2xl bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-black italic shadow-[0_0_20px_rgba(254,44,85,0.3)] transition-all active:scale-95"
            >
              DESBLOQUEAR PAINEL
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FE2C55] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic">PAINEL ADMIN ATIVO</h3>
                  <p className="text-xs text-[#FE2C55] font-bold uppercase tracking-widest">Modo Edição Liberado</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdminAuthenticated(false)}
                className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl px-4"
              >
                Bloquear Painel
              </Button>
            </div>

            <div className="space-y-12">
              {/* Dashboard metrics */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white border-l-4 border-[#FE2C55] pl-4">Números do Dashboard</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] font-black uppercase">Faturamento (R$)</Label>
                    <Input
                      type="number"
                      value={metrics.faturamento}
                      onChange={(e) => setMetrics((m) => ({ ...m, faturamento: Number(e.target.value) }))}
                      className="bg-black border-white/10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] font-black uppercase">Pedidos</Label>
                    <Input
                      type="number"
                      value={metrics.pedidos}
                      onChange={(e) => setMetrics((m) => ({ ...m, pedidos: Number(e.target.value) }))}
                      className="bg-black border-white/10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] font-black uppercase">Comissão (R$)</Label>
                    <Input
                      type="number"
                      value={metrics.comissao}
                      onChange={(e) => setMetrics((m) => ({ ...m, comissao: Number(e.target.value) }))}
                      className="bg-black border-white/10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] font-black uppercase">Cliques</Label>
                    <Input
                      type="number"
                      value={metrics.cliques}
                      onChange={(e) => setMetrics((m) => ({ ...m, cliques: Number(e.target.value) }))}
                      className="bg-black border-white/10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] font-black uppercase">Produtos</Label>
                    <Input
                      type="number"
                      value={metrics.produtosAtivos}
                      onChange={(e) => setMetrics((m) => ({ ...m, produtosAtivos: Number(e.target.value) }))}
                      className="bg-black border-white/10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-4 py-6">
                  <h4 className="text-md font-bold text-white">Curva de Vendas (Mensal)</h4>
                  <div className="grid gap-2 grid-cols-3 md:grid-cols-6">
                    {salesData.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <Label className="text-white/40 text-[10px] font-black uppercase">{item.name}</Label>
                        <Input
                          type="number"
                          value={item.value}
                          onChange={(e) => updateSalesValue(idx, Number(e.target.value))}
                          className="bg-black border-white/10 h-10 rounded-xl"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={saveMetrics} className="bg-white text-black hover:bg-white/90 h-14 px-10 rounded-2xl font-black italic">
                  <Save className="h-5 w-5 mr-3 text-[#FE2C55]" />
                  SALVAR E APLICAR NO DASHBOARD
                </Button>
              </div>

              {/* Products management */}
              <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white border-l-4 border-[#FE2C55] pl-4">Gerenciar Catálogo (Radar)</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRestoreDefaults}
                      className="text-white/40 hover:text-white rounded-xl"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar Padrão
                    </Button>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Form */}
                  <div className="bg-black/40 rounded-3xl border border-white/5 p-6 space-y-6">
                    <h5 className="text-sm font-black text-white italic tracking-widest flex items-center gap-2">
                      <Plus className="h-4 w-4 text-[#FE2C55]" />
                      NOVO PRODUTO
                    </h5>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">Nome do Produto</Label>
                        <Input
                          value={newProduct.nome}
                          onChange={(e) => setNewProduct(p => ({ ...p, nome: e.target.value }))}
                          placeholder="Ex: Mini Fritadeira"
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-white/40">Valor (R$)</Label>
                        <Input
                          type="number"
                          value={newProduct.preco}
                          onChange={(e) => setNewProduct(p => ({ ...p, preco: Number(e.target.value) }))}
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-white/40">Comissão (%)</Label>
                        <Input
                          type="number"
                          value={newProduct.comissao}
                          onChange={(e) => setNewProduct(p => ({ ...p, comissao: Number(e.target.value) }))}
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">URL da Imagem</Label>
                        <Input
                          value={newProduct.imageUrl}
                          onChange={(e) => setNewProduct(p => ({ ...p, imageUrl: e.target.value }))}
                          placeholder="https://images.unsplash.com/..."
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">Link do TikTok Shop</Label>
                        <Input
                          value={newProduct.linkTiktok}
                          onChange={(e) => setNewProduct(p => ({ ...p, linkTiktok: e.target.value }))}
                          placeholder="https://vt.tiktok.com/..."
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button onClick={addNewProduct} className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white h-14 rounded-2xl font-black italic">
                      ADICIONAR AO RADAR ⚡
                    </Button>
                  </div>

                  {/* List */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-white/40 tracking-[4px]">Catálogo Atual</h5>
                    <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={cn(
                            "flex items-center justify-between rounded-2xl px-4 py-3 border border-white/5 transition-all group",
                            editingProduct?.id === product.id
                              ? "bg-white/10 border-[#FE2C55]"
                              : "bg-black hover:bg-white/5"
                          )}
                        >
                          <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setEditingProduct(product)}>
                            <img
                              src={product.imageUrl}
                              alt={product.nome}
                              className="h-12 w-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10"
                            />
                            <div>
                              <p className="text-sm font-black text-white italic">{product.nome}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{product.categoria} • R$ {product.preco}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProduct(product.id);
                            }}
                            className="text-white/20 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {editingProduct && (
                  <div className="animate-in slide-in-from-bottom-4 space-y-6 rounded-[32px] border-2 border-[#FE2C55]/30 bg-[#050505] p-8 mt-4 shadow-[0_0_40px_rgba(254,44,85,0.1)]">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xl font-black text-white italic">EDITANDO: {editingProduct.nome}</h5>
                      <Button variant="ghost" className="text-white/40" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-white/40">Nome</Label>
                        <Input
                          value={editingProduct.nome}
                          onChange={(e) => setEditingProduct((p) => p ? { ...p, nome: e.target.value } : null)}
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-white/40">Preço (R$)</Label>
                        <Input
                          type="number"
                          value={editingProduct.preco}
                          onChange={(e) => setEditingProduct((p) => p ? { ...p, preco: Number(e.target.value) } : null)}
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-white/40">Comissão (%)</Label>
                        <Input
                          type="number"
                          value={editingProduct.comissao}
                          onChange={(e) => setEditingProduct((p) => p ? { ...p, comissao: Number(e.target.value) } : null)}
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1 lg:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">URL da Imagem</Label>
                        <Input
                          value={editingProduct.imageUrl}
                          onChange={(e) => setEditingProduct((p) => p ? { ...p, imageUrl: e.target.value } : null)}
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1 lg:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-white/40">Link TikTok</Label>
                        <Input
                          value={editingProduct.linkTiktok}
                          onChange={(e) => setEditingProduct((p) => p ? { ...p, linkTiktok: e.target.value } : null)}
                          className="bg-black border-white/10 h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button onClick={saveProduct} className="bg-white text-black hover:bg-white/90 h-14 px-10 rounded-2xl font-black italic">
                      ATUALIZAR PRODUTO ⚡
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
