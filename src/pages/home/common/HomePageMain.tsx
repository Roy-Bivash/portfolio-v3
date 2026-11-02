import { Project, ProjectList } from "@/components/project";
import placeholder from "@/assets/placeholder.svg";
import { useEffect, useState } from "react";
import type { ProjectType } from "@/types/ProjectType";
import { getProjects } from "@/libs/Projets";


export function HomePageMain() {
    const INITIAL_VISIBLE = 6;


    const [showAll, setShowAll] = useState(false);
    const [projectList, setProjectList] = useState<ProjectType[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                const prjs = await getProjects();

                if (cancelled) return;
                setProjectList(prjs);
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
    const hasMore = extraProjects.length > 0;

    return (
        <main className="my-18">
            <h2 className="text-secondary-text text-4xl mb-4">Projets</h2>
            <div className="group/list">
                <ProjectList>
                    {firstProjects.map((el: ProjectType) => (
                        <Project
                            key={el.id}
                            project={el}
                        />
                    ))}
                </ProjectList>

                {hasMore && (
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
            </div>

            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => setShowAll((prev) => !prev)}
                        aria-expanded={showAll}
                        className="px-6 py-2 font-semibold text-primary-text border-b-2 border-transparent hover:border-accent-text transition hover:bg-secondary-background hover:text-accent-text cursor-pointer"
                    >
                        {showAll ? "Voir moins" : "Voir plus"}
                    </button>
                </div>
            )}
        </main>
    )
}