import { LanguageButton } from "@/components/languageButton/LanguageButton";
import { HomePageHeader } from "./common/HomePageHeader";
import { HomePageMain } from "./common/HomePageMain";
import { AppFooter } from "@/components/appFooter/AppFooter";

export function Home() {
    return (
        <div className="relative">
            <LanguageButton />
            <div className="mx-auto min-h-screen max-w-7xl px-6 py-10 md:px-12 md:py-20 lg:px-24 lg:py-24">
                <HomePageHeader />
                <HomePageMain />
                <AppFooter />
            </div>
        </div>
    )
}