import React from "react";
import { useAutoFit } from "@/hooks/useAutoFit";

export default function AutoFitSlide({
  id,
  className = "",
  contentClassName = "",
  minScale = 0.80,
  children,
}: {
  id: string;
  className?: string;
  contentClassName?: string;
  minScale?: number;
  children: React.ReactNode;
}) {
  const { containerRef, contentRef, scale } = useAutoFit({ min: minScale, paddingPx: 8 });

  return (
    <section
      id={id}
      className={`snap-section snap-start snap-always h-[100svh] overflow-hidden ${className}`}
      role="group"
      aria-roledescription="slide"
    >
      <div ref={containerRef} className="h-full w-full relative">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[min(1100px,92vw)] px-6 md:px-10 pt-4 pb-6"
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        >
          <div
            ref={contentRef}
            className={`isolate relative [contain:layout_paint] space-y-5 md:space-y-6 ${contentClassName}`}
          >
            {/* Prevent margin collapse and keep predictable flow */}
            <div className="[&_*]:max-w-full [&_img]:block [&_img]:h-auto [&_img]:rounded-xl [&_img]:shadow-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}