import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, FolderOpen } from 'lucide-react';
import { LargeFileDialog } from './LargeFileDialog';

interface FileUploadProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentSheetName: string;
  setCurrentSheetName: (name: string) => void;
  processing: boolean;
}

const ACCEPTED_FILE_TYPES = ['.xlsx', '.xls', '.csv'];
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB threshold

export const FileUpload: React.FC<FileUploadProps> = ({
  handleFileUpload,
  currentSheetName,
  setCurrentSheetName,
  processing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showLargeFileDialog, setShowLargeFileDialog] = useState(false);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  useEffect(() => {
    if (!processing && showLargeFileDialog) {
      setShowLargeFileDialog(false);
    }
  }, [processing, showLargeFileDialog]);

  const isValidFileType = (filename: string): boolean => {
    return ACCEPTED_FILE_TYPES.some(type => 
      filename.toLowerCase().endsWith(type)
    );
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    if (totalSize > LARGE_FILE_THRESHOLD) {
      setTotalFileSize(totalSize);
      setShowLargeFileDialog(true);
    }
    
    handleFileUpload(e);
  };

  const handleDrag = (e: React.DragEvent<HTMLLabelElement>, entering: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (entering) {
      dragCounter.current += 1;
    } else {
      dragCounter.current -= 1;
    }

    setIsDragging(dragCounter.current > 0);
  };

  const processEntry = async (entry: FileSystemEntry): Promise<File[]> => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        (entry as FileSystemFileEntry).file((file) => {
          resolve(isValidFileType(file.name) ? [file] : []);
        });
      });
    } 
    
    if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      return new Promise((resolve) => {
        dirReader.readEntries(async (entries) => {
          const files = await Promise.all(
            entries.map((entry) => processEntry(entry))
          );
          resolve(files.flat());
        });
      });
    }
    
    return [];
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const items = e.dataTransfer.items;
    if (!items?.length) return;

    const allFiles: File[] = [];
    
    for (const item of Array.from(items)) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        const files = await processEntry(entry);
        allFiles.push(...files);
      }
    }

    if (allFiles.length > 0) {
      const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > LARGE_FILE_THRESHOLD) {
        setTotalFileSize(totalSize);
        setShowLargeFileDialog(true);
      }

      const dataTransfer = new DataTransfer();
      allFiles.forEach(file => dataTransfer.items.add(file));
      
      const event = {
        target: {
          files: dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileUpload(event);
    }
  };

  const handleFolderSelect = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  return (
    <div className="border-t pt-6">
      <LargeFileDialog 
        isOpen={showLargeFileDialog} 
        onOpenChange={setShowLargeFileDialog}
        totalSize={totalFileSize}
        processing={processing}
      />
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-[#004526] rounded-full" />
          <h3 className="text-base font-medium">Upload Excel Files</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_FILE_TYPES.join(',')}
                onChange={handleFiles}
                id="file-upload"
                multiple
              />
              <input
                ref={folderInputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_FILE_TYPES.join(',')}
                onChange={handleFiles}
                id="folder-upload"
                multiple
              />
              <label 
                htmlFor="file-upload" 
                className={`
                  flex flex-col items-center justify-center w-full h-40 px-4 
                  transition bg-white border-2 border-dashed rounded-lg 
                  cursor-pointer focus:outline-none
                  ${isDragging 
                    ? 'border-[#004526] border-[3px] bg-[#004526]/10' 
                    : 'border-[#004526]/20 hover:border-[#004526]/40 hover:bg-[#004526]/5'
                  }
                `}
                onDragEnter={(e) => handleDrag(e, true)}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => handleDrag(e, false)}
                onDrop={handleDrop}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Upload className="w-8 h-8 text-[#004526]" />
                  <FolderOpen className="w-8 h-8 text-[#004526]" />
                </div>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Excel or CSV files and folders
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#004526] hover:text-[#004526]/80 font-medium"
                  >
                    Select Files
                  </button>
                  <span className="text-xs text-gray-400">or</span>
                  <button
                    type="button"
                    onClick={handleFolderSelect}
                    className="text-xs text-[#004526] hover:text-[#004526]/80 font-medium"
                  >
                    Choose Folder
                  </button>
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