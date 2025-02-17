import React from 'react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload } from 'lucide-react';
import { ExtendedInputProps } from '@/lib/constants';

interface FileUploadProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentSheetName: string;
  setCurrentSheetName: (name: string) => void;
  processing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  handleFileUpload,
  currentSheetName,
  setCurrentSheetName,
  processing,
}) => {
  return (
    <div className="border-t pt-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-[#004526] rounded-full" />
          <h3 className="text-base font-medium">Upload Excel Files</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                id="file-upload"
                multiple
              />
              <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-[#004526]/20 border-dashed rounded-lg cursor-pointer hover:border-[#004526]/40 focus:outline-none group-hover:border-[#004526]/40 group-hover:bg-[#004526]/5"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-[#004526] group-hover:text-[#004526]" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Multiple Excel or CSV files
                  </p>
                </div>
              </label>
            </div>

            <div className="relative group">
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                id="folder-upload"
                {...{ webkitdirectory: "", directory: "" } as ExtendedInputProps}
              />
              <label 
                htmlFor="folder-upload" 
                className="flex flex-col items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-[#004526]/20 border-dashed rounded-lg cursor-pointer hover:border-[#004526]/40 focus:outline-none group-hover:border-[#004526]/40 group-hover:bg-[#004526]/5"
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Select a folder</span> containing Excel files
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    All Excel and CSV files in the folder will be processed
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Sheet Name (Optional)
              </label>
              <Input
                type="text"
                value={currentSheetName}
                onChange={(e) => setCurrentSheetName(e.target.value)}
                placeholder="Will use filename if not specified"
                className="w-full focus-visible:ring-[#004526]"
              />
            </div>
            {processing && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Processing files...</p>
                <Progress value={33} className="w-full bg-[#004526]/10" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 