import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SavedPrompt {
  id: number;
  title: string;
  content: string;
  origin: "Criar Video" | "Criar Perfil" | "Sync Lab" | "Viral Sync" | "Outro";
  createdAt: Date;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrompts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setPrompts(data.map(p => ({
          id: Number(p.id),
          title: p.title,
          content: p.content,
          origin: p.origin as any,
          createdAt: new Date(p.created_at)
        })));
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast.error("Erro ao carregar prompts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const addPrompt = useCallback(async (title: string, content: string, origin: SavedPrompt["origin"]) => {
    try {
      const { data, error } = await supabase
        .from("prompts")
        .insert({
          title,
          content,
          origin
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newPrompt: SavedPrompt = {
          id: Number(data.id),
          title: data.title,
          content: data.content,
          origin: data.origin as any,
          createdAt: new Date(data.created_at)
        };
        setPrompts(prev => [newPrompt, ...prev]);
        toast.success("Prompt salvo!");
        return newPrompt;
      }
    } catch (error) {
      console.error("Error adding prompt:", error);
      toast.error("Erro ao salvar prompt");
    }
  }, []);

  const deletePrompt = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setPrompts(prev => prev.filter(p => p.id !== id));
      toast.success("Prompt removido!");
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast.error("Erro ao remover prompt");
    }
  }, []);

  const updatePrompt = useCallback(async (id: number, updates: Partial<Omit<SavedPrompt, "id" | "createdAt">>) => {
    try {
      const { error } = await supabase
        .from("prompts")
        .update({
          title: updates.title,
          content: updates.content,
          origin: updates.origin
        })
        .eq("id", id);

      if (error) throw error;
      setPrompts(prev =>
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      );
      toast.success("Prompt atualizado!");
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast.error("Erro ao atualizar prompt");
    }
  }, []);

  return {
    prompts,
    isLoading,
    addPrompt,
    deletePrompt,
    updatePrompt
  };
}
