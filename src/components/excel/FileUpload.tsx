import React, { useState, useRef, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Upload, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LargeFileDialog } from './LargeFileDialog';

interface FileUploadProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  processing: boolean;
}

const ACCEPTED_FILE_TYPES = ['.xlsx', '.xls', '.csv'];
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB threshold

export const FileUpload: React.FC<FileUploadProps> = ({
  handleFileUpload,
  processing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [showLargeFileDialog, setShowLargeFileDialog] = useState(false);
  const [totalFileSize, setTotalFileSize] = useState(0);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  useEffect(() => {
    if (processing) {
      // Simulate progress for better UX
      const interval = setInterval(() => {
        setProgressValue(prev => {
          // Randomly increase but never reach 100% until complete
          const increment = Math.random() * 15;
          const newValue = prev + increment;
          return Math.min(newValue, 95);
        });
      }, 600);
      
      return () => {
        clearInterval(interval);
        // Reset to 100 when done
        setProgressValue(100);
      };
    } else {
      // Make sure it hits 100 when processing is done
      if (progressValue > 0 && progressValue < 100) {
        setProgressValue(100);
        
        // Reset after animation completes
        const timeout = setTimeout(() => {
          setProgressValue(0);
        }, 1000);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [processing, progressValue]);

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

    // Check for files directly first (simpler approach)
    const droppedFiles = Array.from(e.dataTransfer.files || [])
      .filter(file => isValidFileType(file.name));
    
    if (droppedFiles.length > 0) {
      const totalSize = droppedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > LARGE_FILE_THRESHOLD) {
        setTotalFileSize(totalSize);
        setShowLargeFileDialog(true);
      }

      // Prepare the files for handling
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        droppedFiles.forEach(file => dt.items.add(file));
        
        // Update the file input value
        fileInputRef.current.files = dt.files;
        
        // Call the handler directly with the input element
        handleFileUpload({
          target: fileInputRef.current,
          currentTarget: fileInputRef.current,
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      }
      return;
    }
    
    // If no direct files, try using the entries API for directories
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const items = Array.from(e.dataTransfer.items);
      const allFiles: File[] = [];
      
      // Process each item
      for (const item of items) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          const entryFiles = await processEntry(entry);
          allFiles.push(...entryFiles);
        }
      }

      if (allFiles.length > 0) {
        const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > LARGE_FILE_THRESHOLD) {
          setTotalFileSize(totalSize);
          setShowLargeFileDialog(true);
        }

        if (fileInputRef.current) {
          const dt = new DataTransfer();
          allFiles.forEach(file => dt.items.add(file));
          
          // Update the file input value
          fileInputRef.current.files = dt.files;
          
          // Call the handler directly
          handleFileUpload({
            target: fileInputRef.current,
            currentTarget: fileInputRef.current,
          } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
      }
    }
  };

  const handleFolderSelect = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  return (
    <>
      <motion.div 
        className="border-t pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-8">
          <motion.div 
            className="flex items-center gap-2 mb-4" 
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <div className="h-6 w-1 bg-[#004526] rounded-full" />
            <h3 className="text-base font-medium">Upload Excel Files</h3>
          </motion.div>
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
              <motion.label 
                htmlFor="file-upload" 
                className={`
                  flex flex-col items-center justify-center w-full h-40 px-4 
                  bg-white border-2 border-dashed rounded-lg 
                  cursor-pointer focus:outline-none
                  transition-all duration-75 ease-out
                  hover:border-[#004526]/40 hover:bg-[#004526]/5 hover:shadow-md
                  ${isDragging 
                    ? 'border-[#004526] border-[3px] bg-[#004526]/10' 
                    : 'border-[#004526]/20'
                  }
                `}
                onDragEnter={(e) => handleDrag(e, true)}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => handleDrag(e, false)}
                onDrop={handleDrop}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Upload className="w-8 h-8 text-[#004526]" />
                  <FolderOpen className="w-8 h-8 text-[#004526]" />
                </motion.div>
                <motion.p 
                  className="mb-2 text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </motion.p>
                <motion.p 
                  className="text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  Excel or CSV files and folders
                </motion.p>
                <motion.div 
                  className="flex items-center gap-2 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#004526] hover:text-[#004526]/80 font-medium transition-colors duration-75"
                  >
                    Select Files
                  </button>
                  <span className="text-xs text-gray-400">or</span>
                  <button
                    type="button"
                    onClick={handleFolderSelect}
                    className="text-xs text-[#004526] hover:text-[#004526]/80 font-medium transition-colors duration-75"
                  >
                    Choose Folder
                  </button>
                </motion.div>
              </motion.label>
            </div>
            
            <AnimatePresence>
              {processing && (
                <motion.div 
                  className="mt-4 space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Processing files...</p>
                    <p className="text-xs text-gray-500">{Math.round(progressValue)}%</p>
                  </div>
                  <div className="relative">
                    <Progress value={progressValue} className="w-full bg-[#004526]/10" />
                    <motion.div 
                      className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                        transition: {
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear"
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      
      <LargeFileDialog
        isOpen={showLargeFileDialog}
        onOpenChange={setShowLargeFileDialog}
        totalSize={totalFileSize}
        processing={processing}
      />
    </>
  );
};