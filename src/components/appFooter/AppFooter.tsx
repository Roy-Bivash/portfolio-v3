import { useLanguage } from "@/providers/languageProvider";

export function AppFooter() {
    const currentYear = new Date().getFullYear();
    const { tr } = useLanguage();

    return (
        <footer className="text-background-text text-sm mt-12 lg:mt-18">
            <p>
                &copy; {currentYear} <a href="https://rbivash.com/" target="_self" className="transition text-primary-text hover:underline hover:text-accent-text">ROY Bivash.</a>{ tr("no_rights_reserved_Free_to") }<a href="https://github.com/Roy-Bivash/portfolio-v3" target="_blank" className="transition text-primary-text hover:underline hover:text-accent-text">{ tr("use_and_modify") }</a>
            </p>
        </footer>
    )
}