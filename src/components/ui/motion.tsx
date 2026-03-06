'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

// Standard Pavlicevits easing curve (award-winning cinematic ease-out)
export const PAVLICEVITS_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const PAVLICEVITS_DURATION = 0.85;

/**
 * Global Stagger Container
 * Used to mechanical space out the entrance of child elements (lists, grids).
 */
export function StaggerContainer({
    children,
    staggerDelay = 0.2, // Increased delay for distinct visual separation
    className = '',
    viewportAmount = 0.2,
}: {
    children: ReactNode;
    staggerDelay?: number;
    className?: string;
    viewportAmount?: number | 'some' | 'all';
}) {
    const shouldReduceMotion = useReducedMotion();

    const variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
            },
        },
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: viewportAmount }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * The standard "Pavlicevits Fade-Up"
 * Provides a unified structural feel across the site.
 */
export function FadeInUp({
    children,
    className = '',
    delay = 0,
    viewportAmount = 0.2,
    inStaggerGroup = false,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    viewportAmount?: number | 'some' | 'all';
    inStaggerGroup?: boolean;
}) {
    const shouldReduceMotion = useReducedMotion();

    const variants = {
        hidden: { 
            opacity: 0, 
            y: shouldReduceMotion ? 0 : 30,
            filter: shouldReduceMotion ? 'blur(0px)' : 'blur(10px)'
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: shouldReduceMotion ? 0.2 : PAVLICEVITS_DURATION,
                ease: PAVLICEVITS_EASE,
                delay,
            },
        },
    };

    if (inStaggerGroup) {
        return (
            <motion.div variants={variants} className={className}>
                {children}
            </motion.div>
        );
    }

    return (
        <motion.div 
            variants={variants} 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: viewportAmount }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Foolproof Indexed Fade-In-Up
 * Guarantees staggering by calculating delay explicitly based on an index.
 */
export function IndexedFadeInUp({
    children,
    className = '',
    index = 0,
    baseDelay = 0,
    staggerDelay = 0.25,
    viewportAmount = 0.2,
}: {
    children: ReactNode;
    className?: string;
    index?: number;
    baseDelay?: number;
    staggerDelay?: number;
    viewportAmount?: number | 'some' | 'all';
}) {
    const shouldReduceMotion = useReducedMotion();

    const variants = {
        hidden: { 
            opacity: 0, 
            y: shouldReduceMotion ? 0 : 30,
            filter: shouldReduceMotion ? 'blur(0px)' : 'blur(10px)'
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: shouldReduceMotion ? 0.2 : PAVLICEVITS_DURATION,
                ease: PAVLICEVITS_EASE,
                delay: baseDelay + (index * staggerDelay),
            },
        },
    };

    return (
        <motion.div 
            variants={variants} 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: viewportAmount }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Image Reveal Animation
 * Specifically for large hero or featured images.
 * Scales down slightly while fading in and removing blur.
 */
export function ImageReveal({
    children,
    className = '',
    delay = 0,
    viewportAmount = 0.2,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    viewportAmount?: number | 'some' | 'all';
}) {
    const shouldReduceMotion = useReducedMotion();

    const variants = {
        hidden: { 
            opacity: 0, 
            scale: shouldReduceMotion ? 1 : 1.05,
            filter: shouldReduceMotion ? 'blur(0px)' : 'blur(15px)'
        },
        visible: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                duration: shouldReduceMotion ? 0.2 : PAVLICEVITS_DURATION + 0.4, // Slower for grand images
                ease: PAVLICEVITS_EASE,
                delay,
            },
        },
    };

    return (
        <motion.div 
            variants={variants} 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: viewportAmount }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
