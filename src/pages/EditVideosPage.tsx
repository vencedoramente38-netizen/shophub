import { useState, useRef, useEffect } from "react";
import {
  Check, ChevronRight, ChevronLeft, Upload, Play, Pause,
  Trash2, Type, Move, Maximize, Smartphone, ShieldCheck,
  Zap, Download, Clock, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Iphone } from "@/components/ui/iphone";
import confetti from "canvas-confetti";

// ── Types ──
interface TextOverlay {
  id: string;
  text: string;
  size: number;
  color: string;
  bgColor: string;
  bold: boolean;
  italic: boolean;
  fontFamily: string;
  hasBorder: boolean;
  hasBackground: boolean;
  position: "top" | "center" | "bottom";
}


interface framingConfig {
  x: number;
  y: number;
  scale: number;
  borderRadius: number;
}

const steps = ["Upload", "Área", "Texto", "Download"];

const colorPalette = ["#ffffff", "#000000", "#FE2C55", "#111111", "#FFFC00", "#FF6600", "#00FF88", "#FF00FF"];

const areaPresets = [
  { name: "Tela Cheia", x: 0, y: 0, scale: 1, borderRadius: 0 },
  { name: "Centro", x: 0, y: 0, scale: 1.5, borderRadius: 36 },
  { name: "Topo", x: 0, y: -200, scale: 1.5, borderRadius: 36 },
  { name: "Base", x: 0, y: 200, scale: 1.5, borderRadius: 36 },
  { name: "Quadrado", x: 0, y: 0, scale: 1.2, borderRadius: 0 },
];



export default function EditVideosPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // framing state
  const [framing, setframing] = useState<framingConfig>({
    x: 0,
    y: 0,
    scale: 1,
    borderRadius: 24,
  });

  // Text overlays state
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      toast.success("Vídeo carregado com sucesso!");
      setCurrentStep(1); // Auto advance to area
    }
  };

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      text: "NOVO TEXTO 📱",
      size: 32,
      color: "#ffffff",
      bgColor: "#FE2C55",
      bold: true,
      italic: false,
      fontFamily: "Poppins",
      hasBorder: false,
      hasBackground: true,
      position: "center",
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
    toast.success("Texto adicionado!");
  };


  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(textOverlays.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(o => o.id !== id));
  };

  const startExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 400);

    await new Promise(r => setTimeout(r, 6000));

    setIsExporting(false);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FE2C55", "#ffffff", "#000000"]
    });
    toast.success("Vídeo exportado e baixado! 🎉");

    // Simulate download
    const link = document.createElement("a");
    link.href = videoUrl || "";
    link.download = "spy-video.mp4";
    link.click();
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-20">
      {/* Header Rebrand */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full tracking-widest border border-primary/30 shadow-[0_0_10px_rgba(254,44,85,0.2)]">
              Processamento Local • Sem Armazenamento
            </span>
            <span className="text-white/40 text-[10px] font-medium tracking-widest flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> 100% Privacy
            </span>
          </div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            Sync Editor 📱✨
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm font-medium">
            Otimize seus vídeos para o TikTok Shop com enquadramento e legendas de alta conversão.
          </p>

        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl shadow-inner">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black tracking-tighter transition-all duration-300 flex items-center gap-2",
                  currentStep === idx
                    ? "bg-primary text-white shadow-[0_0_20px_rgba(254,44,85,0.4)] scale-105"
                    : idx < currentStep
                      ? "text-primary hover:bg-primary/10"
                      : "text-white/20 cursor-not-allowed"
                )}

              >
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px]",
                  currentStep === idx ? "border-white/40 bg-white/20" : "border-current"
                )}>
                  {idx + 1}
                </span>
                {step}
              </button>
              {idx < steps.length - 1 && <ChevronRight className="h-4 w-4 text-white/10 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Preview Area (Left - col-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative group mx-auto flex justify-center">
            {/* iPhone Mockup Container */}
            {/* iPhone Mockup Container */}
            <div className="w-[340px] mx-auto">
              <Iphone className="shadow-[0_0_50px_rgba(0,0,0,0.5),0_0_20px_rgba(254,44,85,0.1)]">
                {videoUrl ? (
                  <div className="w-full h-full relative">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="absolute transition-transform duration-200"
                      style={{
                        transform: `translate(${framing.x}px, ${framing.y}px) scale(${framing.scale})`,
                        borderRadius: `${framing.borderRadius}px`,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                      loop
                      muted
                      autoPlay
                    />

                    {/* Overlays Rendering */}
                    <div className="absolute inset-0 pointer-events-none z-30">
                      {textOverlays.map((o) => (
                        <div
                          key={o.id}
                          className="absolute left-1/2 -translate-x-1/2 px-4 py-2 text-center transition-all duration-300"
                          style={{
                            top: o.position === "top" ? "15%" : o.position === "center" ? "50%" : "85%",
                            transform: "translate(-50%, -50%)",
                            color: o.color,
                            backgroundColor: o.hasBackground ? o.bgColor : "transparent",
                            border: o.hasBorder ? `2px solid ${o.color}` : "none",
                            fontSize: `${o.size}px`,
                            fontFamily: o.fontFamily,
                            fontWeight: o.bold ? "900" : "400",
                            fontStyle: o.italic ? "italic" : "normal",
                            borderRadius: "8px",
                            boxShadow: o.hasBackground ? "0 4px 15px rgba(0,0,0,0.4)" : "none",
                            textShadow: !o.hasBackground ? "0 2px 10px rgba(0,0,0,0.8)" : "none",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {o.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 bg-[#050505]">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-white/20" />
                    </div>
                    <p className="text-white/40 text-xs font-bold tracking-widest">Aguardando vídeo...</p>
                  </div>

                )}
              </Iphone>
            </div>
          </div>
        </div>

        {/* Controls Area (Right - col-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 min-h-[500px] shadow-2xl backdrop-blur-sm">

            {/* STEP 1: UPLOAD */}
            {currentStep === 0 && (
              <div className="space-y-6 h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4">
                <div className="text-center space-y-2 mb-4">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter">Importar Criativo</h3>
                  <p className="text-sm text-muted-foreground font-medium">Selecione seu minerado para começar a edição de alta performance.</p>
                </div>

                <label className="group relative flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-white/10 bg-black/40 transition-all hover:bg-primary/5 hover:border-primary/50 overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="z-10 bg-primary/10 p-6 rounded-full group-hover:scale-110 transition-transform duration-500 mb-4 border border-primary/20">
                    <Upload className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(254,44,85,0.5)]" />
                  </div>
                  <span className="z-10 text-lg font-black text-white mb-1 group-hover:text-primary transition-colors">Arraste seu vídeo aqui</span>
                  <p className="z-10 text-xs font-bold text-white/40 tracking-widest">Clique para selecionar do computador</p>

                  <div className="mt-8 flex gap-3 z-10">
                    {["MP4", "MOV", "WEBM", "AVI"].map(ext => (
                      <span key={ext} className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded text-white/30">{ext}</span>
                    ))}
                  </div>
                  <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <ShieldCheck className="h-5 w-5 text-white/40" />
                  <p className="text-[11px] text-white/50 leading-tight">O vídeo será processado localmente no seu navegador. Privacidade total para seus minerados.</p>
                </div>
              </div>
            )}

            {/* STEP 2: ÁREA */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-primary" />
                      Enquadramento
                    </h3>
                    <p className="text-[10px] text-white/40 font-bold tracking-widest">Canvas Final: 1080x1920</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black text-white/40 border border-white/5 hover:bg-white/5" onClick={() => setframing({ x: 0, y: 0, scale: 1, borderRadius: 0 })}>
                    Resetar
                  </Button>
                </div>


                {/* Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {areaPresets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => setframing({ ...preset })}
                      className="group relative flex flex-col items-center justify-center p-3 h-20 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                    >
                      <div className="text-[10px] font-black tracking-tighter text-white/40 group-hover:text-primary mb-1">{preset.name}</div>
                      <div className="w-8 h-10 border border-white/20 rounded-sm relative overflow-hidden bg-black/40">

                        {preset.name === "Tela Cheia" && <div className="absolute inset-0 bg-primary/20" />}
                        {preset.name === "Centro" && <div className="absolute inset-2 bg-primary/20 rounded-sm" />}
                        {preset.name === "Topo" && <div className="absolute inset-x-2 top-2 h-4 bg-primary/20 rounded-sm" />}
                        {preset.name === "Base" && <div className="absolute inset-x-2 bottom-2 h-4 bg-primary/20 rounded-sm" />}
                        {preset.name === "Quadrado" && <div className="absolute inset-1 aspect-square bg-primary/20 rounded-sm mx-auto" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-6 bg-black/40 border border-white/10 p-5 rounded-[32px]">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <Label className="text-[10px] text-white/40 font-black tracking-widest">Zoom / Escala</Label>
                      <span className="text-sm font-black text-primary italic">{Math.round(framing.scale * 100)}%</span>
                    </div>
                    <Slider
                      value={[framing.scale]}
                      min={0.5} max={3} step={0.01}
                      onValueChange={([v]) => setframing(p => ({ ...p, scale: v }))}
                      className="[&>span>span]:bg-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <Label className="text-[10px] text-white/40 font-black tracking-widest">Bordas Arredondadas</Label>
                      <span className="text-sm font-black text-white">{framing.borderRadius}px</span>
                    </div>

                    <Slider
                      value={[framing.borderRadius]}
                      min={0} max={100} step={1}
                      onValueChange={([v]) => setframing(p => ({ ...p, borderRadius: v }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-white/40 font-black tracking-widest">Eixo X (Lateral)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={Math.round(framing.x)}
                          onChange={(e) => setframing(p => ({ ...p, x: Number(e.target.value) }))}
                          className="bg-black/60 border-white/10 h-11 rounded-xl font-black text-white px-4 border-l-4 border-l-primary"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20">PX</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-white/40 font-black tracking-widest">Eixo Y (Altura)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={Math.round(framing.y)}
                          onChange={(e) => setframing(p => ({ ...p, y: Number(e.target.value) }))}
                          className="bg-black/60 border-white/10 h-11 rounded-xl font-black text-white px-4 border-l-4 border-l-primary shadow-inner"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20">PX</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}


            {/* STEP 3: TEXTO */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary" />
                    Caixas de Texto
                  </h3>
                  <Button size="sm" className="h-9 bg-primary hover:bg-primary/90 text-white font-black text-[10px] rounded-full px-5 shadow-[0_0_15px_rgba(254,44,85,0.3)] border-b-4 border-b-black/20 active:border-b-0 active:translate-y-1 transition-all" onClick={addTextOverlay}>
                    Adicionar +
                  </Button>
                </div>


                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 mb-4">
                  <div className="flex -space-x-2">
                    {textOverlays.map((o, i) => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOverlayId(o.id)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all",
                          selectedOverlayId === o.id ? "bg-primary border-white scale-110 z-10" : "bg-black/60 border-white/20 text-white/40 hover:text-white"
                        )}
                      >
                        #{i + 1}
                      </button>
                    ))}
                  </div>
                  {textOverlays.length === 0 && <span className="text-[10px] text-white/20 font-black uppercase tracking-widest pl-2">Nenhum texto adicionado</span>}
                </div>

                {selectedOverlayId && textOverlays.find(o => o.id === selectedOverlayId) && (
                  <div className="space-y-6 bg-black/40 border border-white/10 p-5 rounded-[32px] animate-in zoom-in-95">
                    {/* Header Item */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Editando Texto #{textOverlays.findIndex(o => o.id === selectedOverlayId) + 1}</span>
                      <button onClick={() => deleteOverlay(selectedOverlayId)} className="text-white/20 hover:text-primary transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-white/40 font-black uppercase tracking-widest">CONTEÚDO</Label>
                        <Input
                          value={textOverlays.find(o => o.id === selectedOverlayId)?.text}
                          onChange={(e) => updateOverlay(selectedOverlayId, { text: e.target.value })}
                          className="bg-black/60 border-white/10 h-11 rounded-xl font-bold text-white px-4 border-l-4 border-l-primary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] text-white/40 font-black uppercase tracking-widest">TIPOGRAFIA</Label>
                          <select
                            value={textOverlays.find(o => o.id === selectedOverlayId)?.fontFamily}
                            onChange={(e) => updateOverlay(selectedOverlayId, { fontFamily: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 h-11 rounded-xl font-bold text-white px-3 flex items-center"
                          >
                            <option value="Poppins">Poppins (Padrão)</option>
                            <option value="Inter">Inter</option>
                            <option value="Arial Black">Impact Style</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] text-white/40 font-black uppercase tracking-widest">PALETA</Label>
                          <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
                            {colorPalette.slice(0, 5).map(c => (
                              <button
                                key={c}
                                onClick={() => updateOverlay(selectedOverlayId, { color: c })}
                                className={cn(
                                  "h-6 w-6 rounded-full border-2 transition-transform",
                                  textOverlays.find(o => o.id === selectedOverlayId)?.color === c ? "border-white scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <Label className="text-[10px] text-white/40 font-black uppercase tracking-widest">TAMANHO DO TEXTO</Label>
                          <span className="text-sm font-black text-primary italic">{textOverlays.find(o => o.id === selectedOverlayId)?.size}PX</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-primary to-yellow-400 rounded-full opacity-30" />
                          <Slider
                            value={[textOverlays.find(o => o.id === selectedOverlayId)?.size || 24]}
                            min={12} max={100} step={1}
                            onValueChange={([v]) => updateOverlay(selectedOverlayId, { size: v })}
                            className="relative z-10 [&>span>span]:bg-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: "top", label: "TOPO" },
                          { val: "center", label: "CENTRO" },
                          { val: "bottom", label: "BASE" }
                        ].map(pos => (
                          <button
                            key={pos.val}
                            onClick={() => updateOverlay(selectedOverlayId, { position: pos.val as TextOverlay["position"] })}
                            className={cn(
                              "h-10 rounded-xl border font-black text-[10px] transition-all",
                              textOverlays.find(o => o.id === selectedOverlayId)?.position === pos.val
                                ? "bg-primary border-primary text-white shadow-lg"
                                : "bg-black/40 border-white/10 text-white/40 hover:text-white"
                            )}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateOverlay(selectedOverlayId, { hasBackground: !textOverlays.find(o => o.id === selectedOverlayId)?.hasBackground })}
                          className={cn(
                            "flex-1 h-10 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black transition-all",
                            textOverlays.find(o => o.id === selectedOverlayId)?.hasBackground ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/5 text-white/20"
                          )}
                        >
                          <div className={cn("w-3 h-3 rounded-sm border", textOverlays.find(o => o.id === selectedOverlayId)?.hasBackground ? "bg-primary border-primary" : "border-white/20")} />
                          FUNDO
                        </button>
                        <button
                          onClick={() => updateOverlay(selectedOverlayId, { hasBorder: !textOverlays.find(o => o.id === selectedOverlayId)?.hasBorder })}
                          className={cn(
                            "flex-1 h-10 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black transition-all",
                            textOverlays.find(o => o.id === selectedOverlayId)?.hasBorder ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/5 text-white/20"
                          )}
                        >
                          <div className={cn("w-3 h-3 rounded-sm border", textOverlays.find(o => o.id === selectedOverlayId)?.hasBorder ? "bg-primary border-primary" : "border-white/20")} />
                          BORDA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {textOverlays.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[40px] bg-black/20">
                    <Type className="h-10 w-10 text-white/10 mb-4" />
                    <p className="text-[10px] text-white/20 font-black tracking-widest text-center px-10">Nenhum texto adicionado ainda. Clique em adicionar para começar.</p>
                  </div>
                )}

              </div>
            )}


            {/* STEP 4: EXPORT */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="text-center space-y-2 mb-4">
                  <h3 className="text-3xl font-black text-white italic tracking-tighter">Pronto para Viralizar! 🚀</h3>
                  <p className="text-sm text-muted-foreground font-medium">Seu criativo foi otimizado para retenção máxima.</p>
                </div>


                {!isExporting ? (
                  <div className="space-y-6">
                    <ShimmerButton
                      className="w-full h-20 text-2xl font-black italic bg-primary text-white shadow-[0_0_30px_rgba(254,44,85,0.4)] border-b-8 border-b-black/20"
                      onClick={startExport}
                    >
                      DOWNLOAD AGORA ⚡
                    </ShimmerButton>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: ShieldCheck, title: "100% Privado", desc: "Local Processing", color: "text-white/40" },
                        { icon: Zap, title: "Alta Qualidade", desc: "60 FPS Export", color: "text-primary" },
                        { icon: Smartphone, title: "TikTok Native", desc: "9:16 Aspect Ratio", color: "text-cyan-400" },
                        { icon: Check, title: "Captions Ready", desc: "Dynamic Overlays", color: "text-green-400" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
                          <item.icon className={cn("h-6 w-6", item.color)} />
                          <div>
                            <p className="text-xs font-black text-white">{item.title}</p>
                            <p className="text-[9px] text-white/30 font-black tracking-tight">{item.desc}</p>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 py-10 text-center bg-black/20 rounded-[40px] border border-white/5 px-6">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 border-8 border-white/5 rounded-full" />
                      <div className="absolute inset-0 border-8 border-primary rounded-full border-t-transparent animate-spin shadow-[0_0_20px_rgba(254,44,85,0.4)]" />
                      <div className="absolute inset-0 flex items-center justify-center font-black text-xl italic text-white animate-pulse">
                        {Math.round(exportProgress)}%
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-white italic tracking-tighter">Processando...</h4>
                        <p className="text-[10px] text-white/40 font-black tracking-widest italic animate-pulse">Não feche esta aba durante o download automático</p>
                      </div>
                      <Progress value={exportProgress} className="h-4 bg-white/5 px-1 [&>div]:bg-primary rounded-full border border-white/10" />
                    </div>

                  </div>
                )}
              </div>
            )}


          </div>

          {/* Navigation Controls */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={currentStep === 0 || isExporting}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white font-bold hover:bg-white/10"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <Button
              disabled={!videoUrl || currentStep === steps.length - 1 || isExporting}
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-[2] h-14 rounded-2xl bg-white text-black font-black hover:bg-white/90"
            >
              Próximo Passo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
}
