export type LocalizedProject = Record<string, string>;

export interface ProjectLink {
    placeholder: string,
    link: string,
    target: string // "_blank"
}

export interface ProjectType {
    id: number;
    title: LocalizedProject;

    subhead: LocalizedProject;
    "description-file": LocalizedProject;
    tags: string[];
    link: ProjectLink;
}