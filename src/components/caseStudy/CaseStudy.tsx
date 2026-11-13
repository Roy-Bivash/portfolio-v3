import type { CaseStudyType } from "@/types/CaseStudyType";
import { Tag } from "../tag/Tag";
import { useLanguage } from "@/providers/LanguageProvider";
import { Link } from "react-router";

interface CaseStudyProps {
    caseStudy: CaseStudyType;
}

export function CaseStudy({ caseStudy }: CaseStudyProps) {
    const { t, tList } = useLanguage();

    const { id, title, subhead, introduction, tags } = caseStudy;

    return (
        <Link
            to={`/case-study/${id}`}
            className="group/project cursor-pointer transition duration-300 flex flex-col overflow-hidden border-b-2 border-transparent
            bg-secondary-background focus-visible:outline-2 focus-visible:outline-accent-text
            lg:hover:bg-accent-background lg:hover:border-accent-text lg:hover:-translate-y-1 lg:hover:shadow-[0_8px_24px_-8px_rgba(194,65,12,0.20)]"
        >
            <div className="flex flex-col flex-1 gap-3 p-4 md:p-6">
                <p className="text-sm text-secondary-text">
                    {t(subhead)}
                </p>
                <h3 className="text-lg font-semibold text-primary-text group-hover/project:text-accent-text">
                    {t(title)}
                </h3>
                <p className="text-secondary-text leading-relaxed">
                    {t(introduction)}
                </p>
                <ul className="mt-auto flex flex-row flex-wrap gap-2 pt-1">
                    {tList(tags).map((el, i) => (
                        <Tag key={i} name={el} />
                    ))}
                </ul>
            </div>
        </Link>
    )
}