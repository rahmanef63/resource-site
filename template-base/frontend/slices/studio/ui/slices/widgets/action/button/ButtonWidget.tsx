import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonWidgetProps {
  text?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'primary' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'none' | 'bounce' | 'pulse' | 'ping' | 'spin';
  gradient?: boolean;
  borderWidth?: '0' | '1' | '2' | '4' | '8';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  children?: React.ReactNode;
  [key: string]: any;
}

// Static lookup tables — Tailwind v4 requires complete class strings (no dynamic fragments)
const VARIANT_CLASSES: Record<string, string> = {
  default:     'border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
  primary:     'border-slate-900 bg-slate-900 text-white hover:bg-slate-800',
  secondary:   'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200',
  destructive: 'border-red-700 bg-red-600 text-white hover:bg-red-700',
  outline:     'border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50',
  ghost:       'border-transparent bg-transparent text-slate-900 hover:bg-slate-100',
  link:        'border-transparent bg-transparent text-blue-700 hover:text-blue-800 hover:underline',
};
const SIZE_CLASSES: Record<string, string> = {
  xs: 'h-6 px-2 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
};
const ROUNDED_CLASSES: Record<string, string> = {
  none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md',
  lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full',
};
const SHADOW_CLASSES: Record<string, string> = {
  none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl',
};
const ANIMATION_CLASSES: Record<string, string> = {
  none: '', bounce: 'animate-bounce', pulse: 'animate-pulse',
  ping: 'animate-ping', spin: 'animate-spin',
};
const PADDING_CLASSES: Record<string, string> = {
  none: '', xs: 'p-1', sm: 'p-2', md: 'p-3', lg: 'p-4', xl: 'p-6',
};
const MARGIN_CLASSES: Record<string, string> = {
  none: '', xs: 'm-1', sm: 'm-2', md: 'm-3', lg: 'm-4', xl: 'm-6',
};
const TEXT_ALIGN_CLASSES: Record<string, string> = {
  left: 'text-left', center: '', right: 'text-right',
};
const FONT_WEIGHT_CLASSES: Record<string, string> = {
  normal: 'font-normal', medium: '', semibold: 'font-semibold', bold: 'font-bold',
};
const TEXT_TRANSFORM_CLASSES: Record<string, string> = {
  none: '', uppercase: 'uppercase', lowercase: 'lowercase', capitalize: 'capitalize',
};
const LETTER_SPACING_CLASSES: Record<string, string> = {
  tighter: 'tracking-tighter', tight: 'tracking-tight', normal: '',
  wide: 'tracking-wide', wider: 'tracking-wider', widest: 'tracking-widest',
};
const BORDER_W_CLASSES: Record<string, string> = {
  '0': 'border-0', '1': '', '2': 'border-2', '4': 'border-4', '8': 'border-8',
};

export const ButtonWidget: React.FC<ButtonWidgetProps> = ({
  text = "Button",
  variant = "default",
  size = "md",
  href = "",
  className = "",
  icon = "",
  iconPosition = "left",
  disabled = false,
  fullWidth = false,
  rounded = "md",
  shadow = "sm",
  animation = "none",
  gradient = false,
  borderWidth = "1",
  padding = "md",
  margin = "none",
  textAlign = "center",
  fontWeight = "medium",
  textTransform = "none",
  letterSpacing = "normal",
  children,
  ...rest
}) => {
  const ICON_SIZE_CLASSES: Record<string, string> = {
    xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6', xl: 'w-7 h-7',
  };

  const renderIcon = () => {
    if (!icon) return null;
    return <span className={cn('flex-shrink-0', ICON_SIZE_CLASSES[size] ?? 'w-5 h-5')}>{icon}</span>;
  };

  const renderContent = () => {
    const hasChildren = React.Children.count(children) > 0;
    const content = hasChildren ? children : text;

    if (iconPosition === 'top') {
      return (
        <div className="flex flex-col items-center gap-1">
          {renderIcon()}
          <span>{content}</span>
        </div>
      );
    }
    if (iconPosition === 'bottom') {
      return (
        <div className="flex flex-col items-center gap-1">
          <span>{content}</span>
          {renderIcon()}
        </div>
      );
    }
    if (iconPosition === 'right') {
      return (
        <div className="flex items-center gap-2">
          <span className="flex-1">{content}</span>
          {renderIcon()}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        {renderIcon()}
        <span className="flex-1">{content}</span>
      </div>
    );
  };

  const buttonClasses = cn(
    "inline-flex items-center justify-center border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default,
    SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
    ROUNDED_CLASSES[rounded] ?? 'rounded-md',
    SHADOW_CLASSES[shadow] ?? 'shadow-sm',
    ANIMATION_CLASSES[animation] ?? '',
    PADDING_CLASSES[padding] ?? '',
    MARGIN_CLASSES[margin] ?? '',
    TEXT_ALIGN_CLASSES[textAlign] ?? '',
    FONT_WEIGHT_CLASSES[fontWeight] ?? '',
    TEXT_TRANSFORM_CLASSES[textTransform] ?? '',
    LETTER_SPACING_CLASSES[letterSpacing] ?? '',
    BORDER_W_CLASSES[borderWidth] ?? '',
    fullWidth && "w-full",
    gradient && variant === 'primary' && "border-blue-700 bg-gradient-to-r from-blue-700 to-cyan-600 text-white",
    gradient && variant === 'destructive' && "border-red-700 bg-gradient-to-r from-red-700 to-orange-600 text-white",
    className,
  );

  if (href && !disabled) {
    return (
      <Link {...rest} href={href} className={buttonClasses}>
        {renderContent()}
      </Link>
    );
  }

  return (
    <button {...rest} className={buttonClasses} disabled={disabled}>
      {renderContent()}
    </button>
  );
};
