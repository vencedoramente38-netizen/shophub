import { useState, useEffect, useCallback } from "react";
import { defaultProducts, Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FAVORITES_KEY = "favoriteProductIds";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedProducts: Product[] = data.map((p: {
          id: number;
          nome: string;
          categoria: string;
          preco: number;
          avaliacao: number;
          vendas: number;
          comissao: number;
          concorrencia: string;
          image_url: string;
          link_tiktok: string;
          score_viral: number;
          preco_texto: string;
        }) => ({
          id: Number(p.id),
          nome: p.nome,
          categoria: p.categoria,
          preco: p.preco,
          avaliacao: p.avaliacao,
          vendas: p.vendas,
          comissao: p.comissao,
          concorrencia: p.concorrencia as Product["concorrencia"],
          imageUrl: p.image_url,
          linkTiktok: p.link_tiktok,
          scoreViral: p.score_viral,
          precoTexto: p.preco_texto,
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
      setProducts(defaultProducts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        setFavorites([]);
      }
    }
  }, [fetchProducts]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isFavorite = useCallback((productId: number) => {
    return favorites.includes(productId);
  }, [favorites]);

  const getFavoriteProducts = useCallback(() => {
    return products.filter(p => favorites.includes(p.id));
  }, [products, favorites]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          nome: updatedProduct.nome,
          categoria: updatedProduct.categoria,
          preco: updatedProduct.preco,
          avaliacao: updatedProduct.avaliacao,
          vendas: updatedProduct.vendas,
          comissao: updatedProduct.comissao,
          concorrencia: updatedProduct.concorrencia,
          image_url: updatedProduct.imageUrl,
          link_tiktok: updatedProduct.linkTiktok,
          score_viral: updatedProduct.scoreViral,
          preco_texto: updatedProduct.precoTexto,
        })
        .eq("id", updatedProduct.id);

      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast.success("Produto atualizado!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto");
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          nome: product.nome,
          categoria: product.categoria,
          preco: product.preco,
          avaliacao: product.avaliacao,
          vendas: product.vendas,
          comissao: product.comissao,
          concorrencia: product.concorrencia,
          image_url: product.imageUrl,
          link_tiktok: product.linkTiktok,
          score_viral: product.scoreViral,
          preco_texto: product.precoTexto,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newProduct: Product = {
          id: Number(data.id),
          nome: data.nome,
          categoria: data.categoria,
          preco: data.preco,
          avaliacao: data.avaliacao,
          vendas: data.vendas,
          comissao: data.comissao,
          concorrencia: data.concorrencia as Product["concorrencia"],
          imageUrl: data.image_url,
          linkTiktok: data.link_tiktok,
          scoreViral: data.score_viral,
          precoTexto: data.preco_texto,
        };
        setProducts(prev => [newProduct, ...prev]);
        toast.success("Produto adicionado!");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Erro ao adicionar produto");
    }
  }, []);

  const deleteProduct = useCallback(async (productId: number) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
      setFavorites(prev => prev.filter(id => id !== productId));
      toast.success("Produto removido!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao remover produto");
    }
  }, []);

  const restoreDefaults = useCallback(async () => {
    try {
      // Clear existing products
      const { error: deleteError } = await supabase.from("products").delete().neq("id", 0);
      if (deleteError) throw deleteError;

      // Insert defaults
      const toInsert = defaultProducts.map(p => ({
        nome: p.nome,
        categoria: p.categoria,
        preco: p.preco,
        avaliacao: p.avaliacao,
        vendas: p.vendas,
        comissao: p.comissao,
        concorrencia: p.concorrencia,
        image_url: p.imageUrl,
        link_tiktok: p.linkTiktok,
        score_viral: p.scoreViral,
        preco_texto: p.precoTexto,
      }));

      const { error: insertError } = await supabase.from("products").insert(toInsert);
      if (insertError) throw insertError;

      fetchProducts();
      toast.success("Produtos restaurados!");
    } catch (error) {
      console.error("Error restoring defaults:", error);
      toast.error("Erro ao restaurar produtos");
    }
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteProducts,
    updateProduct,
    addProduct,
    deleteProduct,
    restoreDefaults
  };
}
