type LanguageCode = string;

export type LocalizedInfos = Record<LanguageCode, string>;

export interface Infos {
    name: string;
    title: LocalizedInfos;
    subhead: LocalizedInfos;
    description: LocalizedInfos;
}