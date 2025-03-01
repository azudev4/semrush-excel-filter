import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from 'framer-motion';

interface DownloadSectionProps {
  outputFilename: string;
  setOutputFilename: (name: string) => void;
  includeSummarySheet: boolean;
  setIncludeSummarySheet: (include: boolean) => void;
  onDownload: () => void;
  disabled: boolean;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  outputFilename,
  setOutputFilename,
  includeSummarySheet,
  setIncludeSummarySheet,
  onDownload,
  disabled,
}) => {
  return (
    <div className="border-t pt-6">
      <motion.div 
        className="flex items-center gap-2 mb-4" 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="h-6 w-1 bg-[#004526] rounded-full" />
        <h3 className="text-base font-medium">Output Options</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Data Processing Rules</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>The following filters are applied to your data:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Removes rows with volume less than the minimum specified</li>
                  <li>Excludes columns: CPC, SERP Features, Keyword Difficulty</li>
                  <li>Only keeps the Keyword, Intent, and Volume columns</li>
                </ul>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>

      <div className="flex gap-4 items-center bg-[#004526]/5 p-4 rounded-lg border border-[#004526]/20">
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Output File Name
            </label>
            <Input
              type="text"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="Name for the combined file"
              className="w-full focus-visible:ring-[#004526]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeSummary"
              checked={includeSummarySheet}
              onChange={(e) => setIncludeSummarySheet(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#004526] focus:ring-[#004526]"
            />
            <label htmlFor="includeSummary" className="text-sm text-gray-600">
              Include summary sheet with total volumes
            </label>
          </div>
        </div>
        <Button 
          className="whitespace-nowrap h-full px-6 bg-[#004526] hover:bg-[#004526]/90" 
          onClick={onDownload}
          disabled={disabled}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Combined File
        </Button>
      </div>
    </div>
  );
}; 