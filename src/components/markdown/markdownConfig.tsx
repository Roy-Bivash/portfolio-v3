import type { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Options as SanitizeSchema } from "rehype-sanitize";
import { Tag } from "../tag/Tag";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const sanitizeSchema: SanitizeSchema = {
    ...defaultSchema,
    tagNames: [
        ...(defaultSchema.tagNames ?? []),
        "div",
        "tags",
        "tag",
        "cards",
        "card"
    ],
    attributes: {
        ...defaultSchema.attributes,
        div: ["align"],
        img: [
            ...(defaultSchema.attributes?.img ?? []),
            "height",
            "width",
            "align",
        ],
        th: ["align"],
        td: ["align"],
        tag: ["label"],
        card: ["title"],
    },
};

export const markdownRemarkPlugins: Options["remarkPlugins"] = [remarkGfm, remarkMath];

export const markdownRehypePlugins: Options["rehypePlugins"] = [
    rehypeRaw,
    [rehypeSanitize, sanitizeSchema],
    rehypeKatex
];

const customComponents = {
    tags: (props: { children?: React.ReactNode }) => (
        <ul className="not-prose my-4 flex flex-wrap gap-2">
            {props.children}
        </ul>
    ),
    tag: (props: { label?: string }) => <Tag name={props.label ?? ""} />,
    cards: (props: { children?: React.ReactNode }) => (
        <div className="not-prose my-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {props.children}
        </div>
    ),
    card: (props: { title?: string; children?: React.ReactNode }) => (
        <div className="not-prose flex flex-col overflow-hidden bg-secondary-background">
            <div className="flex flex-col flex-1 gap-2 p-4 md:p-6">
                {props.title && (
                    <h3 className="text-lg font-semibold text-primary-text">
                        {props.title}
                    </h3>
                )}
                <div
                    className="prose prose-sm max-w-none
                           [--tw-prose-body:var(--color-secondary-text)]
                           [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                >
                    {props.children}
                </div>
            </div>
        </div>
    ),
};

export const markdownComponents: Options["components"] = {
    table: ({ node, ...props }) => (
        <div className="my-8 overflow-x-auto border border-secondary-text/20">
            <table {...props} />
        </div>
    ),
    blockquote: ({ node, ...props }) => (
        <blockquote
            className="not-italic font-normal px-5 py-3 border-l-4 border-accent-text bg-secondary-background"
            {...props}
        />
    ),
    a: ({ node, ...props }) => (
        <a
            {...props}
            className="font-normal text-primary-text transition hover:text-accent-text hover:underline underline-offset-3"
            target="_blank"
            rel="noopener noreferrer"
        />
    ),

    ...customComponents,
};