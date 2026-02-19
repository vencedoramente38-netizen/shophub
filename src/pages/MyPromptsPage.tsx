import { useState } from "react";
import { Search, Copy, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePrompts, SavedPrompt } from "@/hooks/usePrompts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const origins: SavedPrompt["origin"][] = ["Criar Video", "Criar Perfil", "Outro"];

export default function MyPromptsPage() {
  const { prompts, deletePrompt } = usePrompts();
  const [search, setSearch] = useState("");
  const [originFilter, setOriginFilter] = useState<SavedPrompt["origin"] | "all">("all");

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    const matchesOrigin = originFilter === "all" || p.origin === originFilter;
    return matchesSearch && matchesOrigin;
  });

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Prompt copiado!");
  };

  const handleDelete = (id: number) => {
    deletePrompt(id);
    toast.success("Prompt excluido!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Meus Prompts</h2>
        <p className="text-sm text-muted-foreground">
          Prompts salvos de Criar Video e Criar Perfil
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-white/10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setOriginFilter("all")}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              originFilter === "all"
                ? "bg-primary text-white"
                : "bg-secondary text-white/70 hover:bg-secondary/80"
            )}
          >
            Todos
          </button>
          {origins.map((origin) => (
            <button
              key={origin}
              onClick={() => setOriginFilter(origin)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                originFilter === origin
                  ? "bg-primary text-white"
                  : "bg-secondary text-white/70 hover:bg-secondary/80"
              )}
            >
              {origin}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts list */}
      {filteredPrompts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-semibold text-white">Nenhum prompt encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {prompts.length === 0
              ? "Crie prompts em Criar Video ou Criar Perfil"
              : "Tente ajustar os filtros de busca"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-3xl border border-white/10 bg-card p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white truncate">{prompt.title}</h3>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      {prompt.origin}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {prompt.createdAt.toLocaleDateString("pt-BR")} as{" "}
                    {prompt.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(prompt.content)}
                    className="text-white/60 hover:text-white hover:bg-white/5"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(prompt.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/30 p-4">
                <p className="text-sm text-white whitespace-pre-wrap line-clamp-4">
                  {prompt.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
