"use client";

import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

declare global {
  interface Document {
    startViewTransition(callback: () => void): {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  }
}

export function useThemeTransition() {
  const { theme, setTheme } = useTheme();

  const animatedSetTheme = async (
    newTheme: string,
    e?: React.MouseEvent | MouseEvent | { clientX: number, clientY: number }
  ) => {
    // Fallback if View Transition API is not supported or user prefers reduced motion
    if (
      typeof document === 'undefined' ||
      typeof window === 'undefined' ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(newTheme);
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (e && "clientX" in e && "clientY" in e) {
      x = e.clientX;
      y = e.clientY;
    } else {
      let targetElement = document.activeElement;
      if (targetElement?.tagName === "INPUT" || targetElement?.tagName === "TEXTAREA") {
        const selectedItem = document.querySelector('[data-selected="true"]');
        if (selectedItem) {
          targetElement = selectedItem;
        }
      }

      if (targetElement && targetElement.tagName !== "BODY") {
        const rect = targetElement.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    }).ready;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 400,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return {
    theme,
    setTheme: animatedSetTheme,
    rawSetTheme: setTheme,
  };
}
