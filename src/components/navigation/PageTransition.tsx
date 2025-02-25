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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ 
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smooth easing
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};