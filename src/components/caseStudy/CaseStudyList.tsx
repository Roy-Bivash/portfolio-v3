import { Children, type ReactNode } from "react"

interface CaseStudyListProps {
    children: ReactNode;
}

export function CaseStudyList({ children }: CaseStudyListProps) {
    const nbChildren = Children.count(children)

    return (
        <div className={`grid grid-cols-1 gap-6 ${nbChildren > 1 ? "md:grid-cols-2" : ""}`}>
            {children}
        </div>
    )
}