import { MaskIcon } from "@/components/maskIcon/MaskIcon";
import { useEffect, useState } from "react"
import type { SocialMedia } from "@/types/SocialMedia";
import type { Infos } from "@/types/Infos";
import { useLanguage } from "@/providers/languageProvider";

export function HomePageHeader() {
    const { t, setAvailableLanguages } = useLanguage();
    const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
    const [infos, setInfos] = useState<Infos>();

    useEffect(() => {
        async function run() {
            const resUserInfos = await getUserInfos();
            setInfos(resUserInfos)

            setAvailableLanguages(resUserInfos["avalable-language"]);

            const resSocialMedia = await getSocialMedia();
            setSocialMedia(resSocialMedia);

        }

        run();
    }, [])

    async function getSocialMedia() {
        const res = await fetch("/data/social/infos.json");
        let data: SocialMedia[] = await res.json();

        return data.map(el => {
            return {
                ...el,
                icon: `/data/social/${el.icon}`
            }
        })
    }

    async function getUserInfos() {
        const res = await fetch("/data/infos/infos.json");
        let data: Infos = await res.json();

        for (let i = 0; i < data["avalable-language"].length; i++) {
            const element = data["avalable-language"][i];
            data.description[element] = `/data/infos/${data.description[element]}`;

            // const test = await fetch(data.description[element]);
            // const test2 = await test.text();
            // console.log(test2)
        }

        return data;
    }

    return (
        <header className="grid grid-cols-1 gap-8 md:grid-cols-5 md:items-center">
            <div className="md:col-span-2">
                <section id="title">
                    <h1 className="text-primary-text text-4xl sm:text-6xl font-bold">{ infos?.name }</h1>
                    <h3 className="text-secondary-text mt-3 text-xl">{ t(infos?.title) }</h3>
                    <p className="text-secondary-text mt-1 text-sm">{ t(infos?.subhead) }</p>
                </section>
                <section id="social">
                    <ul className='mt-8 flex items-center gap-5'>
                        {socialMedia.map((el, idx) => (
                            <li key={idx}>
                                <a href={el.href} target='_blank' className='transition-all block text-secondary-text hover:text-primary-text'>
                                    <span className='sr-only'>{el.name}</span>
                                    <MaskIcon src={el.icon} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <section id="about" className="md:col-span-3 lg:bg-secondary-background lg:p-4 lg:shadow-lg">
                <div className="space-y-5 leading-relaxed tracking-wide">
                    <p className="text-secondary-text">
                        <span>Back in 2020, I decided to dive into coding by creating small <a href="#projects" className="text-primary-text hover:underline">projects</a>
                            and exploring the world of programming. What started as a curiosity quickly turned into a passion.</span>
                        <span>After completing a two-year technical degree in IT, where I sharpened my skills, I'm now pursuing a Computer Engineering degree at
                            <a href="https://www.cnam.fr/" target="_blank" className="text-primary-text hover:underline">CNAM University</a>.
                        </span>
                    </p>
                    <p className="text-secondary-text">
                        <span>These days, my focus is on becoming a better developer and deepening my expertise in full-stack development.</span>
                        <span>I'm constantly seeking opportunities to grow, with the long-term goal of moving into a leadership role where I can manage and guide teams toward building innovative solutions.</span>
                    </p>
                </div>
            </section>
        </header>
    )
}