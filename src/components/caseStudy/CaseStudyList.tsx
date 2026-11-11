import type { ReactNode } from "react"

interface CaseStudyListProps {
    children: ReactNode;
}

export function CaseStudyList({ children }: CaseStudyListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    )
}