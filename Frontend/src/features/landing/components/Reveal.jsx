import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Shared scroll reveal for landing-page sections and cards.
 * Keeps the same 24px lift everywhere while respecting reduced motion.
 */
export const Reveal = ({ children, className = '', delay = 0, ...props }) => {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduceMotion ? 0 : 0.5,
                delay: reduceMotion ? 0 : delay,
                ease: [0.22, 1, 0.36, 1]
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Reveal;
