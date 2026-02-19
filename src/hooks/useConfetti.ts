import confetti from "canvas-confetti";
import { useCallback } from "react";

export function useConfetti() {
  const fire = useCallback(() => {
    const colors = ["#FE2C55", "#000000", "#FFFFFF", "#FF0050", "#333333"];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 250);
  }, []);

  return { fire };
}
