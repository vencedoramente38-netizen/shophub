import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface NeonCardProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function NeonCard({ selected, onClick, children, className }: NeonCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-2xl border p-4 transition-all duration-200",
        selected
          ? "border-[#FE2C55] bg-[#FE2C55]/10 shadow-[0_0_15px_rgba(254,44,85,0.3)]"
          : "border-white/10 bg-card hover:border-white/20 hover:bg-white/5",
        className
      )}
    >
      {selected && (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FE2C55] text-white shadow-lg">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}
      {children}
    </div>
  );
}

interface NeonSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function NeonSection({ title, subtitle, children, className }: NeonSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
