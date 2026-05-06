// Re-export shared utilities from global lib to avoid duplication
export { cn, uid, clamp } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Static lookup tables — Tailwind v4 requires complete class strings (no dynamic fragments)
const GAP_MAP: Record<string, string>     = { '0':'gap-0','1':'gap-1','2':'gap-2','3':'gap-3','4':'gap-4','5':'gap-5','6':'gap-6','8':'gap-8','10':'gap-10','12':'gap-12' };
const PADDING_MAP: Record<string, string> = { '0':'p-0','1':'p-1','2':'p-2','3':'p-3','4':'p-4','5':'p-5','6':'p-6','8':'p-8','10':'p-10','12':'p-12' };
const MARGIN_MAP: Record<string, string>  = { '0':'m-0','1':'m-1','2':'m-2','3':'m-3','4':'m-4','5':'m-5','6':'m-6','8':'m-8','10':'m-10','12':'m-12','auto':'m-auto' };
const MAX_W_MAP: Record<string, string>   = { xs:'max-w-xs',sm:'max-w-sm',md:'max-w-md',lg:'max-w-lg',xl:'max-w-xl','2xl':'max-w-2xl','3xl':'max-w-3xl','4xl':'max-w-4xl','5xl':'max-w-5xl','6xl':'max-w-6xl','7xl':'max-w-7xl',full:'max-w-full' };
const ROUNDED_MAP: Record<string, string> = { sm:'rounded-sm',md:'rounded-md',lg:'rounded-lg',xl:'rounded-xl','2xl':'rounded-2xl',full:'rounded-full' };
const SHADOW_MAP: Record<string, string>  = { sm:'shadow-sm',md:'shadow-md',lg:'shadow-lg',xl:'shadow-xl','2xl':'shadow-2xl' };
const JUSTIFY_MAP: Record<string, string> = { start:'justify-start',end:'justify-end',center:'justify-center',between:'justify-between',around:'justify-around',evenly:'justify-evenly' };
const ITEMS_MAP: Record<string, string>   = { start:'items-start',end:'items-end',center:'items-center',stretch:'items-stretch',baseline:'items-baseline' };
const FLEX_W_MAP: Record<string, string>  = { wrap:'flex-wrap','wrap-reverse':'flex-wrap-reverse',nowrap:'flex-nowrap' };
const WIDTH_MAP: Record<string, string>   = { auto:'w-auto',full:'w-full',screen:'w-screen','1/2':'w-1/2','1/3':'w-1/3','2/3':'w-2/3','1/4':'w-1/4','3/4':'w-3/4' };
const HEIGHT_MAP: Record<string, string>  = { auto:'h-auto',full:'h-full',screen:'h-screen' };
const MIN_H_MAP: Record<string, string>   = { screen:'min-h-screen',full:'min-h-full','0':'min-h-0' };

// Background colors use inline style — user may enter arbitrary color names/values
// that cannot be pre-enumerated for Tailwind v4 scanning.
// Callers should pass backgroundColor as a CSS color value and apply via style prop.

export function generateContainerClasses(props: {
  maxWidth?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  shadow?: string;
  className?: string;
}): string {
  return cn(
    props.maxWidth && MAX_W_MAP[props.maxWidth],
    props.padding  && PADDING_MAP[props.padding],
    props.margin   && MARGIN_MAP[props.margin],
    props.borderRadius && ROUNDED_MAP[props.borderRadius],
    props.shadow   && SHADOW_MAP[props.shadow],
    props.className,
  );
}

export function generateRowClasses(props: {
  gap?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
  className?: string;
}): string {
  return cn(
    'flex',
    props.gap           && GAP_MAP[props.gap],
    props.justifyContent && JUSTIFY_MAP[props.justifyContent],
    props.alignItems    && ITEMS_MAP[props.alignItems],
    props.flexWrap      && FLEX_W_MAP[props.flexWrap],
    props.className,
  );
}

export function generateColumnClasses(props: {
  width?: string;
  gap?: string;
  justifyContent?: string;
  alignItems?: string;
  className?: string;
}): string {
  return cn(
    'flex',
    'flex-col',
    props.width         && WIDTH_MAP[props.width],
    props.gap           && GAP_MAP[props.gap],
    props.justifyContent && JUSTIFY_MAP[props.justifyContent],
    props.alignItems    && ITEMS_MAP[props.alignItems],
    props.className,
  );
}

export function generateSectionClasses(props: {
  padding?: string;
  margin?: string;
  minHeight?: string;
  className?: string;
}): string {
  return cn(
    props.padding   && PADDING_MAP[props.padding],
    props.margin    && MARGIN_MAP[props.margin],
    props.minHeight && MIN_H_MAP[props.minHeight],
    props.className,
  );
}
