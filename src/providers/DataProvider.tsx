import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchJson, fetchText } from "@/libs/Fetch";
import { cached } from "@/libs/Cache";
import { getProjects } from "@/libs/Projets";
import { getCaseStudys } from "@/libs/CaseStudys";
import { useLanguage } from "@/providers/LanguageProvider";
import { LoadingScreen } from "@/components/loadingScreen/LoadingScreen";
import type { Infos, LocalizedInfos } from "@/types/Infos";
import type { SocialMedia } from "@/types/SocialMedia";
import type { ProjectType } from "@/types/ProjectType";
import type { CaseStudyType } from "@/types/CaseStudyType";

interface SiteData {
    infos: Infos;
    description: LocalizedInfos;
    socialMedia: SocialMedia[];
    projects: ProjectType[];
    caseStudies: CaseStudyType[];
}

const DataContext = createContext<SiteData | null>(null);

async function loadSiteData(languages: string[]): Promise<SiteData> {
    const [infos, social, projects, caseStudies] = await Promise.all([
        fetchJson<Infos>("/data/infos/infos.json"),
        fetchJson<SocialMedia[]>("/data/social/infos.json"),
        getProjects(),
        getCaseStudys(),
    ]);

    const descEntries = await Promise.all(
        languages.map(async (lang) => {
            const url = `/data/infos/${infos.description[lang]}`;
            return [lang, await cached(url, () => fetchText(url))] as const;
        })
    );

    return {
        infos,
        description: Object.fromEntries(descEntries),
        socialMedia: social.map((el) => ({ ...el, icon: `/data/social/${el.icon}` })),
        // copy before reversing: never mutate cached arrays
        projects: [...projects].reverse(),
        caseStudies: [...caseStudies].reverse(),
    };
}

export function DataProvider({ children }: { children: ReactNode }) {
    const { availableLanguages } = useLanguage();
    const [data, setData] = useState<SiteData | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        loadSiteData(availableLanguages)
            .then((d) => !cancelled && setData(d))
            .catch((e) => {
                console.error(e);
                if (!cancelled) setError(true);
            });
        return () => { cancelled = true; };
    }, [availableLanguages]);

    if (error) return <p>Something went wrong. Please refresh.</p>; // style as you like
    if (!data) return <LoadingScreen />;

    return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useSiteData(): SiteData {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useSiteData must be used inside <DataProvider>");
    return ctx;
}