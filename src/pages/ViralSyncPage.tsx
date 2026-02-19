import { useState, useEffect } from "react";
import {
    Zap,
    ChevronRight,
    ChevronLeft,
    Search,
    Check,
    Copy,
    ExternalLink,
    MessageSquare,
    Sparkles,
    Trophy,
    History,
    Edit2,
    RefreshCw,
    Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// --- Mock Data ---
const categories = [
    { id: "alimentos", label: "Alimentos & Frutas", icon: "🍎" },
    { id: "cozinha", label: "Utensílios de Cozinha", icon: "🍳" },
    { id: "personalizados", label: "Personalizados", icon: "🎁" },
];

const objectsByCategory: Record<string, string[]> = {
    alimentos: ["Cebola Marrom", "Limão Siciliano", "Alho Roxo", "Batata Doce", "Maçã Gala"],
    cozinha: ["Fritadeira Airfryer", "Mixer de Mão", "Faca de Chef", "Tábua de Bambu"],
    personalizados: ["Caneca Térmica", "Almofada Decorativa", "Quadro de Fotos"],
};

const viralStyles = [
    { id: "humor", label: "Humor Rápido", desc: "Piadas curtas e reações engraçadas." },
    { id: "suspense", label: "Suspense", desc: "Ganchos que prendem até o final." },
    { id: "reclamando", label: "Objeto Reclamando", desc: "Personificação do objeto com voz de IA." },
    { id: "storytelling", label: "Mini-história", desc: "Um arco simples de problema e solução." },
];

const steps = ["Objeto", "Estilo", "Conteúdo", "Revisão"];

export default function ViralSyncPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        category: "",
        object: "",
        customObject: "",
        style: "",
        hook: "",
        message: "",
        cta: "",
        restrictions: "",
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{ script: string; hashtags: string[] } | null>(null);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const generateViral = async () => {
        setIsGenerating(true);
        setProgress(0);

        // Simulating AI Generation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + Math.random() * 10;
            });
        }, 300);

        await new Promise(r => setTimeout(r, 4000));

        const generatedScript = `[GANCHO]: Você não vai acreditar o que esse(a) ${formData.customObject || formData.object} acabou de fazer!\n\n[CONTEÚDO]: Sabe aquele momento que você acha que tudo deu errado? Pois é, o ${formData.customObject || formData.object} resolveu o problema em segundos.\n\n[CTA]: Não perca tempo, clique no link da bio e garanta o seu agora!`;

        setResult({
            script: generatedScript,
            hashtags: ["#tiktokshop", "#viral", "#achadinhos", "#unboxing", "#utilidades"],
        });

        setIsGenerating(false);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#FE2C55", "#000000", "#FFFFFF"]
        });
        toast.success("Viral gerado com sucesso! ✨");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência!");
    };

    return (
        <div className="space-y-8 animate-fade-in relative z-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/5 text-white/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/10">
                            Viral Boost Ativado
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        VIRAL SYNC 🚀
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        Crie prompts virais e roteiros que prendem a atenção para bombar no TikTok.
                    </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-full">
                    {steps.map((step, idx) => (
                        <button
                            key={step}
                            onClick={() => idx <= currentStep && setCurrentStep(idx)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                                currentStep === idx
                                    ? "bg-[#FE2C55] text-white shadow-lg"
                                    : idx < currentStep
                                        ? "text-white/60 hover:text-white"
                                        : "text-white/20 cursor-not-allowed"
                            )}
                        >
                            {idx + 1}. {step}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    {/* Step 1: Objeto */}
                    {currentStep === 0 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-[#FE2C55]" />
                                    Escolha a Categoria
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFormData({ ...formData, category: cat.id, object: "" })}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 rounded-[30px] border-2 transition-all gap-3",
                                                formData.category === cat.id
                                                    ? "bg-[#FE2C55]/10 border-[#FE2C55] text-white shadow-[0_0_20px_rgba(254,44,85,0.2)]"
                                                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                            )}
                                        >
                                            <span className="text-3xl">{cat.icon}</span>
                                            <span className="text-sm font-bold">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.category && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Search className="h-5 w-5 text-[#FE2C55]" />
                                        Escolha o Objeto
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {objectsByCategory[formData.category]?.map((obj) => (
                                            <button
                                                key={obj}
                                                onClick={() => setFormData({ ...formData, object: obj, customObject: "" })}
                                                className={cn(
                                                    "px-4 py-3 rounded-2xl border text-sm font-bold transition-all text-center",
                                                    formData.object === obj
                                                        ? "bg-white text-black border-white"
                                                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                                                )}
                                            >
                                                {obj}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-4">
                                        <Label className="text-xs text-white/40 font-bold uppercase mb-2 block">Ou defina um objeto personalizado</Label>
                                        <Input
                                            placeholder="Ex: Luminária de Astronauta"
                                            value={formData.customObject}
                                            onChange={(e) => setFormData({ ...formData, customObject: e.target.value, object: "" })}
                                            className="bg-black/40 border-white/10 h-12 rounded-2xl text-white font-bold"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Estilo */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-[#FE2C55]" />
                                Estilo Viral
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {viralStyles.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setFormData({ ...formData, style: style.id })}
                                        className={cn(
                                            "flex flex-col p-6 rounded-[30px] border-2 transition-all gap-1 text-left",
                                            formData.style === style.id
                                                ? "bg-[#FE2C55]/10 border-[#FE2C55] text-white shadow-[0_0_20px_rgba(254,44,85,0.2)]"
                                                : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                        )}
                                    >
                                        <span className="text-lg font-black text-white italic">{style.label}</span>
                                        <span className="text-xs text-white/60">{style.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Conteúdo */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-[#FE2C55]" />
                                Estrutura do Vídeo
                            </h3>
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-white/40 uppercase">Chamada de Impacto (Hook)</Label>
                                    <Input
                                        value={formData.hook}
                                        onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
                                        placeholder="Ex: Você nunca viu nada igual..."
                                        className="bg-black/40 border-white/10 h-12 rounded-2xl text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-white/40 uppercase">Mensagem Principal</Label>
                                    <Textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="O que o objeto resolve?"
                                        className="bg-black/40 border-white/10 rounded-2xl text-white min-h-[100px]"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-white/40 uppercase">Chamada para Ação (CTA)</Label>
                                        <Input
                                            value={formData.cta}
                                            onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                                            placeholder="Ex: Clique no link da bio!"
                                            className="bg-black/40 border-white/10 h-12 rounded-2xl text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-white/40 uppercase">Restrições/Notas</Label>
                                        <Input
                                            value={formData.restrictions}
                                            onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                                            placeholder="Ex: Sem falar marcas"
                                            className="bg-black/40 border-white/10 h-12 rounded-2xl text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Revisão */}
                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            {!result && (
                                <>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <History className="h-5 w-5 text-white" />
                                        Revisão do Viral
                                    </h3>
                                    <div className="grid gap-3">
                                        {[
                                            { label: "Objeto", value: formData.customObject || formData.object || "Não definido" },
                                            { label: "Estilo", value: viralStyles.find(s => s.id === formData.style)?.label || "Não definido" },
                                            { label: "Hook", value: formData.hook || "Padrão" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                                                <div>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight">{item.label}</p>
                                                    <p className="text-sm font-bold text-white">{item.value}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-white/20 hover:text-white" onClick={() => setCurrentStep(i)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {!isGenerating ? (
                                        <Button
                                            onClick={generateViral}
                                            disabled={!formData.category || (!formData.object && !formData.customObject)}
                                            className="w-full h-16 text-xl font-black italic bg-[#FE2C55] text-white rounded-2xl shadow-[0_0_30px_rgba(254,44,85,0.3)] hover:scale-[1.02] transition-transform"
                                        >
                                            GERAR VIRAL AGORA ⚡
                                        </Button>
                                    ) : (
                                        <div className="space-y-6 py-4 text-center">
                                            <div className="relative w-20 h-20 mx-auto">
                                                <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                                                <div className="absolute inset-0 border-4 border-[#FE2C55] rounded-full border-t-transparent animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Rocket className="h-8 w-8 text-[#FE2C55] animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-black text-white italic">GERANDO: {Math.round(progress)}%</h4>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#FE2C55] transition-all duration-300" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {result && (
                                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                                    <div className="p-6 bg-black border border-[#FE2C55]/30 rounded-[32px] space-y-4 relative">
                                        <div className="absolute -top-3 -right-3 bg-[#FE2C55] p-2 rounded-xl text-white">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <Label className="text-xs font-bold text-[#FE2C55] uppercase tracking-widest">Roteiro / Prompt IA</Label>
                                        <div className="text-sm text-white leading-relaxed whitespace-pre-wrap font-medium">
                                            {result.script}
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="bg-white/10 hover:bg-white/20 text-white rounded-xl gap-2 h-10 px-4"
                                                onClick={() => copyToClipboard(result.script)}
                                            >
                                                <Copy className="h-4 w-4" /> Copiar Tudo
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white rounded-xl gap-2 h-10 px-4 ml-auto"
                                                asChild
                                            >
                                                <a href="https://labs.google/fx/pt/tools/flow" target="_blank" rel="noopener noreferrer">
                                                    Abrir Flow <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-white/40 uppercase tracking-widest">Hashtags Recomendadas</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {result.hashtags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => copyToClipboard(tag)}
                                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/80 hover:bg-white/10 transition-colors"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="w-full text-white/40 hover:text-white gap-2 mt-4"
                                        onClick={() => {
                                            setResult(null);
                                            setCurrentStep(0);
                                        }}
                                    >
                                        <RefreshCw className="h-4 w-4" /> Criar outro Viral
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Persistent Footer Navigation */}
                    {!result && !isGenerating && (
                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                            <Button
                                variant="ghost"
                                disabled={currentStep === 0}
                                onClick={handleBack}
                                className="text-white/40 hover:text-white gap-2 font-bold uppercase text-xs"
                            >
                                <ChevronLeft className="h-4 w-4" /> Voltar
                            </Button>

                            <div className="flex gap-1">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1 transition-all rounded-full",
                                            i === currentStep ? "w-8 bg-[#FE2C55]" : "w-1 bg-white/20"
                                        )}
                                    />
                                ))}
                            </div>

                            {currentStep < steps.length - 1 ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={
                                        (currentStep === 0 && !formData.category && !formData.object && !formData.customObject) ||
                                        (currentStep === 1 && !formData.style)
                                    }
                                    className="bg-white text-black hover:bg-white/90 font-bold uppercase text-xs px-8 rounded-full h-10 shadow-lg"
                                >
                                    Próximo <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <div className="w-[100px]" /> /* spacer */
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
