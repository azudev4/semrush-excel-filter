import React from 'react';
import { motion } from 'framer-motion';

interface ToolIntroProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const ToolIntro: React.FC<ToolIntroProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <motion.div 
      className="mb-8 bg-white/50 rounded-xl border border-[#004526]/10 p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-5">
        <div className="h-12 w-12 rounded-full bg-[#004526]/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="space-y-2">
          <motion.h2 
            className="text-xl font-semibold text-[#004526]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-gray-600 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};