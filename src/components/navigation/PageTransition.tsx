'use client'
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{
          opacity: 0, 
          y: 8,
          transition: {
            duration: 0.15
          }
        }}
        animate={{
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
          }
        }}
        exit={{
          opacity: 0, 
          y: -8,
          transition: {
            duration: 0.2,
            ease: [0.22, 0.61, 0.36, 1]
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};