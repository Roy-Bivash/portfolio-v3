import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ProjectType } from "@/types/ProjectType";


export type ProjectDetailsModalState = { isOpen: boolean; project: ProjectType | null };

export interface AppState {
    isLoading: boolean;
    projectDetailsModal: ProjectDetailsModalState;
}

export interface AppStateActions {
    setLoading: (isLoading: boolean) => void;
    openProjectDetailsModal: (project: ProjectType) => void;
    closeProjectDetailsModal: () => void;
}

export type AppStateContextValue = AppState & AppStateActions;

const AppStateContext = createContext<AppStateContextValue | undefined>(
    undefined
);

interface AppStateProviderProps {
    children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [projectDetailsModal, setProjectDetailsModal] = useState<ProjectDetailsModalState>({ isOpen: false, project: null });

    const setLoading = useCallback((value: boolean) => {
        setIsLoading(value);
    }, []);

    const openProjectDetailsModal = useCallback((project: ProjectType) => {
        setProjectDetailsModal({ isOpen: true, project });
    }, []);

    const closeProjectDetailsModal = useCallback(() => {
        setProjectDetailsModal({ isOpen: false, project: null });
    }, []);

    const value = useMemo<AppStateContextValue>(
        () => ({
            isLoading,
            projectDetailsModal,
            setLoading,
            openProjectDetailsModal,
            closeProjectDetailsModal,
        }),
        [
            isLoading,
            projectDetailsModal,
            setLoading,
            openProjectDetailsModal,
            closeProjectDetailsModal,
        ]
    );

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState(): AppStateContextValue {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error("useAppState must be used within an AppStateProvider");
    }
    return context;
}
