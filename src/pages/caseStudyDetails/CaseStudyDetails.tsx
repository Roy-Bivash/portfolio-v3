import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Options as SanitizeSchema } from "rehype-sanitize";

import { LanguageButton } from "@/components/languageButton/LanguageButton";
import { useLanguage } from "@/providers/languageProvider";
import type { LocalizedInfos } from "@/types/Infos";
import { AppFooter } from "@/components/appFooter/AppFooter";
import { getCaseStudyById, getCaseStudyDescriptions } from "@/libs/CaseStudys";
import type { CaseStudyType } from "@/types/CaseStudyType";

const sanitizeSchema: SanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), "div"],
    attributes: {
        ...defaultSchema.attributes,
        div: ["align"],
        img: [
            ...(defaultSchema.attributes?.img ?? []),
            "height",
            "width",
            "align",
        ],
    },
};

type Status = "loading" | "ready" | "not-found" | "error";

export function CaseStudyDetails() {
    const { id } = useParams<{ id: string }>();
    const { t, tr, availableLanguages } = useLanguage();

    const [caseStudy, setCaseStudy] = useState<CaseStudyType | null>(null);
    const [description, setDescription] = useState<LocalizedInfos>();
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!id) {
                setStatus("not-found");
                return;
            }

            setStatus("loading");

            try {
                const cs = await getCaseStudyById(id);
                if (cancelled) return;

                if (!cs) {
                    setStatus("not-found");
                    return;
                }

                const descriptions = await getCaseStudyDescriptions(
                    cs["description-file"],
                    availableLanguages
                );
                if (cancelled) return;

                setCaseStudy(cs);
                setDescription(descriptions);
                setStatus("ready");
            } catch (error) {
                console.error(error);
                if (!cancelled) setStatus("error");
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [id, availableLanguages]);


    return (
        <div className="relative">
            <LanguageButton />
            <div className="mx-auto flex flex-col min-h-screen max-w-7xl px-6 py-10 md:px-12 md:py-20 lg:px-24 lg:py-24">
                <main className="flex-1">
                    <Link to="/" target="_self" className="mb-8 transition group font-normal tracking-wide text-accent-text flex items-center gap-1">
                        <ArrowLeft size={18} className="transition h-4 w-4 group-hover:-translate-x-2" />

                        <span>{tr("back_to_projects")}</span>
                    </Link>

                    {status === "loading" && (
                        <p className="text-secondary-text">{tr("loading")}...</p>
                    )}

                    {status === "not-found" && (
                        <p className="text-secondary-text">{tr("study_not_found")}</p>
                    )}

                    {status === "error" && (
                        <p className="text-secondary-text">
                            {tr("case_study_loading_error")}
                        </p>
                    )}

                    {status === "ready" && caseStudy && (
                        <article>
                            <div
                                className="prose max-w-none text-primary-text wrap-break-word
                                    [&_img]:max-w-full [&_img]:h-auto
                                    [&_pre]:max-w-full [&_pre]:overflow-x-auto
                                    [&_table]:max-w-full [&_table]:overflow-x-auto
                                    [&_video]:max-w-full
                                    [&_iframe]:max-w-full"
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                                    components={{
                                        table: ({ node, ...props }) => (
                                            <div className="my-8 overflow-x-auto rounded-lg border border-secondary-text/20">
                                                <table {...props} />
                                            </div>
                                        ),
                                    }}
                                >
                                    {t(description)}
                                </ReactMarkdown>
                            </div>
                        </article>
                    )}
                </main>
                <AppFooter />
            </div>
        </div>
    );
}