"use client";

import { useSearchParams } from "next/navigation";
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
  HOME_LOCALE_STORAGE_KEY,
  isHomeLocale,
  readStoredHomeLocale,
  storeHomeLocale,
  type HomeLocale,
} from "@/i18n/home-locale";
import { getSiteChromeCopy, type SiteChromeCopy } from "@/i18n/site-chrome-copy";
import { LOCALE_CHANGE_EVENT } from "@/lib/locale-events";

type SiteLocaleContextValue = {
  locale: HomeLocale;
  chrome: SiteChromeCopy;
  ready: boolean;
  setLocale: (locale: HomeLocale) => void;
};

const SiteLocaleContext = createContext<SiteLocaleContextValue | null>(null);

export function useSiteLocale(): SiteLocaleContextValue {
  const ctx = useContext(SiteLocaleContext);
  if (!ctx) {
    throw new Error("useSiteLocale must be used within SiteLocaleProvider");
  }
  return ctx;
}

function readLocaleFromStorage(): HomeLocale | null {
  return readStoredHomeLocale();
}

export function SiteLocaleProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [locale, setLocaleState] = useState<HomeLocale>("en");
  const [ready, setReady] = useState(false);

  const applyLocale = useCallback((next: HomeLocale) => {
    setLocaleState(next);
    storeHomeLocale(next);
  }, []);

  useEffect(() => {
    const langParam = searchParams.get("lang");
    if (isHomeLocale(langParam)) {
      applyLocale(langParam);
      setReady(true);
      return;
    }

    const stored = readLocaleFromStorage();
    if (stored) {
      setLocaleState(stored);
      document.documentElement.lang = stored;
      setReady(true);
      return;
    }

    applyLocale(detectBrowserHomeLocale());
    setReady(true);
  }, [searchParams, applyLocale]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== HOME_LOCALE_STORAGE_KEY) return;
      if (isHomeLocale(event.newValue)) {
        setLocaleState(event.newValue);
        document.documentElement.lang = event.newValue;
      }
    };

    const onLocaleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ locale?: string }>).detail?.locale;
      if (isHomeLocale(detail)) {
        setLocaleState(detail);
        document.documentElement.lang = detail;
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    };
  }, []);

  const setLocale = useCallback(
    (next: HomeLocale) => {
      applyLocale(next);
    },
    [applyLocale],
  );

  const chrome = useMemo(() => getSiteChromeCopy(locale), [locale]);

  const value = useMemo(
    () => ({ locale, chrome, ready, setLocale }),
    [locale, chrome, ready, setLocale],
  );

  return (
    <SiteLocaleContext.Provider value={value}>{children}</SiteLocaleContext.Provider>
  );
}
