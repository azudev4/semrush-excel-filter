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
      <DialogContent className="sm:max-w-md py-8">
        <DialogHeader className="mb-6">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-6 rounded-full bg-[#004526]/10">
            {processing ? (
              <Loader2 className="w-7 h-7 text-[#004526] animate-spin" />
            ) : (
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            )}
          </div>
          <DialogTitle className="text-center text-xl mb-4">
            {processing ? "Generating Keyword Analysis" : "Analysis Complete"}
          </DialogTitle>
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              Processing {fileCount} {fileCount === 1 ? 'file' : 'files'}
            </Badge>
          </div>
        </DialogHeader>

        {processing ? (
          <div className="space-y-6 px-2">
            <div className="bg-[#004526]/5 p-5 rounded-lg border border-[#004526]/10">
              <p className="text-sm text-[#004526] font-medium text-center">
                Analyzing keywords and generating report...
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 px-2">
              <div className="w-10 h-10 rounded-full bg-[#004526]/10 flex items-center justify-center">
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
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-4 p-5 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
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