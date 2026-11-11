import { fetchJson, fetchText } from "@/libs/Fetch";
import type { ProjectType } from "@/types/ProjectType";
import type { LocalizedInfos } from "@/types/Infos";

export async function getProjects(): Promise<ProjectType[]> {
    const data = await fetchJson<ProjectType[]>("/data/projects/list.json");

    return data;
}

export async function getProjectById(id: string): Promise<ProjectType | undefined> {
    const projects = await getProjects();
    return projects.find((p) => String(p.id) === id);
}

export async function getProjectDescriptions(descriptionFiles: Record<string, string>, langs: string[]): Promise<LocalizedInfos> {
    const entries = await Promise.all(
        langs.map(async (lang) => {
            const markdown = await fetchText(`/data/projects/${descriptionFiles[lang]}`);
            return [lang, markdown] as const;
        })
    );

    return Object.fromEntries(entries);
}