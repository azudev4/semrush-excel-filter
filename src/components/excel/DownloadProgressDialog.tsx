import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle2 } from 'lucide-react';

interface DownloadProgressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  processing: boolean;
  fileCount: number;
}

export const DownloadProgressDialog: React.FC<DownloadProgressDialogProps> = ({
  isOpen,
  onOpenChange,
  processing,
  fileCount,
}) => {
  useEffect(() => {
    if (!processing && isOpen) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [processing, isOpen, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-[#004526]/10">
            {processing ? (
              <Loader2 className="w-6 h-6 text-[#004526] animate-spin" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            )}
          </div>
          <DialogTitle className="text-center text-xl mb-2">
            {processing ? "Generating Keyword Analysis" : "Analysis Complete"}
          </DialogTitle>
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Processing {fileCount} {fileCount === 1 ? 'file' : 'files'}
            </Badge>
          </div>
        </DialogHeader>

        {processing ? (
          <div className="space-y-4">
            <div className="bg-[#004526]/5 p-4 rounded-lg border border-[#004526]/10">
              <p className="text-sm text-[#004526] font-medium text-center">
                Analyzing keywords and generating report...
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#004526]/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-[#004526]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Your report will download automatically when complete
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Your keyword analysis has been successfully generated!
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 