"use client";

import { useEffect, type ReactNode } from "react";
import { inView, MotionConfig, stagger, useAnimate } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const editorialEase = [0.22, 1, 0.36, 1] as const;

export function LandingMotion({ children }: { children: ReactNode }) {
  const [scope, animate] = useAnimate();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Server-rendered content stays visible when JavaScript is unavailable.
    if (reduceMotion) return;
    const root = scope.current as HTMLElement;
    const animations: ReturnType<typeof animate>[] = [];
    const reveal = (
      elements: Element[],
      distance: number,
      duration: number,
    ) => {
      if (!elements.length) return;
      animations.push(
        animate(
          elements,
          {
            opacity: [0.45, 1],
            transform: [`translateY(${distance}px)`, "translateY(0px)"],
          },
          { duration, ease: editorialEase, delay: stagger(0.065) },
        ),
      );
    };

    reveal(
      Array.from(
        root.querySelectorAll(
          ".editorial-eyebrow, .editorial-heading span, .editorial-description, .editorial-actions, .editorial-ownership",
        ),
      ),
      16,
      0.7,
    );
    const stopObserving = inView(
      root.querySelectorAll(
        ".marketplace-section-heading, .editor-window, .closing-copy",
      ),
      (element) => {
        reveal([element], element.matches(".editor-window") ? 24 : 12, 0.6);
      },
      { amount: 0.2 },
    );

    return () => {
      stopObserving();
      animations.forEach((animation) => animation.cancel());
    };
  }, [animate, reduceMotion, scope]);

  return (
    <MotionConfig reducedMotion="user">
      <main ref={scope} id="main" className="marketplace-home">
        {children}
      </main>
    </MotionConfig>
  );
}
