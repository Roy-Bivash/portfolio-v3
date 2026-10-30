import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LanguageCode = string;
export type Localized = Record<LanguageCode, string>;

const STORAGE_KEY = "selected-language";

interface LanguageContextValue {
    availableLanguages: LanguageCode[];
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    setAvailableLanguages: (langs: LanguageCode[]) => void;
    t: (field: Localized | undefined) => string;
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
        // TODO
    }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [availableLanguages, setAvailableState] = useState<LanguageCode[]>([]);
    const [requested, setRequested] = useState<LanguageCode | null>(
        readStoredLanguage
    );

    const language =
        requested && availableLanguages.includes(requested)
            ? requested
            : availableLanguages[0] ?? "";

    const setAvailableLanguages = useCallback((langs: LanguageCode[]) => {
        setAvailableState((prev) =>
            prev.length === langs.length && prev.every((l, i) => l === langs[i])
                ? prev
                : langs
        );
    }, []);

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

    const t = useCallback(
        (field: Localized | undefined) => {
            if (!field) return "";
            return (
                field[language] ??
                field[availableLanguages[0]] ??
                Object.values(field)[0] ??
                ""
            );
        },
        [language, availableLanguages]
    );

    const value = useMemo(
        () => ({ availableLanguages, language, setLanguage, setAvailableLanguages, t }),
        [availableLanguages, language, setLanguage, setAvailableLanguages, t]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error("useLanguage must be used inside <LanguageProvider>");
    }
    return ctx;
}

export function useRegisterLanguages(languages: LanguageCode[]) {
    const { setAvailableLanguages } = useLanguage();

    useEffect(() => {
        setAvailableLanguages(languages);
    }, [languages, setAvailableLanguages]);
}

export function AvailableLanguages({ languages }: { languages: LanguageCode[] }) {
    useRegisterLanguages(languages);
    return null;
}