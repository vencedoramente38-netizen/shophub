import { useState } from "react";
import { Search, X } from "lucide-react";
import { Product } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useProducts } from "@/hooks/useProducts";

interface ProductSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
  products: Product[];
}

export function ProductSelectorModal({ open, onClose, onSelect, products }: ProductSelectorModalProps) {
  const [search, setSearch] = useState("");
  const { isFavorite } = useProducts();

  const filtered = products.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const aFav = isFavorite(a.id);
    const bFav = isFavorite(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-card max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Selecionar Produto</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary border-white/10 pl-10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <ScrollArea className="h-[400px] pr-3">
          <div className="space-y-2">
            {sorted.map((product) => (
              <button
                key={product.id}
                onClick={() => { onSelect(product); onClose(); }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-secondary/30 p-3 text-left transition-colors hover:border-[hsl(var(--neon-pink))] hover:bg-[hsl(var(--neon-pink))]/5"
              >
                <img
                  src={product.imageUrl}
                  alt={product.nome}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white line-clamp-2">{product.nome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.precoTexto || `R$ ${product.preco.toFixed(2)}`}
                  </p>
                </div>
              </button>
            ))}
            {sorted.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
