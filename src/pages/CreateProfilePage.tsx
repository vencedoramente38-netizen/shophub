import { useState } from "react";
import { Copy, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePrompts } from "@/hooks/usePrompts";
import { toast } from "sonner";

const nichos = [
  "Skincare",
  "Moda",
  "Fitness",
  "Tecnologia",
  "Casa & Decoracao",
  "Beleza",
  "Culinaria",
  "Pet",
  "Infantil",
];

const estilosPerfil = [
  { value: "profissional", label: "Profissional" },
  { value: "descolado", label: "Descolado" },
  { value: "minimalista", label: "Minimalista" },
  { value: "criativo", label: "Criativo" },
  { value: "engracado", label: "Engracado" },
];

const namesList = [
  "Maria Vendedora",
  "Ana Digital",
  "Loja da Lu",
  "Pedro Reviews",
  "Julia Shop",
  "Rafael Tech",
  "Camila Beauty",
  "Lucas Ofertas",
  "Fernanda Style",
  "Bruno Trends",
];

export default function CreateProfilePage() {
  const [nicho, setNicho] = useState("");
  const [estilo, setEstilo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [generatedBio, setGeneratedBio] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { addPrompt } = usePrompts();

  const generateNames = () => {
    const shuffled = [...namesList].sort(() => Math.random() - 0.5);
    setGeneratedNames(shuffled.slice(0, 5));
  };

  const generateBio = () => {
    const bios = [
      `Especialista em ${nicho || "produtos"} | Ofertas exclusivas diarias | Link na bio para comprar`,
      `Sua loja de ${nicho || "produtos"} favorita | Entrega rapida | Produtos selecionados`,
      `${estilo === "engracado" ? "O humor" : "A qualidade"} que voce merece | ${nicho || "Produtos"} incriveis | Compre agora`,
      `Descubra os melhores ${nicho || "produtos"} | Reviews honestos | Afiliado oficial TikTok Shop`,
      `${descricao ? descricao.slice(0, 50) : "Transformando vidas"} | ${nicho || "Produtos"} de qualidade | Siga para mais`,
    ];
    setGeneratedBio(bios[Math.floor(Math.random() * bios.length)]);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const handleSaveBio = () => {
    if (generatedBio) {
      addPrompt(`Bio - ${selectedName || "Perfil"}`, generatedBio, "Criar Perfil");
      toast.success("Bio salva em Meus Prompts!");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleDownloadAvatar = async () => {
    if (avatarUrl) {
      try {
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "avatar.jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch {
        toast.error("Erro ao baixar avatar");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Criar Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Gere nomes, bios e fotos de perfil para seu TikTok Shop
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-6">
          <h3 className="font-semibold text-white">Configuracoes</h3>
          
          <div className="space-y-2">
            <Label className="text-white">Nicho</Label>
            <Select value={nicho} onValueChange={setNicho}>
              <SelectTrigger className="bg-secondary border-white/10">
                <SelectValue placeholder="Selecione seu nicho" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {nichos.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Estilo do perfil</Label>
            <Select value={estilo} onValueChange={setEstilo}>
              <SelectTrigger className="bg-secondary border-white/10">
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {estilosPerfil.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Descricao adicional</Label>
            <Textarea
              placeholder="Algo especial sobre voce ou seu negocio"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-secondary border-white/10 min-h-[80px]"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-white">Foto de perfil</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl text-muted-foreground">+</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="block">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5" asChild>
                    <span>Upload de imagem</span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                <Input
                  placeholder="Ou cole uma URL"
                  value={avatarUrl.startsWith("blob:") ? "" : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="bg-secondary border-white/10"
                />
              </div>
            </div>
            {avatarUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAvatar}
                className="border-white/10 hover:bg-white/5"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar avatar
              </Button>
            )}
          </div>
        </div>

        {/* Generated content */}
        <div className="space-y-6">
          {/* Names */}
          <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Nomes sugeridos</h3>
              <Button onClick={generateNames} size="sm" className="bg-primary hover:bg-primary/90">
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
            {generatedNames.length > 0 ? (
              <div className="space-y-2">
                {generatedNames.map((name, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedName(name)}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                      selectedName === name
                        ? "bg-primary/20 border border-primary"
                        : "bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-white">{name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(name);
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Clique em Gerar para ver sugestoes de nomes
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="rounded-3xl border border-white/10 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Bio sugerida</h3>
              <Button onClick={generateBio} size="sm" className="bg-primary hover:bg-primary/90">
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar
              </Button>
            </div>
            {generatedBio ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-secondary/30 p-4">
                  <p className="text-white">{generatedBio}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(generatedBio)}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveBio}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Preencha as configuracoes e clique em Gerar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
