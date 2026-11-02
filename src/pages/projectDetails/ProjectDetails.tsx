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
import { getProjectById, getProjectDescriptions } from "@/libs/Projets";
import type { ProjectType } from "@/types/ProjectType";
import type { LocalizedInfos } from "@/types/Infos";
import { AppFooter } from "@/components/appFooter/AppFooter";


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

export function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const { t, availableLanguages } = useLanguage();

    const [project, setProject] = useState<ProjectType | null>(null);
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
                const prj = await getProjectById(id);
                if (cancelled) return;

                if (!prj) {
                    setStatus("not-found");
                    return;
                }

                const descriptions = await getProjectDescriptions(
                    prj["description-file"],
                    availableLanguages
                );
                if (cancelled) return;

                setProject(prj);
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
            <div className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-12 md:py-20 lg:px-24 lg:py-24">
                <main>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 mb-8 text-secondary-text hover:text-accent-text transition"
                    >
                        <ArrowLeft size={18} />
                        <span>Retour aux projets</span>
                    </Link>

                    {status === "loading" && (
                        <p className="text-secondary-text">Chargement...</p>
                    )}

                    {status === "not-found" && (
                        <p className="text-secondary-text">Projet introuvable.</p>
                    )}

                    {status === "error" && (
                        <p className="text-secondary-text">
                            Une erreur est survenue lors du chargement du projet.
                        </p>
                    )}

                    {status === "ready" && project && (
                        <article>
                            <h1 className="text-primary-text text-3xl sm:text-4xl lg:text-5xl font-bold mb-8">
                                {t(project.title)}
                            </h1>
                            <div className="space-y-5 leading-relaxed tracking-wide text-primary-text wrap-break-word
                            [&_img]:max-w-full [&_img]:h-auto
                            [&_pre]:max-w-full [&_pre]:overflow-x-auto
                            [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto
                            [&_video]:max-w-full
                            [&_iframe]:max-w-full"
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
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