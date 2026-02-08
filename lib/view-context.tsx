"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type HomeView = "home" | "upload" | "generator" | "progress" | "result";

interface ViewContextType {
  homeView: HomeView;
  setHomeView: (v: HomeView) => void;
}

const ViewContext = createContext<ViewContextType>({
  homeView: "home",
  setHomeView: () => {},
});

export function ViewProvider({ children }: { children: ReactNode }) {
  const [homeView, setHomeView] = useState<HomeView>("home");
  return (
    <ViewContext.Provider value={{ homeView, setHomeView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useHomeView() {
  return useContext(ViewContext);
}
