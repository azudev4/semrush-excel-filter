import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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
  );
}; 