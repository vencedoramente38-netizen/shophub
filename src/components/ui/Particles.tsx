import React, { useEffect, useRef } from "react";

interface ParticlesProps {
    className?: string;
    quantity?: number;
    staticity?: number;
    ease?: number;
    refresh?: boolean;
}

export default function Particles({
    className = "",
    quantity = 30,
    staticity = 50,
    ease = 50,
    refresh = false,
}: ParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const particles = useRef<any[]>([]);
    const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

    useEffect(() => {
        if (canvasRef.current) {
            context.current = canvasRef.current.getContext("2d");
        }
        initCanvas();
        animate();
        window.addEventListener("resize", initCanvas);

        return () => {
            window.removeEventListener("resize", initCanvas);
        };
    }, []);

    useEffect(() => {
        initCanvas();
    }, [refresh]);

    const onMouseMove = (e: MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const { clientX, clientY } = e;
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            mouse.current.x = x * dpr;
            mouse.current.y = y * dpr;
        }
    };

    const initCanvas = () => {
        resizeCanvas();
        drawParticles();
    };

    const resizeCanvas = () => {
        if (containerRef.current && canvasRef.current && context.current) {
            particles.current = [];
            canvasSize.current.w = containerRef.current.offsetWidth;
            canvasSize.current.h = containerRef.current.offsetHeight;
            canvasRef.current.width = canvasSize.current.w * dpr;
            canvasRef.current.height = canvasSize.current.h * dpr;
            canvasRef.current.style.width = `${canvasSize.current.w}px`;
            canvasRef.current.style.height = `${canvasSize.current.h}px`;
            context.current.scale(dpr, dpr);
        }
    };

    const createParticle = () => {
        const x = Math.random() * canvasSize.current.w;
        const y = Math.random() * canvasSize.current.h;
        const translateX = 0;
        const translateY = 0;
        const size = Math.floor(Math.random() * 2) + 0.1;
        const alpha = 0;
        const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
        const dx = (Math.random() - 0.5) * 0.1;
        const dy = (Math.random() - 0.5) * 0.1;
        const magnetism = 0.1 + Math.random() * 4;
        return {
            x,
            y,
            translateX,
            translateY,
            size,
            alpha,
            targetAlpha,
            dx,
            dy,
            magnetism,
        };
    };

    const drawParticles = () => {
        for (let i = 0; i < quantity; i++) {
            particles.current.push(createParticle());
        }
    };

    const drawParticle = (particle: any, move = false) => {
        if (context.current) {
            const { x, y, translateX, translateY, size, alpha } = particle;
            context.current.translate(translateX, translateY);
            context.current.beginPath();
            context.current.arc(x, y, size, 0, 2 * Math.PI);
            context.current.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            context.current.fill();
            context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (!move) {
                return;
            }

            particle.x += particle.dx + (mouse.current.x / staticity - particle.x) / ease;
            particle.y += particle.dy + (mouse.current.y / staticity - particle.y) / ease;

            if (particle.alpha < particle.targetAlpha) {
                particle.alpha += 0.02;
            }

            if (
                particle.x < -particle.size ||
                particle.x > canvasSize.current.w + particle.size ||
                particle.y < -particle.size ||
                particle.y > canvasSize.current.h + particle.size
            ) {
                Object.assign(particle, createParticle());
            }
        }
    };

    const animate = () => {
        if (context.current) {
            context.current.clearRect(
                0,
                0,
                canvasSize.current.w,
                canvasSize.current.h
            );
            particles.current.forEach((particle: any) => {
                drawParticle(particle, true);
            });
        }
        window.requestAnimationFrame(animate);
    };

    return (
        <div className={className} ref={containerRef} aria-hidden="true" onMouseMove={(e: any) => onMouseMove(e)}>
            <canvas ref={canvasRef} />
        </div>
    );
}
