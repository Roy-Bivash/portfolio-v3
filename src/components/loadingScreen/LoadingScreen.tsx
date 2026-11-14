import LoadingScreenCSS from "@/css/LoadingScreen.module.css";

export function LoadingScreen() {
    return (
        <main className="w-svw flex flex-col items-center mt-30">
            <span className={LoadingScreenCSS.loader}></span>
            <h4 className="text-secondary-text mt-3 text-xl">Loading..<span className="inline-block animate-bounce">.</span></h4>
        </main>
    )
}