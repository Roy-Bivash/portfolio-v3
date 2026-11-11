import { Project, ProjectList } from "@/components/project";
import placeholder from "@/assets/placeholder.svg";
import { useEffect, useState } from "react";
import type { ProjectType } from "@/types/ProjectType";
import { getProjects } from "@/libs/Projets";
import { useLanguage } from "@/providers/languageProvider";
import { CaseStudyList } from "@/components/caseStudy";
import { CaseStudy } from "@/components/caseStudy/CaseStudy";
import { getCaseStudys } from "@/libs/CaseStudys";
import type { CaseStudyType } from "@/types/CaseStudyType";


export function HomePageMain() {
    const INITIAL_VISIBLE = 6;
    const [showAll, setShowAll] = useState(false);
    const [projectList, setProjectList] = useState<ProjectType[]>([]);
    const [caseStudyList, setCaseStudyList] = useState<CaseStudyType[]>([]);
    const { tr } = useLanguage();


    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                const prjs = await getProjects();
                const caseStudys = await getCaseStudys();

                if (cancelled) return;
                
                prjs.reverse();
                caseStudys.reverse();

                setProjectList(prjs);
                setCaseStudyList(caseStudys);
            } catch (error) {
                console.error(error);
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, []);


    const firstProjects = projectList.slice(0, INITIAL_VISIBLE);
    const extraProjects = projectList.slice(INITIAL_VISIBLE);
    const hasMoreProject = extraProjects.length > 0;

    return (
        <main className="my-18 space-y-12">
            <section id="case-study">
                <h2 className="text-secondary-text text-4xl mb-6 capitalize">{ tr("case_study") }</h2>
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
                <h2 className="text-secondary-text text-4xl mb-6 capitalize">{ tr("projects") }</h2>
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