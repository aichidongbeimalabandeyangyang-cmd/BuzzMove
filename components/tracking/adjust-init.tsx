"use client";

import { useEffect } from "react";
import {
  ADJUST_APP_TOKEN,
  trackAdjustFirstVisit,
} from "@/lib/adjust";

const FIRST_VISIT_KEY = "buzzmove_adjust_first_visit";

export function AdjustInit() {
  useEffect(() => {
    const token =
      process.env.NEXT_PUBLIC_ADJUST_APP_TOKEN || ADJUST_APP_TOKEN;
    
    // Auto-switch based on NODE_ENV: development/test -> sandbox, production -> production
    const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    const env = (process.env.NEXT_PUBLIC_ADJUST_ENV || (isDev ? "sandbox" : "production")) as
      | "sandbox"
      | "production";

    const init = () => {
      if (typeof window === "undefined" || !window.Adjust?.initSdk) return;

      window.Adjust.initSdk({
        appToken: token,
        environment: env,
        logLevel: env === "sandbox" ? "verbose" : "error",
      });

      // Fire first_visit once per device
      if (!localStorage.getItem(FIRST_VISIT_KEY)) {
        trackAdjustFirstVisit();
        localStorage.setItem(FIRST_VISIT_KEY, "1");
      }
    };

    if (window.Adjust?.initSdk) {
      init();
    } else {
      const check = setInterval(() => {
        if (window.Adjust?.initSdk) {
          clearInterval(check);
          init();
        }
      }, 50);
      return () => clearInterval(check);
    }
  }, []);

  return null;
}
