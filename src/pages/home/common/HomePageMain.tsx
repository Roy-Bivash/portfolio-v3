import { Project, ProjectList } from "@/components/project";
import { useState } from "react";
import type { ProjectType } from "@/types/ProjectType";
import { useLanguage } from "@/providers/LanguageProvider";
import { CaseStudyList } from "@/components/caseStudy";
import { CaseStudy } from "@/components/caseStudy/CaseStudy";
import type { CaseStudyType } from "@/types/CaseStudyType";
import { useSiteData } from "@/providers/DataProvider";


export function HomePageMain() {
    const INITIAL_VISIBLE = 6;
    const [showAll, setShowAll] = useState(false);
    const { tr } = useLanguage();
    const { projects: projectList, caseStudies: caseStudyList } = useSiteData();

    const firstProjects = projectList.slice(0, INITIAL_VISIBLE);
    const extraProjects = projectList.slice(INITIAL_VISIBLE);
    const hasMoreProject = extraProjects.length > 0;

    return (
        <main className="mt-28 mb-18 space-y-12">
            <section id="case-study">
                <h5 className="text-secondary-text text-sm md:text-lg mb-1 uppercase tracking-wider leading-relaxed">{tr("case_study")}</h5>
                <h2 className="text-primary-text text-xl md:text-4xl mb-2 md:mb-6 tracking-wider leading-tight">{tr("case_study_title_h2")}</h2>
                <CaseStudyList>
                    {caseStudyList.map((el: CaseStudyType) => (
                        <CaseStudy
                            key={el.id}
                            caseStudy={el}
                        />
                    ))}
                </CaseStudyList>
            </section>

            <section id="projects">
                <h5 className="text-secondary-text text-sm md:text-lg mb-1 uppercase tracking-wider leading-relaxed">{tr("projects")}</h5>
                <h2 className="text-primary-text text-xl md:text-4xl mb-2 md:mb-6 tracking-wider leading-tight">{tr("project_title_h2")}</h2>
                <ProjectList>
                    {firstProjects.map((el: ProjectType) => (
                        <Project
                            key={el.id}
                            project={el}
                        />
                    ))}
                </ProjectList>

                {hasMoreProject && (
                    <div
                        className={`grid transition-all duration-500 ease-in-out ${showAll
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                            }`}
                        aria-hidden={!showAll}
                        inert={!showAll}
                    >
                        <div className="overflow-hidden">
                            <div className="pt-6">
                                <ProjectList>
                                    {extraProjects.map((el: ProjectType) => (
                                        <Project
                                            key={el.id}
                                            project={el}
                                        />
                                    ))}
                                </ProjectList>
                            </div>
                        </div>
                    </div>
                )}
                {hasMoreProject && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setShowAll((prev) => !prev)}
                            aria-expanded={showAll}
                            className="px-6 py-2 font-semibold text-primary-text border-b-2 border-transparent hover:border-accent-text transition hover:bg-secondary-background hover:text-accent-text cursor-pointer"
                        >
                            {showAll ? tr("see_less") : tr("see_more")}
                        </button>
                    </div>
                )}
            </section>

        </main>
    )
}