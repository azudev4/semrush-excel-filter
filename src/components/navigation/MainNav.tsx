'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { FileSpreadsheet, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const MainNav = () => {
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHasScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== prevPath) {
      if (pathname === '/') {
        // Going left
      } else {
        // Going right
      }
      setPrevPath(pathname);
    }
  }, [pathname, prevPath]);

  const navigation = [
    {
      name: 'KSUG Formatter',
      href: '/',
      icon: FileSpreadsheet,
    },
    {
      name: 'KW Relevancy',
      href: '/kw-relevancy',
      icon: FileText,
    }
  ];

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        className={cn(
          "backdrop-blur-sm border rounded-full px-2 py-1.5 mb-6 transition-all duration-300",
          hasScrolled 
            ? "bg-white shadow-xl border-white/70 translate-y-1 scale-[1.03]" 
            : "bg-white/90 shadow-md border-white/50"
        )}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <nav className="flex items-center gap-1">
          {navigation.map((item, i) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors",
                    isActive
                      ? "text-[#004526] bg-[#004526]/5"
                      : "text-gray-600 hover:text-[#004526] hover:bg-[#004526]/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </motion.div>
    </div>
  );
};