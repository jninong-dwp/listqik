"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  detectBrowserHomeLocale,
  readStoredHomeLocale,
  storeHomeLocale,
  type HomeLocale,
} from "@/i18n/home-locale";
import { getHomepageCopy, type HomepageCopy } from "@/i18n/homepage-copy";

type HomeLocaleContextValue = {
  locale: HomeLocale;
  copy: HomepageCopy;
  ready: boolean;
  showLanguageModal: boolean;
  setLocale: (locale: HomeLocale) => void;
};

const HomeLocaleContext = createContext<HomeLocaleContextValue | null>(null);

export function useHomeLocale(): HomeLocaleContextValue {
  const ctx = useContext(HomeLocaleContext);
  if (!ctx) {
    throw new Error("useHomeLocale must be used within HomeLocaleProvider");
  }
  return ctx;
}

export function HomeLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<HomeLocale>("en");
  const [ready, setReady] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    const stored = readStoredHomeLocale();
    if (stored) {
      setLocaleState(stored);
      document.documentElement.lang = stored;
      setShowLanguageModal(false);
    } else {
      const detected = detectBrowserHomeLocale();
      setLocaleState(detected);
      storeHomeLocale(detected);
      setShowLanguageModal(false);
    }
    setReady(true);
  }, []);

  const setLocale = useCallback((next: HomeLocale) => {
    setLocaleState(next);
    storeHomeLocale(next);
    setShowLanguageModal(false);
  }, []);

  const copy = useMemo(() => getHomepageCopy(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      copy,
      ready,
      showLanguageModal,
      setLocale,
    }),
    [locale, copy, ready, showLanguageModal, setLocale],
  );

  return <HomeLocaleContext.Provider value={value}>{children}</HomeLocaleContext.Provider>;
}
