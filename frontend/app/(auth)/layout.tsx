"use client"

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

const containerVariants: Variants = {
    initial: { 
      opacity: 0,
      y: 100
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    },
    exit: { 
      opacity: 0,
      y: -100,
      transition: {
        duration: 0.4,
        ease: [0.55, 0.06, 0.68, 0.19] as [number, number, number, number]
      }
    }
};

const itemVariants: Variants = {
    initial: { 
      opacity: 0,
      y: 30
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
};

export { itemVariants };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}