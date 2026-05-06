import React from 'react';
import { cn } from '@/lib/utils';

interface TextWidgetProps {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
  content?: string;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
  fontWeight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  textColor?: 'inherit' | 'current' | 'transparent' | 'black' | 'white' | 'gray-50' | 'gray-100' | 'gray-200' | 'gray-300' | 'gray-400' | 'gray-500' | 'gray-600' | 'gray-700' | 'gray-800' | 'gray-900' | 'red-500' | 'blue-500' | 'green-500' | 'yellow-500' | 'purple-500' | 'pink-500' | 'indigo-500';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  fontFamily?: 'sans' | 'serif' | 'mono';
  fontStyle?: 'normal' | 'italic';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'none' | 'white' | 'gray-50' | 'gray-100' | 'gray-200' | 'black' | 'transparent';
  border?: boolean;
  borderColor?: 'gray-200' | 'gray-300' | 'gray-400' | 'black' | 'white';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  truncate?: boolean;
  whitespace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap';
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// Static lookup tables — Tailwind v4 requires complete class strings (no dynamic fragments)
const FONT_SIZE: Record<string, string>    = { xs:'text-xs', sm:'text-sm', base:'', lg:'text-lg', xl:'text-xl', '2xl':'text-2xl', '3xl':'text-3xl', '4xl':'text-4xl', '5xl':'text-5xl', '6xl':'text-6xl', '7xl':'text-7xl', '8xl':'text-8xl', '9xl':'text-9xl' };
const FONT_WEIGHT: Record<string, string>  = { thin:'font-thin', extralight:'font-extralight', light:'font-light', normal:'', medium:'font-medium', semibold:'font-semibold', bold:'font-bold', extrabold:'font-extrabold', black:'font-black' };
const TEXT_COLOR: Record<string, string>   = { inherit:'text-inherit', current:'text-current', transparent:'text-transparent', black:'text-black', white:'text-white', 'gray-50':'text-gray-50', 'gray-100':'text-gray-100', 'gray-200':'text-gray-200', 'gray-300':'text-gray-300', 'gray-400':'text-gray-400', 'gray-500':'text-gray-500', 'gray-600':'text-gray-600', 'gray-700':'text-gray-700', 'gray-800':'text-gray-800', 'gray-900':'text-gray-900', 'red-500':'text-red-500', 'blue-500':'text-blue-500', 'green-500':'text-green-500', 'yellow-500':'text-yellow-500', 'purple-500':'text-purple-500', 'pink-500':'text-pink-500', 'indigo-500':'text-indigo-500' };
const TEXT_ALIGN: Record<string, string>   = { left:'', center:'text-center', right:'text-right', justify:'text-justify' };
const TRANSFORM: Record<string, string>    = { none:'', uppercase:'uppercase', lowercase:'lowercase', capitalize:'capitalize' };
const DECORATION: Record<string, string>   = { none:'', underline:'underline', overline:'overline', 'line-through':'line-through' };
const TRACKING: Record<string, string>     = { tighter:'tracking-tighter', tight:'tracking-tight', normal:'', wide:'tracking-wide', wider:'tracking-wider', widest:'tracking-widest' };
const LEADING: Record<string, string>      = { none:'leading-none', tight:'leading-tight', snug:'leading-snug', normal:'', relaxed:'leading-relaxed', loose:'leading-loose' };
const FONT_FAMILY: Record<string, string>  = { sans:'', serif:'font-serif', mono:'font-mono' };
const FONT_STYLE: Record<string, string>   = { normal:'', italic:'italic' };
const MARGIN: Record<string, string>       = { none:'', xs:'m-1', sm:'m-2', md:'m-4', lg:'m-8', xl:'m-12', '2xl':'m-16' };
const PADDING: Record<string, string>      = { none:'', xs:'p-1', sm:'p-2', md:'p-4', lg:'p-8', xl:'p-12', '2xl':'p-16' };
const BG: Record<string, string>           = { none:'', white:'bg-white', 'gray-50':'bg-gray-50', 'gray-100':'bg-gray-100', 'gray-200':'bg-gray-200', black:'bg-black', transparent:'bg-transparent' };
const BORDER_C: Record<string, string>     = { 'gray-200':'border-gray-200', 'gray-300':'border-gray-300', 'gray-400':'border-gray-400', black:'border-black', white:'border-white' };
const ROUNDED: Record<string, string>      = { none:'', sm:'rounded-sm', md:'rounded-md', lg:'rounded-lg', xl:'rounded-xl', full:'rounded-full' };
const SHADOW: Record<string, string>       = { none:'', sm:'shadow-sm', md:'shadow-md', lg:'shadow-lg', xl:'shadow-xl' };
const MAX_W: Record<string, string>        = { none:'', xs:'max-w-xs', sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-xl', '2xl':'max-w-2xl', '3xl':'max-w-3xl', '4xl':'max-w-4xl', '5xl':'max-w-5xl', '6xl':'max-w-6xl', '7xl':'max-w-7xl', full:'max-w-full' };
const WHITESPACE: Record<string, string>   = { normal:'', nowrap:'whitespace-nowrap', pre:'whitespace-pre', 'pre-line':'whitespace-pre-line', 'pre-wrap':'whitespace-pre-wrap' };

export const TextWidget: React.FC<TextWidgetProps> = ({
  tag = "p",
  content = "Text content",
  fontSize = "base",
  fontWeight = "normal",
  textColor = "gray-900",
  textAlign = "left",
  textTransform = "none",
  textDecoration = "none",
  letterSpacing = "normal",
  lineHeight = "normal",
  fontFamily = "sans",
  fontStyle = "normal",
  margin = "none",
  padding = "none",
  background = "none",
  border = false,
  borderColor = "gray-200",
  borderRadius = "none",
  shadow = "none",
  maxWidth = "none",
  truncate = false,
  whitespace = "normal",
  className = "",
  children,
  ...rest
}) => {
  const Tag = tag as React.ElementType;
  const hasChildren = React.Children.count(children) > 0;

  const textClasses = cn(
    FONT_SIZE[fontSize],
    FONT_WEIGHT[fontWeight],
    textColor !== 'gray-900' && TEXT_COLOR[textColor],
    TEXT_ALIGN[textAlign],
    TRANSFORM[textTransform],
    DECORATION[textDecoration],
    TRACKING[letterSpacing],
    LEADING[lineHeight],
    FONT_FAMILY[fontFamily],
    FONT_STYLE[fontStyle],
    MARGIN[margin],
    PADDING[padding],
    BG[background],
    border && 'border',
    border && borderColor !== 'gray-200' && BORDER_C[borderColor],
    ROUNDED[borderRadius],
    SHADOW[shadow],
    MAX_W[maxWidth],
    truncate && 'truncate',
    WHITESPACE[whitespace],
    className,
  );

  return (
    <Tag {...rest} className={textClasses}>
      {hasChildren ? children : content}
    </Tag>
  );
};
