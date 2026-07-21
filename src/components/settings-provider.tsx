import { createContext, useContext, ReactNode } from "react";
import { t as defaultT } from "@/lib/i18n";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/settings.functions";

type Settings = typeof defaultT & {
  heroImage?: string;
  aboutImage?: string;
};

const SettingsContext = createContext<Settings>(defaultT);

// Deep merge utility
function isObject(item: unknown) {
  return item && typeof item === "object" && !Array.isArray(item);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        if (source[key] !== undefined && source[key] !== null) {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  }
  return deepMerge(target, ...sources);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: dbSettings } = useSuspenseQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
  });

  // Start with default, override with DB settings
  const mergedSettings = dbSettings
    ? deepMerge(JSON.parse(JSON.stringify(defaultT)), dbSettings)
    : defaultT;

  if (!mergedSettings.nav) {
    mergedSettings.nav = defaultT.nav;
  }
  if (!mergedSettings.admin) {
    mergedSettings.admin = defaultT.admin;
  }
  if (!mergedSettings.cta) {
    mergedSettings.cta = defaultT.cta;
  }

  return <SettingsContext.Provider value={mergedSettings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
