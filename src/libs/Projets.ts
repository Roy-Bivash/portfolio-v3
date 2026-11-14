import { fetchJson, fetchText } from "@/libs/Fetch";
import type { ProjectType } from "@/types/ProjectType";
import type { LocalizedInfos } from "@/types/Infos";
import { cached } from "./Cache";

export function getProjects(): Promise<ProjectType[]> {
    return cached("projects:list", () =>
        fetchJson<ProjectType[]>("/data/projects/list.json")
    );
}

export async function getProjectDescriptions(
    descriptionFiles: Record<string, string>,
    langs: string[]
): Promise<LocalizedInfos> {
    const entries = await Promise.all(
        langs.map(async (lang) => {
            const url = `/data/projects/${descriptionFiles[lang]}`;
            const markdown = await cached(url, () => fetchText(url));
            return [lang, markdown] as const;
        })
    );

    return Object.fromEntries(entries);
}