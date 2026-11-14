import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { LanguageButton } from "@/components/languageButton/LanguageButton";
import { useLanguage } from "@/providers/LanguageProvider";
import { useSiteData } from "@/providers/DataProvider";
import { getCaseStudyDescriptions } from "@/libs/CaseStudys";
import type { LocalizedInfos } from "@/types/Infos";
import { AppFooter } from "@/components/appFooter/AppFooter";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { LoaderComponent } from "@/components/loadingScreen/LoaderComponent";

type Status = "loading" | "ready" | "error";

export function CaseStudyDetails() {
    const { id } = useParams<{ id: string }>();
    const { t, tr, availableLanguages } = useLanguage();
    const { caseStudies } = useSiteData();

    const caseStudy = caseStudies.find((cs) => String(cs.id) === id) ?? null;

    const [description, setDescription] = useState<LocalizedInfos>();
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        if (!caseStudy) return;
        let cancelled = false;
        setStatus("loading");

        getCaseStudyDescriptions(caseStudy["description-file"], availableLanguages)
            .then((d) => {
                if (cancelled) return;
                setDescription(d);
                setStatus("ready");
            })
            .catch((error) => {
                console.error(error);
                if (!cancelled) setStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, [caseStudy, availableLanguages]);

    return (
        <div className="relative">
            <LanguageButton />
            <div className="mx-auto flex flex-col min-h-screen max-w-7xl px-6 py-10 md:px-12 md:py-20 lg:px-24 lg:py-24">
                <main className="flex-1">
                    <Link to="/" className="mb-8 transition group font-normal tracking-wide text-accent-text flex items-center gap-1">
                        <ArrowLeft size={18} className="transition h-4 w-4 group-hover:-translate-x-2" />
                        <span>{tr("back")}</span>
                    </Link>

                    {!caseStudy && <p className="text-secondary-text">{tr("study_not_found")}</p>}

                    {caseStudy && status === "loading" && (
                        <LoaderComponent />
                    )}

                    {caseStudy && status === "error" && (
                        <p className="text-secondary-text">{tr("case_study_loading_error")}</p>
                    )}

                    {caseStudy && status === "ready" && (
                        <article>
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