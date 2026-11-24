import React from 'react';
import { motion } from 'framer-motion';

export const EASE_OUT = [0.22, 1, 0.36, 1];

export function Reveal({
    children,
    className = '',
    delay = 0,
    duration = 0.55,
    y = 22,
    x = 0,
    once = true,
    amount = 0.15,
    immediate = false,
}) {
    const hiddenState = { opacity: 0, y, x };
    const visibleState = { opacity: 1, y: 0, x: 0 };
    const transition = { duration, delay, ease: EASE_OUT };

    if (immediate) {
        return (
            <motion.div
                initial={hiddenState}
                animate={visibleState}
                transition={transition}
                className={className}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={hiddenState}
            whileInView={visibleState}
            viewport={{ once, amount }}
            transition={transition}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerGroup({
    children,
    className = '',
    stagger = 0.08,
    delayChildren = 0.05,
    immediate = false,
}) {
    const variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: stagger,
                delayChildren,
            },
        },
    };

    if (immediate) {
        return (
            <motion.div
                variants={variants}
                initial="hidden"
                animate="visible"
                className={className}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = '', y = 20 }) {
    const itemVariants = {
        hidden: { opacity: 0, y },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.52, ease: EASE_OUT },
        },
    };

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}

export default Reveal;