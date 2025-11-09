/* eslint-disable @typescript-eslint/no-unused-vars */

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeckWheelGate } from "@/hooks/useDeckWheelGate";
import AutoFitSlide from "@/components/AutoFitSlide";

export default function GameOn() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoInterval, setAutoInterval] = useState(8000);
  const [_summaryMode, setIsSummaryMode] = useState(false);

  const deckRef = useRef<HTMLDivElement>(null);

  const totalSlides = 17; // Updated to include split "Why Game On" slides

  // Parse URL parameters + deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const interval = params.get("interval");

    if (mode === "slideshow") {
      setIsAutoPlay(true);
      if (interval) setAutoInterval(parseInt(interval, 10));
    }
    if (mode === "summary") setIsSummaryMode(true);

    const hash = window.location.hash;
    if (hash) {
      const slideNum = parseInt(hash.replace("#s", ""), 10);
      if (slideNum >= 1 && slideNum <= totalSlides) {
        setCurrentSlide(slideNum);
        setTimeout(() => {
          document.getElementById(`s${slideNum}`)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev >= totalSlides ? 1 : prev + 1;
        document.getElementById(`s${next}`)?.scrollIntoView({ behavior: "smooth" });
        return next;
      });
    }, autoInterval);
    return () => clearInterval(timer);
  }, [isAutoPlay, autoInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIsAutoPlay(false);
        navigateToSlide(currentSlide + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setIsAutoPlay(false);
        navigateToSlide(currentSlide - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const handleMouseEnter = () => {
    if (isAutoPlay) setIsAutoPlay(false);
  };

  const navigateToSlide = (slideNum: number) => {
    if (slideNum < 1 || slideNum > totalSlides) return;
    setCurrentSlide(slideNum);
    document.getElementById(`s${slideNum}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrint = () => window.print();

  // Track current slide
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slideNum = parseInt(entry.target.id.replace("s", ""), 10);
            setCurrentSlide(slideNum);
          }
        });
      },
      { threshold: 0.5 }
    );

    for (let i = 1; i <= totalSlides; i++) {
      const el = document.getElementById(`s${i}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Use optimized wheel behavior for mouse
  useDeckWheelGate({
    onStep: (dir) => {
      setIsAutoPlay(false);
      navigateToSlide(currentSlide + dir);
    },
    targetRef: deckRef,
    cooldownMs: 280, // mouse-optimized cooldown
  });
  
  // Touch gesture handler (still needed for mobile)
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    let startY = 0;
    let isGestureLock = false;
    const TOUCH_LOCK_MS = 650;
    
    const onTouchStart = (e: TouchEvent) => {
      if (isGestureLock) return;
      startY = e.touches[0].clientY;
    };
    
    const onTouchEnd = (e: TouchEvent) => {
      if (isGestureLock) return;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dy) < 30) return; // ignore tiny swipes
      setIsAutoPlay(false);
      const dir = dy < 0 ? 1 : -1; // swipe up => next
      isGestureLock = true;
      navigateToSlide(currentSlide + dir);
      window.setTimeout(() => { isGestureLock = false; }, TOUCH_LOCK_MS);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart as EventListener);
      el.removeEventListener("touchend", onTouchEnd as EventListener);
    };
  }, [currentSlide]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };


  return (
    <div
      id="deck"
      ref={deckRef}
      className="relative bg-background text-foreground overscroll-contain deck-scroll no-bounce"
      onMouseEnter={handleMouseEnter}
      style={{
        height: "100svh",
        overflowY: "auto",
        scrollBehavior: "smooth",
      }}
    >
      {/* Progress Indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 print:hidden">
        {Array.from({ length: totalSlides }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => navigateToSlide(num)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === num ? "bg-primary scale-125 glow-blue" : "bg-muted/30 hover:bg-muted/50"
            }`}
            aria-label={`Go to slide ${num}`}
          />
        ))}
      </div>

      {/* Download PDF Button */}
      <div className="fixed top-6 right-6 z-50 print:hidden">
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Slide 1 */}
      <section id="s1" className="snap-section h-[100svh] flex flex-col items-center justify-center px-6 py-24 relative">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 1/{totalSlides}</div>
        <motion.div {...fadeInUp} className="text-center max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-glow">
            ClarityBurst<sup className="text-4xl">™</sup>
          </h1>
          <p className="text-3xl md:text-4xl mb-4 font-light">The Interface for the AI Era</p>
          <p className="text-2xl md:text-3xl mb-16 text-secondary">Translating Human Intent → Machine Precision</p>
          <div className="space-y-4 text-xl md:text-2xl">
            <p className="font-semibold">Rob Monahan | Founder & CEO</p>
            <p>Oliver → Kelowna BC</p>
            <p className="text-primary font-semibold">clarityburst.io</p>
            <p className="text-lg text-muted mt-8">Validated NLP Prototype · Pre-Launch Founder · Seeking Mentorship to Scale</p>
          </div>
        </motion.div>
        <div className="absolute bottom-12 animate-bounce">
          <ChevronDown className="w-8 h-8 text-secondary" />
        </div>
      </section>

      {/* Slide 2 */}
      <section id="s2" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 2/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-primary">Problem — The Prompting Bottleneck</h2>
          <p className="text-2xl mb-8 text-secondary">85% of AI users can't express what they want from AI clearly enough to get results</p>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">Most people know what they want from AI — they just can't express it clearly.</p>
            <p className="leading-relaxed">
              <span className="text-secondary font-semibold">85%</span> of AI users abandon tools after poor results{" "}
              <span className="text-sm text-muted">(OpenAI Forum Analysis, 2024)</span>.
            </p>
            <p className="leading-relaxed">Enterprises stall, ROI drops, and potential stays locked behind unclear prompts.</p>
            <p className="leading-relaxed font-semibold text-secondary">The world doesn't need more models — it needs clarity.</p>
          </div>
        </motion.div>
      </section>

      {/* Slide 3 */}
      <section id="s3" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 3/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-primary">Solution — The Translation Layer</h2>
          <p className="text-2xl mb-8 text-secondary">ClarityBurst converts everyday language into structured, high-performance prompts</p>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">ClarityBurst bridges the gap between human intent and machine understanding.</p>
            <p className="leading-relaxed">
              Its <span className="text-secondary font-semibold">patent-pending Prompt Formula™ Engine</span> and{" "}
              <span className="text-secondary font-semibold">Enhancement Engine</span> turn everyday language into structured, high-performance prompts.
            </p>
            <p className="leading-relaxed font-semibold text-secondary">The result is model-agnostic, consistent, and fast — clarity delivered at scale.</p>
          </div>
        </motion.div>
      </section>

      {/* Slide 4 */}
      <section id="s4" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 4/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-primary">Product Snapshot / MVP</h2>
          <p className="text-2xl mb-8 text-secondary">Live web/mobile app with 94% validated formula-selection accuracy</p>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">ClarityBurst is already live as a working web and mobile PWA.</p>
            <p className="leading-relaxed">
              Its NLP engine has been validated at <span className="text-primary font-semibold">94% formula-selection accuracy</span>, tested across 300 real prompts.
            </p>
            <p className="leading-relaxed font-semibold text-secondary">
              The system is simple enough for new users yet precise enough for professionals — an adaptive intelligence layer that enhances, not replaces, the creative process.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Slide 5 */}
      <section id="s5" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 5/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-12 text-primary">Competitive Edge — Cutting Through the Noise</h2>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">Prompt Libraries = static templates. Wrappers = single-model skins. Enhancers = rewording only.</p>
            <p className="leading-relaxed font-semibold text-secondary">ClarityBurst doesn't write prompts — it helps users craft professional ones with clarity and precision.</p>
            <p className="text-xl leading-relaxed text-muted pt-4">
              <span className="font-semibold text-foreground">Measured advantage:</span> 94% formula-selection accuracy vs 41–67% performance range for public prompt libraries{" "}
              <span className="text-sm">(Stanford HAI, "Beyond Prompt Engineering," Jan 2025)</span>.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Slide 6 - Consolidated Macro Narrative */}
      <AutoFitSlide id="s6" className="bg-neutral-950 text-white" minScale={0.82}>
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 6/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-10 text-primary">Market Timing & AI Evolution</h2>
          <div className="space-y-7 text-2xl md:text-3xl">
            <p className="leading-relaxed">
              Every major technology follows the same adoption pattern: <span className="text-secondary font-semibold">Enterprise → Consumer → Society</span>
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <p className="font-medium text-blue-300 flex-1">Printing Press → Industrial → Internet → Mobile → <span className="text-white font-semibold">AI</span></p>
              <p className="text-xl text-blue-200">Timeline compression: decades → years → months</p>
            </div>
            
            <p className="leading-relaxed pt-2">
              <span className="text-secondary font-semibold">August 2025 marked the inflection point</span>: Enterprise AI adoption plateaued (44.5% → 43.8%) as
              large-scale systems proved fragile and agent technology too complex for everyday employees.
            </p>
            
            <p className="leading-relaxed font-semibold text-secondary">
              This Enterprise Plateau signals the perfect entry timing for ClarityBurst: as the industry shifts from complex systems to human-centered tools,
              our clarity-first approach addresses the exact pain point blocking adoption.
            </p>
            
            <p className="leading-relaxed font-semibold text-primary mt-6">
              The next slide visualizes this critical market timing and enterprise plateau... <span className="text-sm opacity-70">continued →</span>
            </p>
          </div>
        </motion.div>
      </AutoFitSlide>

      {/* Slide 7 - Agent Bottleneck Explanation */}
      <section
        id="s7"
        className="snap-section snap-start snap-always h-[100svh] overflow-hidden bg-neutral-950 text-white"
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide 7 of ${totalSlides}`}
        aria-description="When AI agents spiked, enterprise adoption stalled"
      >
        <div className="h-full w-full flex flex-col justify-center px-6 md:px-10 max-w-[1100px] mx-auto space-y-6">
          <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 7/{totalSlides}</div>
          <motion.h2 {...fadeInUp} className="text-balance text-[clamp(28px,4.5vw,56px)] font-extrabold leading-tight text-blue-400">
            Prediction Realized — The Agent Bottleneck
          </motion.h2>
          <motion.div {...fadeInUp} className="space-y-6">
            <p className="text-[clamp(16px,1.6vw,20px)] leading-relaxed opacity-90">
              When AI agents spiked, enterprise adoption stalled.
            </p>
            <p className="text-[clamp(16px,1.6vw,20px)] leading-relaxed opacity-90">
              Throughout 2024 and 2025, agent/copilot launches exploded — yet enterprise AI adoption flattened.
            </p>
            <p className="text-[clamp(16px,1.6vw,20px)] leading-relaxed opacity-90">
              Analysts from Business Insider, TechCrunch, Fortune, and Gartner reported the same pattern:
              hype surged, pilots failed to scale, and organizations struggled with complexity and ROI.
            </p>
            <p className="text-[clamp(16px,1.6vw,20px)] font-semibold text-blue-300">
              ClarityBurst identified this inflection early — proving that clarity, not compute, drives real adoption.
              <br /><span className="font-normal opacity-70 text-sm ml-2">The next slide shows the data behind this trend... <span className="text-xs">continued →</span></span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Slide 8 - Agent Bottleneck Data Visualization */}
      <section
        id="s8"
        className="snap-section snap-start snap-always h-[100svh] overflow-hidden bg-neutral-950 text-white"
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide 8 of ${totalSlides}`}
        aria-description="Chart showing AI agent hype versus enterprise adoption rates"
      >
        <div className="h-full w-full flex flex-col justify-center items-center px-6 md:px-10 py-12">
          <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 8/{totalSlides}</div>
          <motion.h2 {...fadeInUp} className="text-[clamp(24px,3.2vw,36px)] font-extrabold leading-tight text-blue-400 mb-3 text-center">
            AI Agent Hype Peaks While Enterprise Adoption Stalls
          </motion.h2>
          
          <motion.figure {...fadeInUp} className="w-[min(950px,90vw)] flex flex-col items-center justify-center">
            <div className="max-h-[65vh] flex items-center">
              <img
                src="/agent_bottleneck_refined_dark.png"
                alt="Enterprise AI Slowdown vs. Agent Hype, 2024–2025"
                className="w-full h-auto rounded-xl shadow-2xl ring-1 ring-white/10 max-h-full object-contain"
              />
            </div>
            
            <div className="mt-3 w-full flex flex-col gap-1">
              <p className="text-center text-[clamp(13px,1.3vw,16px)] leading-tight text-blue-300 font-medium">
                The divergence between AI agent launches and enterprise adoption highlights the integration gap ClarityBurst solves.
              </p>
              
              <p className="text-center text-xs text-muted">
                Sources: Business Insider, TechCrunch, Fortune, Gartner, The Register, Medium (2024-2025)
              </p>
            </div>
          </motion.figure>
        </div>
      </section>

      {/* Slide 9 - Compression Effect Explanation */}
      <section
        id="s9"
        className="snap-section snap-start snap-always h-[100svh] overflow-hidden bg-neutral-950 text-white"
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide 9 of ${totalSlides}`}
      >
        <div className="h-full w-full flex flex-col justify-center px-6 md:px-10 max-w-[1100px] mx-auto space-y-6">
          <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 9/{totalSlides}</div>
          <motion.h2 {...fadeInUp} className="text-balance text-[clamp(28px,4.5vw,56px)] font-extrabold leading-tight text-blue-400">
            Compression Effect — Why Now
          </motion.h2>
          <motion.div {...fadeInUp} className="space-y-6">
            <p className="text-[clamp(16px,1.6vw,20px)] leading-relaxed opacity-90">
              The pace of adoption is collapsing.
            </p>
            <p className="text-[clamp(16px,1.6vw,20px)] leading-relaxed opacity-90">
              What once took decades now happens in years: mobile took ~5, SaaS ~3, and AI interfaces are hitting mass adoption in under 2.
            </p>
            <p className="text-[clamp(16px,1.6vw,20px)] leading-relaxed opacity-90">
              As each cycle compresses, the window for innovation narrows — speed, clarity, and simplicity decide who wins.
            </p>
            <p className="text-[clamp(16px,1.6vw,20px)] font-semibold text-blue-300">
              ClarityBurst stands at the center of that acceleration — the Interface Catalyst.
              <br /><span className="font-normal opacity-70 text-sm ml-2">The visualization on the next slide illustrates this compression effect... <span className="text-xs">continued →</span></span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Slide 10 - Compression Effect Data Visualization */}
      <section
        id="s10"
        className="snap-section snap-start snap-always h-[100svh] overflow-hidden bg-neutral-950 text-white"
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide 10 of ${totalSlides}`}
      >
        <div className="h-full w-full flex flex-col justify-center items-center px-6 md:px-10 py-12">
          <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 10/{totalSlides}</div>
          <motion.h2 {...fadeInUp} className="text-[clamp(24px,3.2vw,36px)] font-extrabold leading-tight text-blue-400 mb-3 text-center">
            Technology Adoption Cycles Are Dramatically Compressing
          </motion.h2>
          
          <motion.figure {...fadeInUp} className="w-[min(950px,90vw)] flex flex-col items-center justify-center">
            <div className="max-h-[65vh] flex items-center">
              <img
                src="/compression_effect_chart.png"
                alt="Accelerating Adoption Cycles Across Technology Waves (1990-2025)"
                className="w-full h-auto rounded-xl shadow-2xl ring-1 ring-white/10 max-h-full object-contain"
              />
            </div>
            
            <div className="mt-3 w-full flex flex-col gap-1">
              <p className="text-center text-[clamp(13px,1.3vw,16px)] leading-tight text-blue-300 font-medium">
                Companies that provide immediate clarity like ClarityBurst capture market share as adoption windows shrink.
              </p>
              
              <p className="text-center text-xs text-muted">
                Sources: Pew, DataTrek, RightScale, Reuters, Bond, Dr Li Blog (1990-2025)
              </p>
            </div>
          </motion.figure>
        </div>
      </section>

      {/* Slide 11 - IP & Defensibility */}
      <section id="s11" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 11/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-12 text-primary">IP & Defensibility</h2>
          <p className="text-3xl mb-12 text-secondary font-semibold">Our foundation is protected.</p>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">
              ClarityBurst holds a <span className="text-secondary font-semibold">filed U.S. trademark</span>, an{" "}
              <span className="text-secondary font-semibold">active patent application</span> covering its Prompt Formula™ Engine, and secured domains across{" "}
              <span className="text-primary">clarityburst.io</span> and <span className="text-primary">clarityburst.app</span>.
            </p>
            <p className="leading-relaxed font-semibold text-secondary pt-4">
              The system is defensible by design — built on proprietary logic that's difficult to replicate and simple to verify.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Slide 12 - Founder Story */}
      <section id="s12" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 12/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-12 text-primary">Founder Story — Grit in Action</h2>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">Built from the ground up, ClarityBurst reflects years of persistence and self-reliance.</p>
            <p className="leading-relaxed">
              From construction roofs to code nights, every step has been self-funded and execution-driven — proof that progress happens through commitment, not excuses.
            </p>
            <p className="leading-relaxed font-semibold text-secondary">Now, that same determination is focused on scaling with the right mentorship through Game On.</p>
          </div>
        </motion.div>
      </section>

      {/* Slide 13 - Incorporation & Formalization */}
      <section id="s13" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 13/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-12 text-primary">Incorporation & Formalization</h2>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">ClarityBurst is formalizing its foundation for growth.</p>
            <p className="leading-relaxed">
              The company is being incorporated in British Columbia, establishing its legal and operational structure, and preparing for its first hires and advisors in 2026.
            </p>
            <p className="leading-relaxed font-semibold text-secondary">Each step builds the framework needed to scale efficiently and position ClarityBurst for long-term success.</p>
          </div>
        </motion.div>
      </section>

      {/* Slide 14 - Expansion & Acceleration */}
      <section id="s14" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 14/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-12 text-primary">Expansion & Acceleration</h2>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">ClarityBurst is expanding from the Okanagan Tech Corridor toward broader reach and scale.</p>
            <p className="leading-relaxed">
              The next phase focuses on building key talent in Kelowna, developing the <span className="text-secondary font-semibold">SDK and Chrome Extension</span>, and assembling a core team across engineering, product, and growth.
            </p>
            <p className="leading-relaxed font-semibold text-secondary">
              Through the Game On Accelerator, ClarityBurst is piloting its first 100 users, validating retention above 50%, and positioning the company for global exposure in 2026.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Slide 15 - Why Game On (Part 1) */}
      <section id="s15" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 15/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-primary">Why Game On</h2>
          <p className="text-2xl mb-8 text-secondary">A perfect match for Canadian innovation acceleration</p>
          <div className="space-y-6 text-xl md:text-2xl">
            <p className="leading-relaxed text-xl md:text-2xl">
              As a <span className="text-secondary font-semibold">Canadian founder incorporating in British Columbia</span>,
              ClarityBurst is perfectly positioned for Game On's mission to elevate Canadian innovation.
            </p>
            <p className="leading-relaxed text-xl md:text-2xl">
              Our <span className="text-secondary font-semibold">early-stage position with billion-dollar ambition</span> aligns with
              Game On's focus on high-potential ventures ready to accelerate.
            </p>
            <p className="text-center mt-12 text-base text-primary/70">
              Continue to next slide for what we seek from Game On →
            </p>
          </div>
        </motion.div>
      </section>
      
      {/* Slide 16 - What We Seek from Game On (Part 2) */}
      <section id="s16" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 16/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">What We Seek from Game On</h2>
          <p className="text-xl mb-8 text-secondary">Key outcomes for ClarityBurst through the accelerator program</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <p className="text-lg md:text-xl">Focused mentorship from experienced SaaS operators</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <p className="text-lg md:text-xl">Refinement of our go-to-market strategy</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <p className="text-lg md:text-xl">Validation of pricing and distribution models</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <p className="text-lg md:text-xl">Acceleration of early revenue opportunities</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <p className="text-lg md:text-xl">Connection to the broader Canadian tech ecosystem</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Slide 17 - Call to Action */}
      <section id="s17" className="snap-section h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 bg-black/30 px-2 py-1 rounded z-50">Slide 17/{totalSlides}</div>
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-12 text-primary text-glow">The Time Is Now</h2>
          <p className="text-4xl md:text-5xl font-bold mb-12 text-secondary">The Interface Era Has Begun.</p>
          <blockquote className="text-2xl md:text-3xl italic mb-12 border-l-4 border-primary pl-6 py-4">
            "Every era rewards those who see the shift before it's visible."
          </blockquote>
          <div className="space-y-8 text-2xl md:text-3xl">
            <p className="leading-relaxed">ClarityBurst is ready to guide that shift — transforming how people and AI communicate.</p>
            <p className="leading-relaxed font-semibold text-secondary">
              Committed to Game On's program dates and eager to leverage the mentorship, we're ready to scale with the right partners.
            </p>
            <div className="space-y-4 text-xl pt-8">
              <p className="text-primary font-semibold">r.monahan@clarityburst.io</p>
              <p className="text-secondary font-semibold">clarityburst.io</p>
              <p className="text-lg text-muted mt-4">Slide <span id="slide-number" className="text-primary font-medium">17/17</span></p>
            </div>
          </div>
        </motion.div>
      </section>

      <style>{`
        @media print {
          .snap-section {
            page-break-after: always;
            min-height: 100vh;
            scroll-snap-align: none;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
