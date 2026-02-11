"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { LoginModal } from "@/components/auth/login-modal";
import { ReferralLinker } from "@/components/tracking/referral-linker";
import { UtmLinker } from "@/components/tracking/utm-linker";
import { trackSignUp } from "@/lib/gtag";
import { trackAdjustSignUp, trackAdjustLogin } from "@/lib/adjust";
import { trackTikTokSignUp } from "@/lib/tiktok";
import { trackFacebookSignUp } from "@/lib/facebook";
import { SwRegister } from "@/components/pwa/sw-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AdjustInit } from "@/components/tracking/adjust-init";

// ---------- HomeView Context ----------
type HomeView = "home" | "upload" | "generator" | "progress" | "result";

interface AppContextType {
  homeView: HomeView;
  setHomeView: (v: HomeView) => void;
  user: any;
  openLogin: (redirectTo?: string) => void;
}

const AppContext = createContext<AppContextType>({
  homeView: "home",
  setHomeView: () => {},
  user: null,
  openLogin: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

// ---------- AppShell ----------
export function AppShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [homeView, setHomeView] = useState<HomeView>("home");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user) {
        const provider = session.user.app_metadata?.provider;
        const loginMethod = provider === "google" ? "google" : "email";
        
        // Check if this is a new signup (cookie set by server)
        const isNewSignup = document.cookie.includes("buzzmove_new_signup=1");
        
        // Track GA event
        trackSignUp(loginMethod);
        
        // Track Adjust event (sign_up or login)
        if (isNewSignup) {
          trackAdjustSignUp();
          // Clear the signup flag cookie
          document.cookie = "buzzmove_new_signup=; path=/; max-age=0";
        } else {
          trackAdjustLogin();
        }
        
        // Track TikTok event (CompleteRegistration)
        if (isNewSignup) {
          trackTikTokSignUp(loginMethod);
        }
        
        // Track Facebook event (CompleteRegistration)
        if (isNewSignup) {
          trackFacebookSignUp(loginMethod);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Listen for "open-login" custom event
  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  // Check ?login=1 query param & capture redirectTo
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") setShowLogin(true);
    if (params.get("redirectTo")) setRedirectTo(params.get("redirectTo"));
  }, []);

  const openLogin = (redirect?: string) => {
    if (redirect) setRedirectTo(redirect);
    setShowLogin(true);
  };

  return (
    <AppContext.Provider value={{ homeView, setHomeView, user, openLogin }}>
      <Sidebar isLoggedIn={!!user} userEmail={user?.email} onLoginClick={() => openLogin()} />
      <div className="flex min-h-screen flex-col sidebar-offset">
        <Header
          user={user}
          homeView={homeView}
          onBackToHome={() => setHomeView("home")}
          onLoginClick={() => openLogin()}
        />
        {/* Main: pb must clear BottomNav (1px sep + 64px content + safe-area-inset-bottom) */}
        <main className="flex flex-1 flex-col main-with-nav">{children}</main>
      </div>
      <BottomNav isLoggedIn={!!user} onLoginClick={() => openLogin()} />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} redirectTo={redirectTo} />
      {user && <ReferralLinker userId={user.id} />}
      {user && <UtmLinker userId={user.id} />}
      <AdjustInit />
      <SwRegister />
      <InstallPrompt />
    </AppContext.Provider>
  );
}
