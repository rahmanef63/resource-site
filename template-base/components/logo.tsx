import { cn } from '@/lib/utils'
import type { CSSProperties, HTMLAttributes } from 'react'

export const BRAND_NAME = 'SuperSpace'

export type BrandLogoTone = 'dark' | 'light' | 'gray'
export type BrandLogoStyle = 'solid' | 'outline'

const BRAND_LOGO_ASSETS = {
    solid: {
        dark: '/logo-dark.svg',
        light: '/logo-light.svg',
        gray: '/logo-gray.svg',
    },
    outline: {
        dark: '/logo-outline-dark.svg',
        light: '/logo-outline-light.svg',
        gray: '/logo-outline-gray.svg',
    },
} as const satisfies Record<BrandLogoStyle, Record<BrandLogoTone, string>>

const BRAND_LOGO_MASK_STYLE = {
    backgroundColor: 'currentColor',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    maskSize: 'contain',
} satisfies CSSProperties

type BrandLogoMarkProps = HTMLAttributes<HTMLSpanElement> & {
    styleVariant?: BrandLogoStyle
    tone?: BrandLogoTone
}

export function BrandLogoMark({
    className,
    style,
    styleVariant = 'solid',
    tone = 'dark',
    ...props
}: BrandLogoMarkProps) {
    const asset = BRAND_LOGO_ASSETS[styleVariant][tone]
    const isDecorative =
        props['aria-label'] == null &&
        props['aria-labelledby'] == null &&
        props.role == null

    return (
        <span
            aria-hidden={isDecorative ? true : undefined}
            data-logo-style={styleVariant}
            data-logo-tone={tone}
            className={cn('inline-block aspect-square shrink-0 align-middle', className)}
            style={{
                ...BRAND_LOGO_MASK_STYLE,
                WebkitMaskImage: `url("${asset}")`,
                maskImage: `url("${asset}")`,
                ...style,
            }}
            {...props}
        />
    )
}

type BrandLockupProps = HTMLAttributes<HTMLSpanElement> & {
    label?: string
    labelClassName?: string
    logoClassName?: string
    styleVariant?: BrandLogoStyle
    tone?: BrandLogoTone
}

export function BrandLockup({
    className,
    label = BRAND_NAME,
    labelClassName,
    logoClassName,
    styleVariant = 'solid',
    tone = 'dark',
    ...props
}: BrandLockupProps) {
    return (
        <span className={cn('inline-flex min-w-0 items-center gap-2', className)} {...props}>
            <BrandLogoMark
                styleVariant={styleVariant}
                tone={tone}
                className={cn('size-5 text-current', logoClassName)}
            />
            <span className={cn('min-w-0 text-sm font-semibold tracking-tight text-current', labelClassName)}>
                {label}
            </span>
        </span>
    )
}

export const Logo = ({
    className,
    uniColor,
}: {
    className?: string
    uniColor?: boolean
}) => {
    return (
        <BrandLogoMark
            className={cn('size-5', uniColor ? 'text-foreground' : 'text-primary', className)}
        />
    )
}

export const LogoIcon = ({
    className,
    uniColor,
}: {
    className?: string
    uniColor?: boolean
}) => {
    return (
        <BrandLogoMark
            className={cn('size-5', uniColor ? 'text-foreground' : 'text-primary', className)}
        />
    )
}

export const LogoStroke = ({ className }: { className?: string }) => {
    return (
        <BrandLogoMark
            styleVariant="outline"
            className={cn('size-7 text-foreground', className)}
        />
    )
}

export function ChatMaxingIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
    return (
        <BrandLogoMark
            styleVariant="outline"
            className={cn('size-6 text-foreground', className)}
            {...props}
        />
    )
}

export function ChatMaxingIconColoured({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
    return (
        <BrandLogoMark
            className={cn('size-6 text-primary', className)}
            {...props}
        />
    )
}
