'use client'

import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
} from '@/components/ui/card';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  FileUpload,
  FileList,
  DownloadSection,
  DownloadProgressDialog,
} from '@/components/excel';
import { VolumeFilter } from '@/components/excel';
import { processKwRelevancyFile, generateKwRelevancyReport } from '@/lib/services/kwRelevancyProcessor';
import { Input } from '@/components/ui/input';
import { FileData, DEFAULT_MIN_VOLUME } from '@/lib/constants';
import { ToolIntro } from '@/components/common/ToolIntro';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const KwRelevancyApp = () => {
  const [mainKeyword, setMainKeyword] = useState('');
  const [minVolume, setMinVolume] = useState(DEFAULT_MIN_VOLUME);
  const [files, setFiles] = useState<FileData[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('kw_relevancy_analysis');
  const [includeSummarySheet, setIncludeSummarySheet] = useState(true);
  const [keepOnlyQuestions, setKeepOnlyQuestions] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;

    try {
      setProcessing(true);
      setError(null);

      const validFiles = Array.from(fileList).filter(file => 
        file.name.toLowerCase().endsWith('.xlsx') || 
        file.name.toLowerCase().endsWith('.xls') || 
        file.name.toLowerCase().endsWith('.csv')
      );

      if (validFiles.length === 0) {
        setError('No valid Excel or CSV files found.');
        return;
      }

      const processedFiles = await Promise.all(
        validFiles.map(async file => {
          const processed = await processKwRelevancyFile(file, file.name.split('.')[0], minVolume);
          return {
            ...processed,
            storeFilteredRows: 0,
            customStoreFilteredRows: 0
          };
        })
      );

      setFiles(prev => [...prev, ...processedFiles]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing files.');
    } finally {
      setProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const updateSheetName = (id: string, name: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, sheetName: name } : f
    ));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setShowDownloadDialog(true);
    
    // Use setTimeout to allow the dialog to render before starting the processing
    setTimeout(() => {
      generateKwRelevancyReport(
        files, 
        outputFilename, 
        mainKeyword, 
        keepOnlyQuestions,
        removeDuplicates
      );
      setIsDownloading(false);
    }, 100);
  };

  // Prepare files for display with correct volume filtered count
  const displayFiles = files.map(file => ({
    ...file,
    storeFilteredRows: 0, // No store filtering in KwRelevancy
    volumeFilteredRows: file.originalRows - file.filteredRows // Calculate filtered rows
  }));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-8 pt-20">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolIntro 
          title="Keyword Relevancy Analysis"
          description="Upload Semrush exports for each competitor to identify keyword overlaps, gaps, and opportunities. Analyze competitor keyword strategies at a glance."
          icon={<BarChart3 className="w-6 h-6 text-[#004526]" />}
        />
        
        <Card>
          <CardContent className="pt-6 space-y-6">
            <motion.div 
              className="flex items-center gap-2 mb-4" 
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="h-6 w-1 bg-[#004526] rounded-full" />
              <h3 className="text-base font-medium">Main Keyword</h3>
            </motion.div>
            
            <div>
              <Input
                type="text"
                value={mainKeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
                placeholder="Enter the main keyword you're analyzing competitors for"
                className="w-full focus-visible:ring-[#004526]"
              />
            </div>

            <VolumeFilter
              minVolume={minVolume}
              setMinVolume={setMinVolume}
            />

            <FileUpload
              handleFileUpload={handleFileUpload}
              processing={processing}
            />

            <div className={`
              transition-all duration-300 ease-in-out space-y-8
              ${files.length > 0 ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}
            `}>
              <FileList
                files={displayFiles}
                removeFile={removeFile}
                updateSheetName={updateSheetName}
                clearAllFiles={clearAllFiles}
              />

              <DownloadSection
                outputFilename={outputFilename}
                setOutputFilename={setOutputFilename}
                includeSummarySheet={includeSummarySheet}
                setIncludeSummarySheet={setIncludeSummarySheet}
                showQuestionFilter={true}
                keepOnlyQuestions={keepOnlyQuestions}
                setKeepOnlyQuestions={setKeepOnlyQuestions}
                removeDuplicates={removeDuplicates}
                setRemoveDuplicates={setRemoveDuplicates}
                handleDownload={handleDownload}
              />
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <Alert variant="destructive" className="mt-6">
                  <AlertTitle>Error Processing File</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>{error}</p>
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer hover:underline">Troubleshooting Tips</summary>
                      <ul className="list-disc pl-6 mt-2 text-sm">
                        <li>Check that your file has the required columns (Keyword, Volume, Position)</li>
                        <li>For large files ({'>'}5MB), try splitting them into smaller files</li>
                        <li>If using XLSX, try exporting as CSV instead</li>
                        <li>Ensure your file is not password protected</li>
                      </ul>
                    </details>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-[#004526]/10 text-sm text-gray-500">
              <p>
                Dear Lacoste Team, need help or have suggestions? Contact me on{' '}
                <a 
                  href="https://www.linkedin.com/in/anthony-decat-bb8138220/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#004526] hover:underline"
                >
                  LinkedIn
                </a>
                {' '}and view the source code on{' '}
                <a 
                  href="https://github.com/azudev4/semrush-excel-filter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#004526] hover:underline"
                >
                  GitHub
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-gray-500 text-center">
          Made with ♥️ for Lacoste SEO Team
        </p>
      </div>

      <DownloadProgressDialog
        isOpen={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        processing={isDownloading}
        fileCount={files.length}
      />
    </div>
  );
};

export default KwRelevancyApp;