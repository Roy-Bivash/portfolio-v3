import type { ReactNode } from "react"

interface ProjectListProps {
    children: ReactNode;
}

export function ProjectList({ children }: ProjectListProps) {
    return (
        <div className="group/list grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {children}
        </div>
    )
}