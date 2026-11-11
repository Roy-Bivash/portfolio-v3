import type { ProjectType } from "@/types/ProjectType";
import { Tag } from "../tag/Tag";
import { useLanguage } from "@/providers/languageProvider";
import { Link } from "react-router";

interface ProjectProps {
    project: ProjectType;
}

export function Project({ project }: ProjectProps) {
    const { t } = useLanguage();

    const { id, title, subhead, tags } = project;

    return (
        <Link
            to={`/project-details/${id}`}
            className="group/project cursor-pointer transition duration-300 flex flex-col overflow-hidden border-b-2 border-transparent
                bg-secondary-background lg:hover:bg-accent-background lg:hover:border-accent-text lg:hover:-translate-y-1 lg:hover:shadow-[0_8px_24px_-8px_rgba(194,65,12,0.20)]"
        >
            <div className="flex flex-col flex-1 p-4">
                <h6 className="flex items-end gap-1 group-hover/project:text-accent-text font-semibold text-primary-text">
                    <span>{t(title)}</span>
                </h6>
                <p className="text-secondary-text py-2">
                    {t(subhead)}
                </p>
                <ul className="pt-2 flex flex-row flex-wrap gap-y-3 gap-x-1">
                    {tags.map((el, i) => (
                        <Tag key={i} name={el} />
                    ))}
                </ul>
            </div>
        </Link>
    )
}