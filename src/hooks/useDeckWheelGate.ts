import { useEffect, useRef } from "react";

type Options = {
  onStep: (direction: 1 | -1) => void; // advance deck +1 / -1 slide
  targetRef: React.RefObject<HTMLElement>; // deck scroller element
  pixelThresholdPx?: number; // for rare pixel-mode wheels, default 50
  cooldownMs?: number;       // notch cooldown, default 280
};

export function useDeckWheelGate({
  onStep,
  targetRef,
  pixelThresholdPx = 50,
  cooldownMs = 280,
}: Options) {
  const accRef = useRef(0);
  const cooldownRef = useRef(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If inner scrollers handled it, propagation would already be stopped.
      if (cooldownRef.current) {
        e.preventDefault();
        return;
      }

      // Mouse wheel usually reports deltaMode === 1 (lines).
      if (e.deltaMode === 1) {
        e.preventDefault();
        const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
        onStep(dir);
        cooldownRef.current = true;
        window.setTimeout(() => (cooldownRef.current = false), cooldownMs);
        return;
      }

      // Fallback for pixel-mode wheels (rare on mice)
      accRef.current += e.deltaY;
      const abs = Math.abs(accRef.current);
      if (abs >= pixelThresholdPx) {
        e.preventDefault();
        const dir: 1 | -1 = accRef.current > 0 ? 1 : -1;
        accRef.current = 0;
        onStep(dir);
        cooldownRef.current = true;
        window.setTimeout(() => (cooldownRef.current = false), cooldownMs);
      } else {
        // Prevent tiny micro-scrolls between thresholds
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as EventListener);
  }, [onStep, targetRef, pixelThresholdPx, cooldownMs]);
}