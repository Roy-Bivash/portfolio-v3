import LoadingScreenCSS from "@/css/LoadingScreen.module.css";

export function LoaderComponent() {
    return(
        <div className="text-center">
            <span className={LoadingScreenCSS.loader}></span>
            <h4 className="text-secondary-text mt-3 text-xl">Loading..<span className="inline-block animate-bounce">.</span></h4>
    
        </div>
    )
}