interface MaskIconProps {
    src: string;
    className?: string
}
export function MaskIcon({ src, className = 'h-6 w-6' }: MaskIconProps) {
    const url = `url(${src})`
    return (
        <span
            aria-hidden="true"
            className={`block bg-current ${className}`}
            style={{
                WebkitMaskImage: url,
                maskImage: url,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
            }}
        />
    )
}