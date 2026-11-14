import { useState } from "react";
import { MaskIcon } from "@/components/maskIcon/MaskIcon";
import { useLanguage } from "@/providers/LanguageProvider";
import type { SocialMedia } from "@/types/SocialMedia";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { useSiteData } from "@/providers/DataProvider";

export function HomePageHeader() {
    const { t } = useLanguage();
    useState<SocialMedia[]>([]);

    const { infos, description, socialMedia } = useSiteData();

    return (
        <header className="grid grid-cols-1 gap-8 md:grid-cols-5 md:items-center">
            <div className="md:col-span-2">
                <section id="title">
                    <h1 className="text-primary-text text-4xl sm:text-6xl font-bold">{infos?.name}</h1>
                    <h3 className="text-secondary-text mt-3 text-xl">{infos && t(infos.title)}</h3>
                    <p className="text-secondary-text mt-1 text-sm">{infos && t(infos.subhead)}</p>
                </section>
                <section id="social">
                    <ul className="mt-8 flex items-center gap-5">
                        {socialMedia.map((el, idx) => (
                            <li key={idx}>
                                <a
                                    href={el.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-all block text-secondary-text hover:text-primary-text"
                                >
                                    <span className="sr-only">{el.name}</span>
                                    <MaskIcon src={el.icon} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <section id="about" className="md:col-span-3 lg:bg-secondary-background lg:p-4">
                <div className="space-y-5 leading-relaxed tracking-wide text-primary-text">
                    <MarkdownContent>
                        {t(description)}
                    </MarkdownContent>
                </div>
            </section>
        </header>
    );
}