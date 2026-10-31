import { useLanguage } from "@/providers/languageProvider";

export function LanguageButton() {
    const { availableLanguages, language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-1 text-secondary-text justify-end px-3 md:px-8 pt-1">
            {availableLanguages.map((lang, i) => (
                <div key={lang} className="flex items-center gap-1">
                    <button
                        onClick={() => setLanguage(lang)}
                        className={`uppercase text-xs font-semibold tracking-wider transition cursor-pointer hover:text-accent-text ${language === lang ? "text-primary-text" : ""}`}
                    >
                        {lang}
                    </button>
                    {i < availableLanguages.length - 1 && (
                        <span className="text-xs opacity-40">/</span>
                    )}
                </div>
            ))}
        </div>
    );
}