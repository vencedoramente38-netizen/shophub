import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Check, ChevronRight, ChevronLeft, Download, Copy,
  ExternalLink, Shuffle, Plus, Search, Mic, Sparkles,
  Camera, Eye, User, Clock
} from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useProducts } from "@/hooks/useProducts";
import { usePrompts } from "@/hooks/usePrompts";
import { useConfetti } from "@/hooks/useConfetti";
import { defaultAvatars } from "@/data/products";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { NeonCard, NeonSection } from "@/components/synclab/NeonCard";
import { ProductSelectorModal } from "@/components/synclab/ProductSelectorModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Config types ──
interface SyncLabConfig {
  productId: number | null;
  cenario: string;
  cenarioCustom: string;
  cameraStyle: string;
  avatarId: number | null;
  customAvatarUrl: string;
  instrucoes: string;
  duracao: string;
  mood: string;
  tipoVoz: string;
  tonalidade: string;
  falaAvatar: string;
}

const initial: SyncLabConfig = {
  productId: null,
  cenario: "",
  cenarioCustom: "",
  cameraStyle: "",
  avatarId: null,
  customAvatarUrl: "",
  instrucoes: "",
  duracao: "",
  mood: "",
  tipoVoz: "",
  tonalidade: "",
  falaAvatar: "",
};

// ── Options data ──
const cenarios = [
  { value: "casa", label: "Em Casa", emoji: "🏠" },
  { value: "estudio", label: "Estúdio", emoji: "🎬" },
  { value: "rua", label: "Na Rua", emoji: "🌆" },
  { value: "natureza", label: "Natureza", emoji: "🌿" },
  { value: "loja", label: "Loja / Vitrine", emoji: "🏪" },
  { value: "escritorio", label: "Escritório", emoji: "💼" },
  { value: "custom", label: "Personalizado", emoji: "✏️" },
];

const duracoes = [
  { value: "1-take", label: "1 take", sub: "~8s" },
  { value: "2-takes", label: "2 takes", sub: "~16s" },
  { value: "3-takes", label: "3 takes", sub: "~24s" },
  { value: "4-takes", label: "4 takes", sub: "~32s" },
  { value: "5-takes", label: "5 takes", sub: "~40s" },
];

const moods = [
  { value: "animado", label: "Animado", emoji: "🔥", desc: "Energia alta, empolgação contagiante" },
  { value: "calmo", label: "Calmo", emoji: "😌", desc: "Tranquilo, confiante e sereno" },
  { value: "urgente", label: "Urgente", emoji: "⚡", desc: "Rápido, escassez, 'compre agora!'" },
  { value: "divertido", label: "Divertido", emoji: "😂", desc: "Humor, leveza e descontração" },
];

const tonalidades = [
  { value: "grave", label: "Grave" },
  { value: "medio", label: "Médio" },
  { value: "agudo", label: "Agudo" },
  { value: "doce", label: "Doce" },
  { value: "energetico", label: "Energético" },
  { value: "serio", label: "Sério" },
];

const videoStyles = [
  "UGC (User Generated Content)", "Storytelling emocional", "Review honesto",
  "ASMR / Satisfying", "Unboxing", "Top 5 / Ranking",
  "Comparação", "Tutorial passo a passo", "POV", "Trend / Viral",
];

const hashtags = [
  "#fyp", "#foryou", "#tiktokshop", "#viral", "#compras",
  "#oferta", "#promocao", "#tendencia", "#recomendo", "#dicadodia",
  "#achados", "#tiktokbrasil", "#comprasonline",
];

const parts = ["Seleção", "Configuração", "Fala", "Revisão"];

// ── Main Component ──
export default function CreateVideoPage() {
  const [config, setConfig] = useState<SyncLabConfig>(initial);
  const [currentPart, setCurrentPart] = useState(0);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [showProductModal, setShowProductModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.product) {
      set("productId", location.state.product.id);
      toast.success(`Produto selecionado: ${location.state.product.nome}`);
    }
  }, [location.state]);

  const { products, getFavoriteProducts, isFavorite } = useProducts();
  const { addPrompt } = usePrompts();
  const { fire: fireConfetti } = useConfetti();

  const favoriteProducts = getFavoriteProducts();
  const selectedProduct = products.find(p => p.id === config.productId);
  const selectedAvatar = config.avatarId === -1
    ? { id: -1, name: "Seu avatar", imageUrl: config.customAvatarUrl }
    : defaultAvatars.find(a => a.id === config.avatarId) || null;

  const set = useCallback(<K extends keyof SyncLabConfig>(key: K, value: SyncLabConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // ── Download helper ──
  const handleDownload = async (imageUrl: string, name: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s+/g, "-").toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download concluído! 🎉");
    } catch {
      toast.error("Erro no download");
    }
  };

  // ── Generate Prompt ──
  const generatePrompt = useCallback((styleOverride?: string) => {
    const product = products.find(p => p.id === config.productId);
    if (!product) return;

    const style = styleOverride || videoStyles[currentStyleIndex];
    const cenarioText = config.cenario === "custom" ? config.cenarioCustom : cenarios.find(c => c.value === config.cenario)?.label || "Livre";
    const moodText = moods.find(m => m.value === config.mood)?.label || "Animado";
    const duracaoText = duracoes.find(d => d.value === config.duracao)?.label || "3 takes (~24s)";
    const avatar = selectedAvatar;

    const prompt = `Você é um roteirista profissional especializado em vídeos virais para TikTok Shop. Crie um roteiro COMPLETO e DETALHADO seguindo TODAS as instruções abaixo.

====================================
1. BRIEFING DO VÍDEO
====================================
ESTILO DO VÍDEO: ${style}
PRODUTO: ${product.nome}
CATEGORIA: ${product.categoria}
PREÇO: ${product.precoTexto || `R$ ${product.preco.toFixed(2)}`}
COMISSÃO: ${product.comissao}%
LINK: ${product.linkTiktok}
CENÁRIO: ${cenarioText}
ESTILO DE CÂMERA: ${config.cameraStyle === "avatar" ? "Avatar Visual" : "POV (Ponto de Vista)"}
${avatar ? `AVATAR: ${avatar.name}` : "AVATAR: Nenhum"}
DURAÇÃO: ${duracaoText}
TOM/MOOD: ${moodText}
TIPO DE VOZ: ${config.tipoVoz === "feminina" ? "Feminina" : "Masculina"}
TONALIDADE: ${tonalidades.find(t => t.value === config.tonalidade)?.label || "Médio"}
${config.instrucoes ? `INSTRUÇÕES EXTRAS: ${config.instrucoes}` : ""}
${config.falaAvatar ? `FALA DO AVATAR: ${config.falaAvatar}` : ""}

====================================
2. PERSONA DO CRIADOR
====================================
Defina a persona ideal para este vídeo:
- Idade aparente, gênero, estilo visual
- Personalidade e energia que deve transmitir
- Como deve se apresentar nos primeiros 2 segundos
- Tom de fala e ritmo de comunicação

====================================
3. GANCHOS DE ABERTURA (3 VARIAÇÕES)
====================================
Crie 3 opções de gancho poderoso para os primeiros 3 segundos:
- GANCHO 1 (Curiosidade): frase que gera pergunta na mente
- GANCHO 2 (Choque/Surpresa): dado ou afirmação impactante
- GANCHO 3 (Identificação): "Você também..." / "Se você..."
Cada gancho deve ser curto (máx 10 palavras) e impossível de ignorar.

====================================
4. ROTEIRO CENA A CENA
====================================
Divida o roteiro em cenas com marcações de tempo:

CENA 1 (0s-3s) — GANCHO
- Texto falado: [fala exata]
- Ação visual: [o que aparece na tela]
- Texto na tela: [legenda curta e forte, máx 5 palavras]
- Enquadramento: [close-up / plano médio / etc]
- Transição: [corte seco / zoom / swipe]

CENA 2 (3s-8s) — PROBLEMA/CONTEXTO
- Texto falado: [fala exata]
- Ação visual: [demonstração do problema]
- Texto na tela: [legenda de impacto]
- B-roll sugerido: [imagens de apoio]

CENA 3 (8s-15s) — APRESENTAÇÃO DO PRODUTO
- Texto falado: [fala exata mostrando o produto]
- Ação visual: [unboxing / demonstração / close-up do produto]
- Texto na tela: [nome do produto + benefício principal]
- Zoom/movimento: [speed ramp / slow motion no detalhe]

CENA 4 (15s-25s) — PROVA + BENEFÍCIOS
- Texto falado: [prova social + 2-3 benefícios rápidos]
- Ação visual: [uso real / antes-depois / resultado]
- Texto na tela: [bullet points dos benefícios]
- B-roll: [closes nos detalhes]

CENA 5 (25s+) — CTA + FECHAMENTO
- Texto falado: [CTA claro e urgente]
- Ação visual: [apontar para link / mostrar preço / empilhar produto]
- Texto na tela: [CTA + preço + "Link na bio" / "TikTok Shop"]

====================================
5. NARRAÇÃO — TOM E RITMO POR CENA
====================================
Para cada cena, especifique:
- Volume/energia da voz (de 1 a 10)
- Velocidade da fala (rápida/média/lenta)
- Emoção predominante (empolgação/seriedade/humor/urgência)
- Pausas dramáticas (onde colocar silêncios de 0.5s)

====================================
6. TEXTO NA TELA (LEGENDAS ESTILO CAPCUT)
====================================
Para cada cena, forneça:
- Texto curto e forte (máx 5-7 palavras por frame)
- Cor sugerida (branco com sombra / amarelo destaque / vermelho urgência)
- Posição (centro / topo / base)
- Animação sugerida (pop-in / typewriter / shake)

====================================
7. SUGESTÕES DE B-ROLL / TAKE / ENQUADRAMENTO
====================================
Liste pelo menos 5 sugestões de takes adicionais:
1. Close-up extremo do produto
2. Mão segurando o produto (aesthetic)
3. Pessoa usando em cenário real
4. Comparação lado a lado
5. Reação genuína de uso
Especifique ângulo da câmera e iluminação para cada take.

====================================
8. INSTRUÇÕES DE EDIÇÃO
====================================
- ZOOM: onde aplicar zoom in/out (timestamps)
- SPEED RAMP: momentos de aceleração/desaceleração
- CORTES: frequência ideal (a cada X segundos)
- LEGENDAS: estilo CapCut (fonte, tamanho, cor, animação)
- MÚSICA: gênero + BPM sugerido + momentos de beat drop
- EFEITOS SONOROS: onde colocar "whoosh", "pop", "ding"
- FILTRO/GRADE: tom de cor sugerido (quente/frio/neutro)

====================================
9. CTA — 3 VARIAÇÕES
====================================
CTA 1 (Direto): "Compre agora" + frase de urgência
CTA 2 (Social proof): "Mais de X pessoas já compraram..."
CTA 3 (Escassez): "Últimas unidades / Só hoje / Preço especial..."

====================================
10. CHECKLIST DE COMPLIANCE
====================================
Verifique se o roteiro:
[ ] NÃO promete resultados milagrosos
[ ] NÃO usa linguagem enganosa
[ ] NÃO viola diretrizes do TikTok
[ ] TEM disclaimer se necessário
[ ] Menciona o preço real do produto
[ ] CTA é claro sem ser agressivo demais
[ ] Conteúdo é adequado para todas as idades

====================================
11. HASHTAGS RECOMENDADAS
====================================
${hashtags.join(" ")}
+ 5 hashtags específicas do nicho "${product.categoria}"

====================================
OUTPUT FINAL: Entregue o roteiro completo e estruturado acima, pronto para ser copiado e usado no Google Flow VEO3.
====================================`;

    return prompt;
  }, [config, products, currentStyleIndex, selectedAvatar]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 95) { clearInterval(interval); return 95; }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    clearInterval(interval);
    setGenProgress(100);

    const prompt = generatePrompt();
    if (prompt) {
      setGeneratedPrompt(prompt);
      addPrompt(`Sync Lab - ${selectedProduct?.nome || "Produto"}`, prompt, "Sync Lab");
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsGenerating(false);
    setShowResult(true);
    toast.success("Prompt V03 gerado com sucesso! 🚀");
    fireConfetti();
  };

  const handleShuffle = () => {
    const nextIndex = (currentStyleIndex + 1) % videoStyles.length;
    setCurrentStyleIndex(nextIndex);
    const prompt = generatePrompt(videoStyles[nextIndex]);
    if (prompt) {
      setGeneratedPrompt(prompt);
      toast.success(`Nova variação: ${videoStyles[nextIndex]}`);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success("Prompt copiado! 📋");
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(hashtags.join(" "));
    toast.success("Hashtags copiadas! 📋");
  };

  const handlePickGalleryAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          set("avatarId", -1);
          set("customAvatarUrl", ev.target?.result as string);
          toast.success("Avatar carregado!");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleGenerateAISpeech = () => {
    const product = selectedProduct;
    if (!product) { toast.error("Selecione um produto primeiro"); return; }
    const moodLabel = moods.find(m => m.value === config.mood)?.label || "animado";
    const speech = `Gente, vocês PRECISAM conhecer isso! ${product.nome} por apenas ${product.precoTexto || `R$ ${product.preco.toFixed(2)}`}! Eu testei e é simplesmente INCRÍVEL. A qualidade surpreende demais pelo preço. Corre que tá voando no TikTok Shop! Link na bio! 🔥`;
    set("falaAvatar", speech);
    toast.success("Fala gerada com IA! ✨");
  };

  const goToEdit = (part: number) => {
    setShowResult(false);
    setCurrentPart(part);
  };

  // ── If showing result ──
  if (showResult && generatedPrompt) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Sync Lab — Resultado</h2>
            <p className="text-sm text-muted-foreground">Prompt V03 gerado com sucesso</p>
          </div>
          <Button variant="outline" className="border-white/10" onClick={() => { setShowResult(false); setCurrentPart(0); setGeneratedPrompt(""); }}>
            Novo Prompt
          </Button>
        </div>

        {/* Product + Avatar cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {selectedProduct && (
            <div className="rounded-2xl border border-white/10 bg-card p-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">Produto Selecionado</p>
              <div className="flex items-center gap-3">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.nome} className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white line-clamp-2">{selectedProduct.nome}</p>
                  <p className="text-xs text-muted-foreground">{selectedProduct.precoTexto}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full border-white/10 text-white hover:bg-white/5" onClick={() => handleDownload(selectedProduct.imageUrl, selectedProduct.nome)}>
                <Download className="mr-2 h-3.5 w-3.5" /> Baixar imagem
              </Button>
            </div>
          )}
          {selectedAvatar && selectedAvatar.imageUrl && (
            <div className="rounded-2xl border border-[hsl(var(--neon-pink))]/30 bg-card p-4 shadow-[0_0_20px_hsl(var(--neon-pink)/0.1)]">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[hsl(var(--neon-pink))]">Avatar do Vídeo</p>
              <div className="flex items-center gap-3">
                <img src={selectedAvatar.imageUrl} alt={selectedAvatar.name} className="h-16 w-16 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{selectedAvatar.name}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full border-[hsl(var(--neon-pink))]/30 text-[hsl(var(--neon-pink))]" onClick={() => handleDownload(selectedAvatar.imageUrl, selectedAvatar.name)}>
                <Download className="mr-2 h-3.5 w-3.5" /> Baixar imagem
              </Button>
            </div>
          )}
        </div>

        {/* Generated Prompt */}
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">📝 Prompt Gerado</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/10" onClick={() => setPromptExpanded(!promptExpanded)}>
                {promptExpanded ? "Recolher" : "Ver completo"}
              </Button>
              <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={handleCopyPrompt}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar
              </Button>
              <Button size="sm" variant="outline" className="border-[#FE2C55]/30 text-[#FE2C55] hover:bg-[#FE2C55]/5" onClick={handleShuffle}>
                <Shuffle className="mr-1.5 h-3.5 w-3.5" /> Nova variação
              </Button>
            </div>
          </div>
          <div className={cn("rounded-xl bg-secondary/50 p-4 text-sm text-white/80 whitespace-pre-wrap font-mono", promptExpanded ? "" : "max-h-[200px] overflow-hidden relative")}>
            {generatedPrompt}
            {!promptExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-secondary/90 to-transparent" />
            )}
          </div>
        </div>

        {/* Hashtags */}
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white"># Hashtags Recomendadas</h3>
            <Button size="sm" variant="outline" className="border-white/10" onClick={handleCopyHashtags}>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar todas
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map(h => (
              <span key={h} className="rounded-full border border-[hsl(var(--neon-pink))]/30 bg-[hsl(var(--neon-pink))]/10 px-3 py-1 text-sm text-[hsl(var(--neon-pink))]">
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* CTA - Flow VEO3 */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#FE2C55]/5 to-black p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">🎬 Crie o vídeo com IA</h3>
          <p className="text-sm text-muted-foreground mb-4">Cole o prompt no Google Flow VEO3 para gerar seu vídeo automaticamente</p>
          <div className="flex justify-center">
            <ShimmerButton
              className="px-10 h-14 text-lg font-black bg-[#FE2C55] text-white hover:opacity-90 transition-opacity"
              shimmerColor="#ffffff"
              onClick={() => window.open("https://labs.google/fx/pt/tools/flow", "_blank")}
            >
              <ExternalLink className="mr-3 h-5 w-5" />
              ABRIR FLOW VEO3
            </ShimmerButton>
          </div>
        </div>
      </div>
    );
  }

  // ── If generating ──
  if (isGenerating) {
    return (
      <div className="flex min-h-[400px] items-center justify-center animate-fade-in">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-8 text-center">
          <div className="mb-6">
            <Sparkles className="mx-auto h-12 w-12 text-[hsl(var(--neon-pink))] animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Otimizando prompt…</h3>
          <p className="text-sm text-muted-foreground mb-6">Gerando prompt otimizado para V03</p>
          <div className="relative mb-3">
            <Progress value={genProgress} className="h-3 bg-secondary [&>div]:bg-[#FE2C55]" />
          </div>
          <p className="text-2xl font-bold text-white">{Math.round(genProgress)}%</p>
        </div>
      </div>
    );
  }

  // ── Wizard ──
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Sync Lab</h2>
        <p className="text-sm text-muted-foreground">Wizard de criação de prompt para vídeo viral V03</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {parts.map((part, idx) => (
          <div key={part} className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPart(idx)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                idx === currentPart
                  ? "bg-[#FE2C55] text-white shadow-[0_0_12px_rgba(254,44,85,0.4)]"
                  : idx < currentPart
                    ? "bg-[#FE2C55]/20 text-[#FE2C55]"
                    : "bg-secondary text-muted-foreground"
              )}
            >
              {idx < currentPart ? <Check className="h-4 w-4" /> : idx + 1}
            </button>
            <span className={cn("hidden text-sm sm:block", idx === currentPart ? "text-white font-medium" : "text-muted-foreground")}>
              {part}
            </span>
            {idx < parts.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* ═══════ PART 1: SELEÇÃO ═══════ */}
      {currentPart === 0 && (
        <div className="space-y-6">
          {/* Q1: Product */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Selecione um produto" subtitle="Escolha do catálogo ou dos seus favoritos">
              {/* Favorites */}
              {favoriteProducts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--neon-pink))]">⭐ Meus Favoritos</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {favoriteProducts.map(p => (
                      <NeonCard key={p.id} selected={config.productId === p.id} onClick={() => set("productId", p.id)} className="flex-shrink-0 w-[180px]">
                        <div className="flex items-center gap-2">
                          <img src={p.imageUrl} alt={p.nome} className="h-12 w-12 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white line-clamp-2">{p.nome}</p>
                            <p className="text-[10px] text-muted-foreground">{p.precoTexto}</p>
                          </div>
                        </div>
                      </NeonCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Add button */}
              <Button variant="outline" className="border-dashed border-white/20 text-white hover:bg-white/5" onClick={() => setShowProductModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar produto do catálogo
              </Button>

              {/* Selected preview */}
              {selectedProduct && (
                <div className="rounded-xl border border-white/10 bg-secondary/30 p-4">
                  <div className="flex items-center gap-4">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.nome} className="h-20 w-20 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white line-clamp-2">{selectedProduct.nome}</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.categoria}</p>
                      <p className="text-lg font-bold text-white">{selectedProduct.precoTexto}</p>
                    </div>
                  </div>
                </div>
              )}
            </NeonSection>
          </div>

          {/* Q2: Cenário */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Cenário do vídeo" subtitle="Onde o vídeo será gravado? (opcional)">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cenarios.map(c => (
                  <NeonCard key={c.value} selected={config.cenario === c.value} onClick={() => set("cenario", c.value)}>
                    <div className="text-center">
                      <span className="text-2xl">{c.emoji}</span>
                      <p className="mt-1 text-sm font-medium text-white">{c.label}</p>
                    </div>
                  </NeonCard>
                ))}
              </div>
              {config.cenario === "custom" && (
                <Textarea
                  placeholder="Descreva o cenário personalizado..."
                  value={config.cenarioCustom}
                  onChange={e => set("cenarioCustom", e.target.value)}
                  className="mt-3 bg-secondary border-white/10"
                />
              )}
            </NeonSection>
          </div>
        </div>
      )}

      {/* ═══════ PART 2: CONFIGURAÇÃO ═══════ */}
      {currentPart === 1 && (
        <div className="space-y-6">
          {/* Q1: Camera style */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Estilo de câmera" subtitle="Como o vídeo será filmado?">
              <div className="grid gap-4 sm:grid-cols-2">
                <NeonCard selected={config.cameraStyle === "avatar"} onClick={() => set("cameraStyle", "avatar")} className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--neon-pink))]/10">
                      <User className="h-8 w-8 text-[hsl(var(--neon-pink))]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Avatar Visual</p>
                      <p className="text-xs text-muted-foreground mt-1">O avatar aparece falando e mostrando o produto</p>
                    </div>
                  </div>
                </NeonCard>
                <NeonCard selected={config.cameraStyle === "pov"} onClick={() => set("cameraStyle", "pov")} className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                      <Eye className="h-8 w-8 text-white/40" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">POV (Ponto de Vista)</p>
                      <p className="text-xs text-muted-foreground mt-1">Câmera em primeira pessoa, mãos e produto em foco</p>
                    </div>
                  </div>
                </NeonCard>
              </div>
            </NeonSection>
          </div>

          {/* Q2: Avatars (show always but highlight when Avatar Visual) */}
          <div className={cn("rounded-2xl border bg-card p-5 transition-all", config.cameraStyle === "avatar" ? "border-[hsl(var(--neon-pink))]/30" : "border-white/10 opacity-60")}>
            <NeonSection title="Escolha um avatar" subtitle={config.cameraStyle !== "avatar" ? "Disponível apenas com Avatar Visual" : "Selecione quem vai apresentar o produto"}>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {/* None option */}
                <NeonCard selected={config.avatarId === 0} onClick={() => { if (config.cameraStyle === "avatar") { set("avatarId", 0); set("customAvatarUrl", ""); } }} className="flex-shrink-0 w-[100px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                      <span className="text-xl text-muted-foreground">✕</span>
                    </div>
                    <p className="text-xs font-medium text-white">Nenhum</p>
                  </div>
                </NeonCard>

                {defaultAvatars.map(avatar => (
                  <NeonCard key={avatar.id} selected={config.avatarId === avatar.id} onClick={() => { if (config.cameraStyle === "avatar") { set("avatarId", avatar.id); set("customAvatarUrl", ""); } }} className="flex-shrink-0 w-[100px]">
                    <div className="flex flex-col items-center gap-2">
                      <img src={avatar.imageUrl} alt={avatar.name} className="h-14 w-14 rounded-full object-cover" />
                      <p className="text-xs font-medium text-white">{avatar.name}</p>
                    </div>
                  </NeonCard>
                ))}

                {/* Gallery upload */}
                <NeonCard selected={config.avatarId === -1} onClick={() => { if (config.cameraStyle === "avatar") handlePickGalleryAvatar(); }} className="flex-shrink-0 w-[100px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary overflow-hidden">
                      {config.customAvatarUrl ? (
                        <img src={config.customAvatarUrl} alt="Custom" className="h-full w-full object-cover" />
                      ) : (
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-white">Galeria</p>
                  </div>
                </NeonCard>
              </div>
              {selectedAvatar && config.avatarId !== 0 && config.avatarId !== null && (
                <p className="text-sm text-[hsl(var(--neon-pink))]">Avatar: {selectedAvatar.name}</p>
              )}
            </NeonSection>
          </div>

          {/* Q3: Instructions */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Instruções do vídeo" subtitle="Orientações extras para a IA (opcional)">
              <div className="relative">
                <Textarea
                  placeholder="A IA decide automaticamente se deixado em branco…"
                  value={config.instrucoes}
                  onChange={e => set("instrucoes", e.target.value)}
                  className="bg-secondary border-white/10 min-h-[100px] pr-12"
                />
                <button
                  className="absolute right-3 top-3 rounded-full bg-[hsl(var(--neon-pink))]/20 p-2 text-[hsl(var(--neon-pink))] hover:bg-[hsl(var(--neon-pink))]/30 transition-colors"
                  title="Ditar instruções"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-xl bg-secondary/30 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">💡 Exemplos:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• "Focar nos benefícios de saúde"</li>
                  <li>• "Usar comparação com concorrente"</li>
                  <li>• "Incluir depoimento no meio"</li>
                  <li>• "Começar com pergunta polêmica"</li>
                </ul>
              </div>
            </NeonSection>
          </div>

          {/* Q4: Duration */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Escolha a duração do vídeo" subtitle="Quantos takes o vídeo terá?">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {duracoes.map(d => (
                  <NeonCard key={d.value} selected={config.duracao === d.value} onClick={() => set("duracao", d.value)}>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.sub}</p>
                    </div>
                  </NeonCard>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">⏱️ Vídeos de 15-30s têm maior taxa de conclusão no TikTok</p>
            </NeonSection>
          </div>
        </div>
      )}

      {/* ═══════ PART 3: FALA ═══════ */}
      {currentPart === 2 && (
        <div className="space-y-6">
          {/* Q1: Mood */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Escolha o tom/mood da fala" subtitle="Qual energia o vídeo deve transmitir?">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {moods.map(m => (
                  <NeonCard key={m.value} selected={config.mood === m.value} onClick={() => set("mood", m.value)}>
                    <div className="text-center space-y-1">
                      <span className="text-2xl">{m.emoji}</span>
                      <p className="text-sm font-semibold text-white">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </div>
                  </NeonCard>
                ))}
              </div>
            </NeonSection>
          </div>

          {/* Q2: Voice type */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Tipo de voz" subtitle="Qual voz será usada na narração?">
              <div className="grid grid-cols-2 gap-4">
                <NeonCard selected={config.tipoVoz === "feminina"} onClick={() => set("tipoVoz", "feminina")} className="p-6">
                  <div className="text-center">
                    <p className="text-3xl mb-2">👩</p>
                    <p className="font-semibold text-white">Feminina</p>
                  </div>
                </NeonCard>
                <NeonCard selected={config.tipoVoz === "masculina"} onClick={() => set("tipoVoz", "masculina")} className="p-6">
                  <div className="text-center">
                    <p className="text-3xl mb-2">👨</p>
                    <p className="font-semibold text-white">Masculina</p>
                  </div>
                </NeonCard>
              </div>
            </NeonSection>
          </div>

          {/* Q3: Tonality */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Tonalidade da voz" subtitle="Escolha o timbre e estilo de fala">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {tonalidades.map(t => (
                  <NeonCard key={t.value} selected={config.tonalidade === t.value} onClick={() => set("tonalidade", t.value)}>
                    <p className="text-center text-sm font-semibold text-white">{t.label}</p>
                  </NeonCard>
                ))}
              </div>
            </NeonSection>
          </div>

          {/* Q4: Avatar speech */}
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Fala do avatar" subtitle="O que o avatar/narrador vai dizer? (opcional)">
              <div className="relative">
                <Textarea
                  placeholder="A IA decide automaticamente se deixado em branco…"
                  value={config.falaAvatar}
                  onChange={e => set("falaAvatar", e.target.value)}
                  className="bg-secondary border-white/10 min-h-[120px]"
                />
              </div>
              <Button variant="outline" className="border-[#FE2C55]/30 text-[#FE2C55] hover:bg-[#FE2C55]/5" onClick={handleGenerateAISpeech}>
                <Sparkles className="mr-2 h-4 w-4" /> Gerar com IA
              </Button>
            </NeonSection>
          </div>
        </div>
      )}

      {/* ═══════ PART 4: REVISÃO ═══════ */}
      {currentPart === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <NeonSection title="Revisão" subtitle="Confira tudo antes de gerar o prompt V03">
              <div className="space-y-3">
                {[
                  { label: "Produto", value: selectedProduct?.nome || "Não selecionado", part: 0 },
                  { label: "Cenário", value: config.cenario === "custom" ? config.cenarioCustom : (cenarios.find(c => c.value === config.cenario)?.label || "Não definido"), part: 0 },
                  { label: "Estilo de Câmera", value: config.cameraStyle === "avatar" ? "Avatar Visual" : config.cameraStyle === "pov" ? "POV" : "Não definido", part: 1 },
                  { label: "Avatar", value: selectedAvatar && config.avatarId !== 0 ? selectedAvatar.name : "Nenhum", part: 1 },
                  { label: "Instruções", value: config.instrucoes || "IA decide automaticamente", part: 1 },
                  { label: "Duração", value: duracoes.find(d => d.value === config.duracao)?.label || "Não definida", part: 1 },
                  { label: "Tom/Mood", value: moods.find(m => m.value === config.mood)?.label || "Não definido", part: 2 },
                  { label: "Tipo de Voz", value: config.tipoVoz === "feminina" ? "Feminina" : config.tipoVoz === "masculina" ? "Masculina" : "Não definido", part: 2 },
                  { label: "Tonalidade", value: tonalidades.find(t => t.value === config.tonalidade)?.label || "Não definida", part: 2 },
                  { label: "Fala do Avatar", value: config.falaAvatar ? config.falaAvatar.slice(0, 60) + (config.falaAvatar.length > 60 ? "..." : "") : "IA decide automaticamente", part: 2 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-secondary/30 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm text-white line-clamp-1">{item.value}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-[#FE2C55] hover:text-[#FE2C55]/80" onClick={() => goToEdit(item.part)}>
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            </NeonSection>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!config.productId}
            className="w-full h-14 text-lg font-bold bg-[#FE2C55] text-white hover:opacity-90 shadow-[0_0_20px_rgba(254,44,85,0.3)] transition-all"
          >
            <Sparkles className="mr-2 h-5 w-5" /> Gerar Prompt V03
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          className="border-white/10"
          onClick={() => setCurrentPart(Math.max(0, currentPart - 1))}
          disabled={currentPart === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
        </Button>
        {currentPart < 3 && (
          <Button
            onClick={() => setCurrentPart(currentPart + 1)}
            className="bg-primary text-white"
          >
            Próximo <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Product Selector Modal */}
      <ProductSelectorModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={(p) => set("productId", p.id)}
        products={products}
      />
    </div>
  );
}
