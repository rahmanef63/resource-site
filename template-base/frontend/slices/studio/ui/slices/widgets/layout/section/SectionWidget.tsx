import React from 'react';
import { cn } from '@/lib/utils';

interface SectionWidgetProps {
  name?: string;
  tag?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'inline-flex';
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  width?: 'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';
  height?: 'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit';
  maxWidth?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  background?: 'none' | 'white' | 'gray-50' | 'gray-100' | 'gray-200' | 'black' | 'transparent';
  backgroundImage?: string;
  backgroundSize?: 'auto' | 'cover' | 'contain';
  backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  border?: boolean;
  borderColor?: 'gray-200' | 'gray-300' | 'gray-400' | 'black' | 'white';
  borderWidth?: '0' | '1' | '2' | '4' | '8';
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: 'auto' | '0' | '10' | '20' | '30' | '40' | '50';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  opacity?: '0' | '25' | '50' | '75' | '100';
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// Static lookup tables — Tailwind v4 requires complete class strings (no dynamic fragments)
const FLEX_DIR: Record<string, string>  = { row:'flex-row', column:'flex-col', 'row-reverse':'flex-row-reverse', 'column-reverse':'flex-col-reverse' };
const JUSTIFY: Record<string, string>   = { start:'justify-start', end:'justify-end', center:'justify-center', between:'justify-between', around:'justify-around', evenly:'justify-evenly' };
const ALIGN: Record<string, string>     = { start:'items-start', end:'items-end', center:'items-center', baseline:'items-baseline', stretch:'items-stretch' };
const WRAP: Record<string, string>      = { nowrap:'flex-nowrap', wrap:'flex-wrap', 'wrap-reverse':'flex-wrap-reverse' };
const GAP: Record<string, string>       = { none:'', xs:'gap-1', sm:'gap-2', md:'gap-4', lg:'gap-6', xl:'gap-8', '2xl':'gap-12' };
const PADDING: Record<string, string>   = { none:'', xs:'p-1', sm:'p-2', md:'p-4', lg:'p-6', xl:'p-8', '2xl':'p-12' };
const MARGIN: Record<string, string>    = { none:'', xs:'m-1', sm:'m-2', md:'m-4', lg:'m-6', xl:'m-8', '2xl':'m-12' };
const WIDTH: Record<string, string>     = { auto:'', full:'w-full', screen:'w-screen', min:'w-min', max:'w-max', fit:'w-fit', '1/2':'w-1/2', '1/3':'w-1/3', '2/3':'w-2/3', '1/4':'w-1/4', '3/4':'w-3/4' };
const HEIGHT: Record<string, string>    = { auto:'', full:'h-full', screen:'h-screen', min:'h-min', max:'h-max', fit:'h-fit' };
const MAX_W: Record<string, string>     = { none:'', xs:'max-w-xs', sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-xl', '2xl':'max-w-2xl', '3xl':'max-w-3xl', '4xl':'max-w-4xl', '5xl':'max-w-5xl', '6xl':'max-w-6xl', '7xl':'max-w-7xl', full:'max-w-full' };
const BG: Record<string, string>        = { none:'', white:'bg-white', 'gray-50':'bg-gray-50', 'gray-100':'bg-gray-100', 'gray-200':'bg-gray-200', black:'bg-black', transparent:'bg-transparent' };
const BG_SIZE: Record<string, string>   = { auto:'bg-auto', cover:'bg-cover', contain:'bg-contain' };
const BG_POS: Record<string, string>    = { center:'bg-center', top:'bg-top', bottom:'bg-bottom', left:'bg-left', right:'bg-right' };
const BG_REPEAT: Record<string, string> = { repeat:'bg-repeat', 'no-repeat':'bg-no-repeat', 'repeat-x':'bg-repeat-x', 'repeat-y':'bg-repeat-y' };
const BORDER_W: Record<string, string>  = { '0':'border-0', '1':'border', '2':'border-2', '4':'border-4', '8':'border-8' };
const BORDER_C: Record<string, string>  = { 'gray-200':'border-gray-200', 'gray-300':'border-gray-300', 'gray-400':'border-gray-400', black:'border-black', white:'border-white' };
const BORDER_S: Record<string, string>  = { solid:'border-solid', dashed:'border-dashed', dotted:'border-dotted', double:'border-double' };
const ROUNDED: Record<string, string>   = { none:'', sm:'rounded-sm', md:'rounded-md', lg:'rounded-lg', xl:'rounded-xl', '2xl':'rounded-2xl', '3xl':'rounded-3xl', full:'rounded-full' };
const SHADOW: Record<string, string>    = { none:'', sm:'shadow-sm', md:'shadow-md', lg:'shadow-lg', xl:'shadow-xl', '2xl':'shadow-2xl' };
const POSITION: Record<string, string>  = { static:'', relative:'relative', absolute:'absolute', fixed:'fixed', sticky:'sticky' };
const Z_INDEX: Record<string, string>   = { auto:'', '0':'z-0', '10':'z-10', '20':'z-20', '30':'z-30', '40':'z-40', '50':'z-50' };
const OVERFLOW: Record<string, string>  = { visible:'', hidden:'overflow-hidden', scroll:'overflow-scroll', auto:'overflow-auto' };
const OPACITY: Record<string, string>   = { '0':'opacity-0', '25':'opacity-25', '50':'opacity-50', '75':'opacity-75', '100':'' };

export const SectionWidget: React.FC<SectionWidgetProps> = ({
  name = "Section",
  tag = "section",
  display = "block",
  direction = "row",
  justify = "start",
  align = "start",
  wrap = "nowrap",
  gap = "none",
  padding = "none",
  margin = "none",
  width = "auto",
  height = "auto",
  maxWidth = "none",
  background = "none",
  backgroundImage = "",
  backgroundSize = "cover",
  backgroundPosition = "center",
  backgroundRepeat = "no-repeat",
  border = false,
  borderColor = "gray-200",
  borderWidth = "1",
  borderStyle = "solid",
  rounded = "none",
  shadow = "none",
  position = "static",
  zIndex = "auto",
  overflow = "visible",
  opacity = "100",
  className = "",
  children,
  ...rest
}) => {
  const Tag = tag as React.ElementType;
  const isFlex = display === 'flex' || display === 'inline-flex';

  const sectionClasses = cn(
    // display (skip 'block' — browser default for section/div)
    display !== 'block' ? display : '',
    // flex layout
    isFlex && FLEX_DIR[direction],
    isFlex && justify !== 'start' && JUSTIFY[justify],
    isFlex && align !== 'start' && ALIGN[align],
    isFlex && wrap !== 'nowrap' && WRAP[wrap],
    // spacing
    GAP[gap],
    PADDING[padding],
    MARGIN[margin],
    // sizing
    WIDTH[width],
    HEIGHT[height],
    MAX_W[maxWidth],
    // background
    BG[background],
    backgroundImage && BG_SIZE[backgroundSize],
    backgroundImage && BG_POS[backgroundPosition],
    backgroundImage && BG_REPEAT[backgroundRepeat],
    // border
    border && BORDER_W[borderWidth],
    border && borderColor !== 'gray-200' && BORDER_C[borderColor],
    border && borderStyle !== 'solid' && BORDER_S[borderStyle],
    // effects
    ROUNDED[rounded],
    SHADOW[shadow],
    POSITION[position],
    Z_INDEX[zIndex],
    OVERFLOW[overflow],
    OPACITY[opacity],
    className,
  );

  const backgroundStyles: React.CSSProperties | undefined = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize, backgroundPosition, backgroundRepeat }
    : undefined;

  return (
    <Tag {...rest} className={sectionClasses} data-section-name={name} style={backgroundStyles}>
      {children}
    </Tag>
  );
};
