import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

const tiktokColors = ["#FE2C55", "#FFFFFF"];

export const Meteors = ({ number = 20, className }: MeteorsProps) => {
  const meteorData = useMemo(() => {
    return Array.from({ length: number }, (_, idx) => ({
      color: tiktokColors[idx % tiktokColors.length],
      left: `${Math.floor(Math.random() * 100)}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${Math.floor(Math.random() * 8) + 4}s`,
    }));
  }, [number]);

  return (
    <>
      <style>{`
        ${meteorData.map((m, idx) => `
          .tiktok-meteor-${idx} {
            background-color: ${m.color};
          }
          .tiktok-meteor-${idx}::before {
            background: linear-gradient(to right, ${m.color}, transparent) !important;
          }
        `).join("")}
      `}</style>
      {meteorData.map((m, idx) => (
        <span
          key={idx}
          className={cn(
            `tiktok-meteor-${idx}`,
            "pointer-events-none absolute left-1/2 top-1/2 size-0.5 rotate-[215deg] animate-meteor rounded-full",
            "before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-primary before:to-transparent before:content-['']",
            className
          )}
          style={{
            top: 0,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </>
  );
};
