import React from "react";
import { cn } from "@/lib/utils";

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export function RainbowButton({ children, className, ...props }: RainbowButtonProps) {
    return (
        <button
            className={cn(
                "group relative inline-flex h-11 items-center justify-center rounded-xl px-8 py-2 font-medium text-white transition-all active:scale-95 overflow-hidden",
                className
            )}
            {...props}
        >
            <span className="absolute inset-x-0 bottom-0 h-full w-full bg-gradient-to-tr from-[#fe2c55] via-[#a855f7] to-[#06b6d4] transition-all group-hover:scale-110 group-active:scale-95"></span>
            <span className="relative z-10">{children}</span>
            <style>{`
          @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .rainbow-bg {
            background-size: 200% 200%;
            animation: rainbow 3s linear infinite;
          }
        `}</style>
        </button>
    );
}
