import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MaskIcon } from "@/components/maskIcon/MaskIcon";
import { useLanguage } from "@/providers/languageProvider";
import type { Infos, LocalizedInfos } from "@/types/Infos";
import type { SocialMedia } from "@/types/SocialMedia";
import { fetchJson, fetchText } from "@/libs/Fetch";


async function getSocialMedia(): Promise<SocialMedia[]> {
    const data = await fetchJson<SocialMedia[]>("/data/social/infos.json");

    return data.map((el) => ({
        ...el,
        icon: `/data/social/${el.icon}`,
    }));
}

async function getDescriptions(infos: Infos): Promise<LocalizedInfos> {
    const entries = await Promise.all(
        infos["avalable-language"].map(async (lang) => {
            const markdown = await fetchText(`/data/infos/${infos.description[lang]}`);
            return [lang, markdown] as const;
        })
    );

    return Object.fromEntries(entries);
}

export function HomePageHeader() {
    const { t, setAvailableLanguages } = useLanguage();

    const [infos, setInfos] = useState<Infos>();
    const [description, setDescription] = useState<LocalizedInfos>({});
    const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                const [infosData, socialData] = await Promise.all([
                    fetchJson<Infos>("/data/infos/infos.json"),
                    getSocialMedia(),
                ]);
                const descriptionsData = await getDescriptions(infosData);

                if (cancelled) return;

                setInfos(infosData);
                setDescription(descriptionsData);
                setSocialMedia(socialData);
                setAvailableLanguages(infosData["avalable-language"]);
            } catch (error) {
                console.error(error);
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [setAvailableLanguages]);

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

            <section id="about" className="md:col-span-3 lg:bg-secondary-background lg:p-4 lg:shadow-lg">
                <div className="space-y-5 leading-relaxed tracking-wide text-secondary-text">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {t(description)}
                    </ReactMarkdown>
                </div>
            </section>
        </header>
    );
}