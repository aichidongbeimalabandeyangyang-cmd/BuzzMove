"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { LoginModal } from "@/components/auth/login-modal";

// ---------- HomeView Context ----------
type HomeView = "home" | "upload" | "generator" | "progress" | "result";

interface AppContextType {
  homeView: HomeView;
  setHomeView: (v: HomeView) => void;
  user: any;
  openLogin: () => void;
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Listen for "open-login" custom event
  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  // Check ?login=1 query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") setShowLogin(true);
  }, []);

  const openLogin = () => setShowLogin(true);

  return (
    <AppContext.Provider value={{ homeView, setHomeView, user, openLogin }}>
      <Header
        user={user}
        homeView={homeView}
        onBackToHome={() => setHomeView("home")}
        onLoginClick={openLogin}
      />
      <main className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</main>
      <BottomNav isLoggedIn={!!user} onLoginClick={openLogin} />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </AppContext.Provider>
  );
}
