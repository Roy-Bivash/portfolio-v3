export type LocalizedCaseStudy = Record<string, string>;
export type LocalizedCaseStudyTags = Record<string, string[]>;

export interface CaseStudyType {
    id: number;
    title: LocalizedCaseStudy;
    subhead: LocalizedCaseStudy;
    introduction: LocalizedCaseStudy;
    "description-file": LocalizedCaseStudy;
    tags: LocalizedCaseStudyTags;
}