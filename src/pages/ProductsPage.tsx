import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Flame, TrendingUp, ShieldCheck, Download, Heart, Star, ExternalLink, Search, Video, Save, CheckCircle2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { products, favorites, toggleFavorite, isFavorite } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["all", ...Array.from(new Set(products.map(p => p.categoria)))];

  const filteredProducts = products
    .filter(p => categoryFilter === "all" || p.categoria === categoryFilter)
    .filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()));

  const hotProducts = products.filter(p => (p.scoreViral || 0) >= 85).length;
  const highScoreProducts = products.filter(p => (p.scoreViral || 0) >= 80).length;
  const lowCompetition = products.filter(p => p.concorrencia === "Baixa").length;

  const metrics = [
    { label: "Produtos disponiveis", value: products.length, icon: Package, color: "bg-primary" },
    { label: "Produtos Hot", value: hotProducts, icon: Flame, color: "bg-primary" },
    { label: "Score alto", value: highScoreProducts, icon: TrendingUp, color: "bg-primary" },
    { label: "Baixa concorrencia", value: lowCompetition, icon: ShieldCheck, color: "bg-primary" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleDownload = async (imageUrl: string, productName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download concluído!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Erro no download");
    }
  };

  const handleToggleFavorite = (productId: number) => {
    const wasFavorite = isFavorite(productId);
    toggleFavorite(productId);
    toast.success(wasFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Central de Mineracao</h2>
        <p className="text-sm text-muted-foreground">
          Descubra produtos com alto potencial de vendas no TikTok Shop.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-white/10 bg-card px-6 py-4"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${metric.color} text-white`}>
                <metric.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-bold text-white">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-white/10 pl-10"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              categoryFilter === cat
                ? "bg-primary text-white"
                : "bg-secondary text-white/70 hover:bg-secondary/80"
            )}
          >
            {cat === "all" ? "Todos" : cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group relative rounded-[22px] border border-white/10 bg-card overflow-hidden"
          >
            {/* Top actions */}
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <button
                onClick={() => handleToggleFavorite(product.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <Heart
                  className={cn("h-4 w-4", isFavorite(product.id) && "fill-primary text-primary")}
                />
              </button>
              <button
                onClick={() => handleDownload(product.imageUrl, product.nome)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            {/* Image */}
            <div className="relative aspect-square">
              <img
                src={product.imageUrl}
                alt={product.nome}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(product)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
                  Ver detalhes
                </span>
              </button>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-primary font-medium">{product.categoria}</p>
                <h4 className="font-semibold text-white line-clamp-1">{product.nome}</h4>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-white">{product.avaliacao}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.vendas.toLocaleString()} vendas
                </span>
              </div>

              {/* Score viral */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Score Viral</span>
                  <span className="text-white font-medium">{product.scoreViral || 0}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", getScoreColor(product.scoreViral || 0))}
                    style={{ width: `${product.scoreViral || 0}%` }}
                  />
                </div>
              </div>

              {/* Price and commission */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">
                  {product.precoTexto || `R$ ${product.preco.toFixed(2)}`}
                </span>
                <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  {product.comissao}% comissao
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Product detail modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl bg-[#0B0B10] border-white/10 p-0 overflow-hidden">
          {selectedProduct && (
            <div className="relative flex flex-col h-[85vh] md:h-auto max-h-[90vh]">
              <DialogHeader className="p-6 pb-0">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image left */}
                  <div className="w-full md:w-48 h-48 flex-shrink-0">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.nome}
                      className="w-full h-full object-cover rounded-2xl shadow-[0_0_20px_rgba(254,44,85,0.2)]"
                    />
                  </div>

                  {/* Top info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#FE2C55]/20 text-[#FE2C55] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedProduct.categoria}
                      </span>
                      {selectedProduct.concorrencia === "Baixa" && (
                        <span className="bg-white/5 text-white/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
                          Baixa Concorrência
                        </span>
                      )}
                    </div>
                    <DialogTitle className="text-xl font-bold text-white leading-tight">
                      {selectedProduct.nome}
                    </DialogTitle>

                    <div className="flex items-center gap-4 py-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-white">{selectedProduct.avaliacao}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span className="text-sm">{selectedProduct.vendas.toLocaleString()} vendas</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-3 pt-2">
                      <span className="text-2xl font-black text-white">
                        {selectedProduct.precoTexto || `R$ ${selectedProduct.preco.toFixed(2)}`}
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        +{selectedProduct.comissao}% Comissão
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Viral Score", value: `${selectedProduct.scoreViral || 0}%`, color: "bg-[#FE2C55]" },
                      { label: "Vendas/dia", value: "~45", color: "bg-white/20" },
                      { label: "Margem", value: "65%", color: "bg-purple-500" },
                      { label: "Tendência", value: "Alta", color: "bg-orange-500" }
                    ].map((m) => (
                      <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{m.label}</p>
                        <p className="text-lg font-black text-white">{m.value}</p>
                        <div className={`h-1 w-8 mx-auto mt-2 rounded-full ${m.color}`} />
                      </div>
                    ))}
                  </div>

                  {/* Creativos Recomendados */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Video className="h-4 w-4 text-[#FE2C55]" />
                        Criativos recomendados
                      </h3>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">6 itens encontrados</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="group relative aspect-[9/12] rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                          <img
                            src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=300&fit=crop`}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-[10px] font-bold text-white line-clamp-1 mb-1">Criativo #{i}</p>
                            <Button size="sm" className="w-full h-6 text-[9px] bg-[#FE2C55] hover:bg-[#FE2C55]/80 py-0" onClick={(e) => {
                              e.stopPropagation();
                              navigate("/sync-lab", { state: { product: selectedProduct } });
                              toast.success("Criativo selecionado!");
                            }}>
                              USAR NO LAB
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Spacer for fixed footer */}
                <div className="h-20" />
              </ScrollArea>

              {/* Fixed Footer Bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-[#0B0B10]/95 backdrop-blur-md border-t border-white/10 z-20">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 hover:bg-white/5 text-white bg-transparent h-12 rounded-xl text-xs font-bold"
                    onClick={() => {
                      window.open(selectedProduct.linkTiktok, "_blank");
                      toast.info("Abrindo link de afiliação...");
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    AFILIAR-SE
                  </Button>

                  <Button
                    className="flex-1 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white h-12 rounded-xl text-xs font-black shadow-[0_4px_15px_rgba(254,44,85,0.3)]"
                    onClick={() => {
                      navigate("/sync-lab", { state: { product: selectedProduct } });
                      toast.success("Produto selecionado no Sync Lab!");
                    }}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    CRIAR VÍDEO
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl border border-white/10 hover:bg-white/5 text-white"
                    onClick={() => handleDownload(selectedProduct.imageUrl, selectedProduct.nome)}
                  >
                    <Download className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-xl border border-white/10 hover:bg-white/5",
                      isFavorite(selectedProduct.id) ? "text-[#FE2C55]" : "text-white"
                    )}
                    onClick={() => {
                      const wasFav = isFavorite(selectedProduct.id);
                      toggleFavorite(selectedProduct.id);
                      toast.success(wasFav ? "Removido dos salvos" : "Salvo nos favoritos!");
                    }}
                  >
                    <Heart className={cn("h-5 w-5", isFavorite(selectedProduct.id) && "fill-current")} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
