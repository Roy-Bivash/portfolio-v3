import { useEffect, useRef } from "react";

export function LightEffect() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMove = (e: PointerEvent) => {
            ref.current?.style.setProperty("--x", `${e.clientX}px`);
            ref.current?.style.setProperty("--y", `${e.clientY}px`);
        };
        
        window.addEventListener("pointermove", handleMove);

        return () => window.removeEventListener("pointermove", handleMove);
    }, []);

    return (
        <div
            ref={ref}
            className="pointer-events-none fixed inset-0 z-50 hidden md:block"
            style={{ background: "radial-gradient(600px at var(--x, 50%) var(--y, 50%), rgba(15 118 110 / 0.08), transparent 85%)" }}        
        />
    );
}