import { useEffect } from "react";

export function useInnerScrollLock(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const canScroll = (deltaY: number) => {
      const atTop = el.scrollTop <= 0;
      const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
      if (deltaY < 0) return !atTop;     // up: can scroll if not at top
      if (deltaY > 0) return !atBottom;  // down: can scroll if not at bottom
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      const deltaY = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; // robust enough
      if (canScroll(deltaY)) {
        e.stopPropagation(); // let inner scroll proceed, don't bubble to deck
      } else {
        e.stopPropagation();
        e.preventDefault();  // block bounce from triggering deck
      }
    };

    let startY = 0;
    const onTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const deltaY = startY - e.touches[0].clientY;
      if (canScroll(deltaY)) {
        e.stopPropagation();
      } else {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel as EventListener);
      el.removeEventListener("touchstart", onTouchStart as EventListener);
      el.removeEventListener("touchmove", onTouchMove as EventListener);
    };
  }, [ref]);
}