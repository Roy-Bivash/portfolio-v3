import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface AppState {
    isLoading: boolean;
}

export interface AppStateActions {
    setLoading: (isLoading: boolean) => void;
}

export type AppStateContextValue = AppState & AppStateActions;

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

interface AppStateProviderProps {
    children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const setLoading = useCallback((value: boolean) => {
        setIsLoading(value);
    }, []);

    const value = useMemo<AppStateContextValue>(
        () => ({ isLoading, setLoading }),
        [isLoading, setLoading]
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