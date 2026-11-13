import { useLanguage } from "@/providers/LanguageProvider";

export function LanguageButton() {
    const { availableLanguages, language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-1 text-secondary-text justify-end px-3 md:px-8 pt-1">
            {availableLanguages.map((lang, i) => (
                <div key={lang} className="flex items-center gap-1 mt-1">
                    <button
                        onClick={() => setLanguage(lang)}
                        className={`uppercase px-2 py-1 rounded-full text-xs font-semibold tracking-wider transition cursor-pointer hover:text-accent-text 
                            ${language === lang ? "bg-accent-background text-accent-text" : ""}
                            `}
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