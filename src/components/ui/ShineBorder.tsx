import { cn } from "@/lib/utils";
import React from "react";

interface ShineBorderProps {
    borderRadius?: number;
    borderWidth?: number;
    duration?: number;
    color?: string | string[];
    className?: string;
    children: React.ReactNode;
}

export default function ShineBorder({
    borderRadius = 16,
    borderWidth = 1,
    duration = 10,
    color = "#fff",
    className,
    children,
}: ShineBorderProps) {
    return (
        <div
            style={
                {
                    "--border-radius": `${borderRadius}px`,
                    "--border-width": `${borderWidth}px`,
                    "--duration": `${duration}s`,
                    "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                    "--background-radial-gradient": `radial-gradient(transparent,transparent, ${Array.isArray(color) ? color.join(",") : color
                        },transparent,transparent)`,
                } as React.CSSProperties
            }
            className={cn(
                "relative min-h-[50px] w-fit min-w-[300px] place-items-center rounded-[var(--border-radius)] bg-white/5 p-[var(--border-width)] text-black dark:bg-black dark:text-white",
                className,
            )}
        >
            <div
                className={cn(
                    "before:bg-shine-size before:absolute before:inset-0 before:size-full before:rounded-[inherit] before:p-[var(--border-width)] before:will-change-[background-position] before:content-[''] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:var(--background-radial-gradient)] before:[background-size:300%_300%] before:[mask:var(--mask-linear-gradient)] motion-safe:before:animate-shine",
                )}
            ></div>
            <div className="relative z-10 w-full rounded-[calc(var(--border-radius)-var(--border-width))] bg-card">
                {children}
            </div>
        </div>
    );
}
