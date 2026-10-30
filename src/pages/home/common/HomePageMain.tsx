import { Project, ProjectList } from "@/components/project";
import placeholder from "@/assets/placeholder.svg";
import { useState } from "react";

interface Projet {
    img: string;
    title: string;
    href?: string;
    description: string;
    tags: Array<string>;
    target: string;
}

const projectList = [
    {
        "img": "",
        "title": "FIP Game",
        "description": "An online medieval combat game accessible via web browser - Project in developpement",
        "tags": ["React", "TypeScript", "TailwindCSS", "NestJS", "PostgreSQL", "Redis", "Docker", "OAuth", "WebSocket", "NodeJS"],
        "target": "_blank"
    },
    {
        "img": "",
        "title": "Game of life",
        "href": "https://github.com/Roy-Bivash/game-of-life",
        "description": "The Game of Life, also known as Conway's Game of Life or simply Life, is a cellular automaton",
        "tags": ["React", "TypeScript", "Phaser JS", "CSS"],
        "target": "_blank"
    },
    {
        "img": "",
        "title": "Pallery",
        "href": "https://github.com/Roy-Bivash/Pallery",
        "description": "Pallery is a Pinterest-style web application for hosting images",
        "tags": ["React", "TypeScript", "Express", "NodeJS", "Supabase", "TailwindCSS"],
        "target": "_blank"
    },
    {
        "img": "",
        "title": "Pulsar",
        "href": "https://github.com/Roy-Bivash/pulsar",
        "description": "Run the Microsoft Phi models locally on your machine",
        "tags": ["python", "Vue.js", "TypeScript", "CSS", "Docker", "Git"],
        "target": "_blank"
    },
    {
        "img": "",
        "title": "Brightness",
        "href": "https://github.com/Roy-Bivash/Brightness",
        "description": "Adjust the the brightness of individual monitors in linux.",
        "tags": ["Rust", "React", "Tauri", "Typescript", "Git"],
        "target": "_blank"
    },
    {
        "img": "",
        "title": "Aim Trainer",
        "href": "https://github.com/Roy-Bivash/aim-trainer",
        "description": "A simple aim trainer using the pixi.js library",
        "tags": ["HTML", "CSS", "JavaScript", "Pixi.js"],
        "target": "_blank"
    },
    {
        "img": "",
        "title": "Pulsar",
        "href": "https://github.com/Roy-Bivash/pulsar",
        "description": "Run the Microsoft Phi models locally on your machine",
        "tags": ["python", "Vue.js", "TypeScript", "CSS", "Docker", "Git"],
        "target": "_blank"
    },
    {
        "img": "",
        "title": "Brightness",
        "href": "https://github.com/Roy-Bivash/Brightness",
        "description": "Adjust the the brightness of individual monitors in linux.",
        "tags": ["Rust", "React", "Tauri", "Typescript", "Git"],
        "target": "_blank"
    },
];


export function HomePageMain() {
    const INITIAL_VISIBLE = 6;

    const [showAll, setShowAll] = useState(false);

    const firstProjects = projectList.slice(0, INITIAL_VISIBLE);
    const extraProjects = projectList.slice(INITIAL_VISIBLE);
    const hasMore = extraProjects.length > 0;

    return (
        <main className="my-18">
            <h2 className="text-secondary-text text-4xl mb-4">Projets</h2>
            <div className="group/list">
                <ProjectList>
                    {firstProjects.map((el: Projet, i: number) => (
                        <Project
                            key={i}
                            img={el.img != "" ? el.img : placeholder}
                            title={el.title}
                            href={el.href}
                            description={el.description}
                            target={el.target}
                            tags={el.tags}
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
                                    {extraProjects.map((el: Projet, i: number) => (
                                        <Project
                                            key={i}
                                            img={el.img != "" ? el.img : placeholder}
                                            title={el.title}
                                            href={el.href}
                                            description={el.description}
                                            target={el.target}
                                            tags={el.tags}
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