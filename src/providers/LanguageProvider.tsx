import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchJson } from "@/libs/Fetch";
import { useAppState } from "@/providers/AppStateProvider";

export type LanguageCode = string;
export type Localized<T = string> = Record<LanguageCode, T>;
export type LocalizedList = Localized<string[]>;
export type Translations = Record<string, Localized>;

const STORAGE_KEY = "selected-language";
const LANGUAGES_URL = "/data/infos/avalable-language.json";
const TRANSLATIONS_URL = "/data/infos/translations.json";

interface AvailableLanguageFile {
    "avalable-language": LanguageCode[];
}

interface LanguageContextValue {
    availableLanguages: LanguageCode[];
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    /** Translate an inline Localized string. */
    t: (field: Localized | undefined) => string;
    /** Translate an inline localized list (e.g. tags). */
    tList: (field: Localized<string[]> | undefined) => string[];
    /** Translate a key from translations.json. */
    tr: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): LanguageCode | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function writeStoredLanguage(lang: LanguageCode) {
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // ignorer
    }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { setLoading } = useAppState();
    const [availableLanguages, setAvailableLanguages] = useState<LanguageCode[]>([]);
    const [translations, setTranslations] = useState<Translations>({});
    const [loaded, setLoaded] = useState(false);
    const [requested, setRequested] = useState<LanguageCode | null>(readStoredLanguage);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        Promise.all([
            fetchJson<AvailableLanguageFile>(LANGUAGES_URL),
            fetchJson<Translations>(TRANSLATIONS_URL).catch((err) => {
                console.error(`Failed to load ${TRANSLATIONS_URL}`, err);
                return {} as Translations;
            }),
        ])
            .then(([langData, translationData]) => {
                if (cancelled) return;

                const langs = langData["avalable-language"] ?? [];
                if (langs.length === 0) {
                    console.error(`No languages found: "avalable-language" is missing or empty in ${LANGUAGES_URL}`);
                }
                setAvailableLanguages(langs);
                setTranslations(translationData ?? {});
            })
            .catch(console.error)
            .finally(() => {
                if (cancelled) return;
                setLoaded(true);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [setLoading]);

    const language =
        requested && availableLanguages.includes(requested)
            ? requested
            : availableLanguages[0] ?? "";

    const setLanguage = useCallback(
        (lang: LanguageCode) => {
            if (!availableLanguages.includes(lang)) {
                console.warn(`Language "${lang}" is not available`);
                return;
            }
            setRequested(lang);
            writeStoredLanguage(lang);
        },
        [availableLanguages]
    );

    const resolve = useCallback(
        <T,>(field: Localized<T> | undefined, isEmpty: (v: T) => boolean): T | undefined => {
            if (!field) return undefined;

            const candidates = [
                field[language],
                field[availableLanguages[0]],
                ...Object.values(field),
            ];

            // first non-empty value wins, else fall back to the first defined one
            return (
                candidates.find((v) => v !== undefined && !isEmpty(v)) ??
                candidates.find((v) => v !== undefined)
            );
        },
        [language, availableLanguages]
    );

    const t = useCallback(
        (field: Localized | undefined) => resolve(field, (v) => v === "") ?? "",
        [resolve]
    );

    const tList = useCallback(
        (field: Localized<string[]> | undefined) =>
            resolve(field, (v) => v.length === 0) ?? [],
        [resolve]
    );

    const tr = useCallback(
        (key: string) => {
            const field = translations[key];
            if (!field) {
                console.warn(`Missing translation key "${key}"`);
                return key;
            }
            return t(field);
        },
        [translations, t]
    );

    const value = useMemo(
        () => ({ availableLanguages, language, setLanguage, t, tList, tr }),
        [availableLanguages, language, setLanguage, t, tList, tr]
    );

    useEffect(() => {
        if (!language) return;
        document.documentElement.lang = language;
    }, [language]);

    // Pas de render tant que les langues ne sont pas definie.
    if (!loaded) return null;

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
    return ctx;
}