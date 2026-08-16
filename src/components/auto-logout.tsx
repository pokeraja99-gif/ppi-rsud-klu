"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function AutoLogout() {
  const { status } = useSession();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (status === "authenticated") {
      timerRef.current = setTimeout(() => {
        // Logout and redirect with timeout error
        signOut({ callbackUrl: "/login?error=timeout" });
      }, TIMEOUT_MS);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      // Set initial timer
      resetTimer();

      // Events to track user activity
      const events = [
        "mousemove",
        "mousedown",
        "click",
        "scroll",
        "keypress",
        "touchstart",
      ];

      const handleActivity = () => {
        resetTimer();
      };

      // Add event listeners
      events.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });

      // Cleanup
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        events.forEach((event) => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [resetTimer, status]);

  return null;
}
