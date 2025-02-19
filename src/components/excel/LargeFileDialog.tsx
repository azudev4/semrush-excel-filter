import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileWarning, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LargeFileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  totalSize?: number;
  processing?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const LargeFileDialog: React.FC<LargeFileDialogProps> = ({
  isOpen,
  onOpenChange,
  totalSize = 0,
  processing = true,
}) => {
  const formattedSize = formatFileSize(totalSize);

  useEffect(() => {
    if (!processing && isOpen) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [processing, isOpen, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-amber-50">
            {processing ? (
              <FileWarning className="w-6 h-6 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            )}
          </div>
          <DialogTitle className="text-center text-xl mb-2">
            {processing ? "Processing Large File" : "Processing Complete"}
          </DialogTitle>
          <div className="flex justify-center mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              File Size: {formattedSize}
            </Badge>
          </div>
        </DialogHeader>

        {processing ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Due to the large file size, the application might appear to freeze momentarily.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#004526]/10 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#004526]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">Processing in Progress</h4>
                  <p className="text-sm text-gray-500">
                    Please be patient as we process your data. This may take a few moments.
                  </p>
                </div>
              </div>

              <div className="bg-[#004526]/5 p-4 rounded-lg border border-[#004526]/10">
                <p className="text-sm text-[#004526] font-medium text-center">
                  Do not close or refresh the browser window during processing
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Your file has been successfully processed!
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 