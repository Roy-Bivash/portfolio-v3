import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { LanguageButton } from "@/components/languageButton/LanguageButton";
import { useLanguage } from "@/providers/LanguageProvider";
import { getProjectById, getProjectDescriptions } from "@/libs/Projets";
import type { ProjectType } from "@/types/ProjectType";
import type { LocalizedInfos } from "@/types/Infos";
import { AppFooter } from "@/components/appFooter/AppFooter";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";


type Status = "loading" | "ready" | "not-found" | "error";

export function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const { t, tr, availableLanguages } = useLanguage();

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
                        <p className="text-secondary-text">{tr("project_not_found")}</p>
                    )}

                    {status === "error" && (
                        <p className="text-secondary-text">
                            {tr("project_loading_error")}
                        </p>
                    )}

                    {status === "ready" && project && (
                        <article>
                            <h1 className="text-primary-text text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                                {t(project.title)}
                            </h1>
                            {project.link.link !== "" && (
                                <a
                                    href={project.link.link} target={project.link.target}
                                    className="mb-8 transition w-fit group text-secondary-text font-normal tracking-wide hover:text-accent-text flex items-end gap-1"
                                >
                                    <span>{project.link.placeholder}</span>
                                    <ArrowUpRight size={16} className="transition h-4 w-4 -translate-y-1 group-hover:translate-x-1 group-hover:-translate-y-2" />
                                </a>
                            )}
                            <MarkdownContent>
                                {t(description)}
                            </MarkdownContent>
                        </article>
                    )}
                </main>
                <AppFooter />
            </div>
        </div>
    );
}