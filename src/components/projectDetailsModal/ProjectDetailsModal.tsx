import { useAppState } from "@/providers/AppStateProvider";
import { useLanguage } from "@/providers/languageProvider";
import { X } from "lucide-react";

export function ProjectDetailsModal() {
    const { projectDetailsModal, closeProjectDetailsModal } = useAppState();
    const { t } = useLanguage();

    // Si pas de de selection de projet : On s'arrete la :
    if (!projectDetailsModal.isOpen) return null;

    const { project } = projectDetailsModal;

    return (
        <div className="z-40 bg-background/60 fixed top-0 left-0 h-svh w-svw flex items-center justify-center">
            <div className="lg:w-10/12 w-11/12 h-9/10 p-4 bg-background border border-accent-background">
                <div className="flex justify-between items-center">
                    <h1 className="text-primary-text text-4xl font-bold">{t(project?.title)}</h1>
                    <button 
                        onClick={() => closeProjectDetailsModal()}
                        className="transition cursor-pointer text-primary-text hover:text-accent-text flex gap-1 items-end border py-1 px-2"
                    >
                        <X />
                        Fermer
                    </button>
                </div>

            </div>
        </div>
    )
}