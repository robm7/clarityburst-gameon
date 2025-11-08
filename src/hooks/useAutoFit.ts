import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoFit(opts?: {
  min?: number; max?: number; step?: number; paddingPx?: number;
}) {
  const { min = 0.80, max = 1.0, step = 0.02, paddingPx = 8 } = opts || {};
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef   = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const fit = useCallback(() => {
    const container = containerRef.current;
    const content   = contentRef.current;
    if (!container || !content) return;

    // Reset scale before measuring
    content.style.transform = "scale(1)";
    content.style.transformOrigin = "top center";

    const containerH = container.clientHeight - paddingPx;
    const contentH   = content.scrollHeight;

    if (contentH <= containerH) { setScale(1); return; }

    const raw = containerH / contentH;
    const clamped = Math.max(min, Math.min(max, raw));
    const quantized = Math.floor(clamped / step) * step;
    setScale(quantized);
  }, [min, max, step, paddingPx]);

  useEffect(() => {
    fit();

    // Observe size
    const ro = new ResizeObserver(() => fit());
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);

    // Observe DOM changes (e.g., images added)
    const mo = new MutationObserver(() => fit());
    if (contentRef.current) mo.observe(contentRef.current, { childList: true, subtree: true });

    // Refit on image loads within content
    const imgs = Array.from(contentRef.current?.querySelectorAll?.("img") ?? []);
    const imgHandlers: Array<() => void> = [];
    imgs.forEach((img) => {
      const handler = () => fit();
      img.addEventListener("load", handler);
      imgHandlers.push(() => img.removeEventListener("load", handler));
    });

    // Refit when fonts are ready
    let fontsCancelled = false;
    // FontFaceSet is available in modern browsers
    interface FontFaceSet extends EventTarget {
      ready: Promise<FontFaceSet>;
    }
    
    if (document.fonts) {
      const fontFaceSet = document.fonts as FontFaceSet;
      if (fontFaceSet.ready) {
        fontFaceSet.ready.then(() => { if (!fontsCancelled) fit(); });
      }
    }

    // Fallback after next frame to catch late content
    const t = window.setTimeout(() => fit(), 200);

    return () => {
      ro.disconnect();
      mo.disconnect();
      imgHandlers.forEach((off) => off());
      fontsCancelled = true;
      window.clearTimeout(t);
    };
  }, [fit]);

  return { containerRef, contentRef, scale };
}