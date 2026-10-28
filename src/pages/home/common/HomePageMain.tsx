import { Project, ProjectList } from "@/components/project";
import placeholder from "@/assets/placeholder.svg";

interface Project {
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
    }
];

export function HomePageMain() {
    return (
        <main className="my-18">
            <h2 className="text-secondary-text text-4xl mb-4">Projets</h2>
            <ProjectList>
                {projectList.map((el: Project, i) => (
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
        </main>
    )
}