import { fetchJson, fetchText } from "@/libs/Fetch";
import type { CaseStudyType } from "@/types/CaseStudyType";
import type { LocalizedInfos } from "@/types/Infos";
import { cached } from "./Cache";

export function getCaseStudys(): Promise<CaseStudyType[]> {
    return cached("caseStudys:list", () =>
        fetchJson<CaseStudyType[]>("/data/caseStudys/list.json")
    );
}

export async function getCaseStudyDescriptions(
    descriptionFiles: Record<string, string>,
    langs: string[]
): Promise<LocalizedInfos> {
    const entries = await Promise.all(
        langs.map(async (lang) => {
            const url = `/data/caseStudys/${descriptionFiles[lang]}`;
            const markdown = await cached(url, () => fetchText(url));
            return [lang, markdown] as const;
        })
    );

    return Object.fromEntries(entries);
}