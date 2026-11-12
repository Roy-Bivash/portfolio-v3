import ReactMarkdown from "react-markdown";
import { markdownComponents, markdownRehypePlugins, markdownRemarkPlugins } from "./markdownConfig";

type MarkdownContentProps = {
    children: string;
    className?: string;
};

export function MarkdownContent({ children, className = "" }: MarkdownContentProps) {
    return (
        <div
            className={`prose max-w-none text-primary-text wrap-break-word
                        [&_img]:max-w-full [&_img]:h-auto
                        [&_pre]:max-w-full [&_pre]:overflow-x-auto
                        [&_table]:max-w-full [&_table]:overflow-x-auto
                        [&_video]:max-w-full
                        [&_iframe]:max-w-full ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={markdownRemarkPlugins}
                rehypePlugins={markdownRehypePlugins}
                components={markdownComponents}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}