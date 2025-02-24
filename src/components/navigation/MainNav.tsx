'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { FileSpreadsheet, FileText } from 'lucide-react';

export const MainNav = () => {
  const pathname = usePathname();

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
      <div className="bg-white/90 backdrop-blur-sm border rounded-full px-2 py-1.5 shadow-md mb-6">
        <nav className="flex items-center gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
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
            );
          })}
        </nav>
      </div>
    </div>
  );
}; 