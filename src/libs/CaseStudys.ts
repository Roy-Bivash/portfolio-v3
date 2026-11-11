import { fetchJson, fetchText } from "@/libs/Fetch";
import type { CaseStudyType } from "@/types/CaseStudyType";
import type { LocalizedInfos } from "@/types/Infos";

export async function getCaseStudys(): Promise<CaseStudyType[]> {
    const data = await fetchJson<CaseStudyType[]>("/data/caseStudys/list.json");

    return data;
}

export async function getCaseStudyById(id: string): Promise<CaseStudyType | undefined> {
    const projects = await getCaseStudys();
    return projects.find((cs) => String(cs.id) === id);
}

export async function getCaseStudyDescriptions(descriptionFiles: Record<string, string>, langs: string[]): Promise<LocalizedInfos> {
    const entries = await Promise.all(
        langs.map(async (lang) => {
            const markdown = await fetchText(`/data/caseStudys/${descriptionFiles[lang]}`);
            return [lang, markdown] as const;
        })
    );

    return Object.fromEntries(entries);
}