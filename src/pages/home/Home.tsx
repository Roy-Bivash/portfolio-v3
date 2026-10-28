import { LightEffect } from "../../components/lightEffect/LightEffect";
import { HomePageFooter } from "./common/HomePageFooter";
import { HomePageHeader } from "./common/HomePageHeader";
import { HomePageMain } from "./common/HomePageMain";

export function Home() {
    return (
        <div className="relative">
            <LightEffect />
            <div className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-12 md:py-20 lg:px-24 lg:py-24">
                <HomePageHeader />
                <HomePageMain />
                <HomePageFooter />
            </div>
        </div>
    )
}