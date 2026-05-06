/**
 * Studio Animation Presets
 *
 * Pre-built Framer Motion variants that can be applied to any canvas node
 * via the `animation` prop in node properties.
 *
 * Usage in schema:
 *   { type: 'div', props: { animation: 'fadeUp', animationDelay: 0.1, ... } }
 */
"use client";

import React from 'react';
import { motion, type Variants, type MotionProps } from 'framer-motion';

// ─── Preset Variants ─────────────────────────────────────────────────────────

export const ANIMATION_PRESETS: Record<string, Variants> = {
    none: {},

    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },

    fadeUp: {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
    },

    fadeDown: {
        hidden: { opacity: 0, y: -24 },
        visible: { opacity: 1, y: 0 },
    },

    fadeLeft: {
        hidden: { opacity: 0, x: 32 },
        visible: { opacity: 1, x: 0 },
    },

    fadeRight: {
        hidden: { opacity: 0, x: -32 },
        visible: { opacity: 1, x: 0 },
    },

    scaleIn: {
        hidden: { opacity: 0, scale: 0.85 },
        visible: { opacity: 1, scale: 1 },
    },

    scaleUp: {
        hidden: { opacity: 0, scale: 0.6 },
        visible: { opacity: 1, scale: 1 },
    },

    slideUp: {
        hidden: { y: 48, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    },

    bounceIn: {
        hidden: { opacity: 0, scale: 0.3 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 15 },
        },
    },

    rotateIn: {
        hidden: { opacity: 0, rotate: -10, scale: 0.9 },
        visible: { opacity: 1, rotate: 0, scale: 1 },
    },

    flipX: {
        hidden: { opacity: 0, rotateX: 90 },
        visible: { opacity: 1, rotateX: 0 },
    },

    flipY: {
        hidden: { opacity: 0, rotateY: 90 },
        visible: { opacity: 1, rotateY: 0 },
    },

    blur: {
        hidden: { opacity: 0, filter: 'blur(12px)' },
        visible: { opacity: 1, filter: 'blur(0px)' },
    },

    pulse: {
        hidden: { opacity: 1 },
        visible: {
            opacity: [1, 0.5, 1],
            transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
        },
    },

    shake: {
        hidden: { x: 0 },
        visible: {
            x: [0, -6, 6, -4, 4, -2, 2, 0],
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    },

    wiggle: {
        hidden: { rotate: 0 },
        visible: {
            rotate: [0, -3, 3, -3, 3, 0],
            transition: { duration: 0.5, ease: 'easeInOut' },
        },
    },

    float: {
        hidden: { y: 0 },
        visible: {
            y: [-6, 0, -6],
            transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
        },
    },

    typewriter: {
        hidden: { width: '0%' },
        visible: { width: '100%' },
    },
};

export const ANIMATION_PRESET_KEYS = Object.keys(ANIMATION_PRESETS) as string[];

// Easing options shown in inspector
export const EASING_OPTIONS = [
    'easeOut', 'easeIn', 'easeInOut', 'linear',
    'circOut', 'circIn', 'backOut', 'anticipate',
];

// ─── AnimationWrapper component ───────────────────────────────────────────────

interface AnimationWrapperProps {
    animation?: string;
    animationDelay?: number;
    animationDuration?: number;
    animationEasing?: string;
    animationOnce?: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}

/**
 * Wraps any node with a Framer Motion animation when `animation` prop is set.
 * Uses `whileInView` so the animation fires when the element enters the viewport.
 */
export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
    animation = 'none',
    animationDelay = 0,
    animationDuration = 0.5,
    animationEasing = 'easeOut',
    animationOnce = true,
    children,
    style,
    className,
}) => {
    const variants = ANIMATION_PRESETS[animation];
    if (!variants || animation === 'none' || Object.keys(variants).length === 0) {
        return <>{children}</>;
    }

    const transition: MotionProps['transition'] = {
        duration: animationDuration,
        delay: animationDelay,
        ease: animationEasing as any,
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: animationOnce, amount: 0.15 }}
            variants={variants}
            transition={transition}
            style={style}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/** Inspector field definitions for animation props — add to any widget's inspector.fields */
export const ANIMATION_INSPECTOR_FIELDS = [
    {
        key: 'animation',
        label: 'Animation',
        type: 'select' as const,
        options: ANIMATION_PRESET_KEYS,
    },
    {
        key: 'animationDelay',
        label: 'Delay (s)',
        type: 'text' as const,
        placeholder: '0',
    },
    {
        key: 'animationDuration',
        label: 'Duration (s)',
        type: 'text' as const,
        placeholder: '0.5',
    },
    {
        key: 'animationEasing',
        label: 'Easing',
        type: 'select' as const,
        options: EASING_OPTIONS,
    },
    {
        key: 'animationOnce',
        label: 'Run Once',
        type: 'switch' as const,
    },
];
