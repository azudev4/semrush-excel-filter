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
  StoreFilters,
  DownloadSection,
  DeletedRowsSummary,
} from '@/components/excel';
import { VolumeFilter } from '@/components/excel';
import { FileData, DEFAULT_MIN_VOLUME, DEFAULT_STORES } from '@/lib/constants';
import { formatSheetName } from '@/lib/excel';
import { processExcelFile, downloadExcelFile } from '@/lib/services/excelProcessor';
import { ToolIntro } from '@/components/common/ToolIntro';
import { FileSpreadsheet } from 'lucide-react';

const ExcelFilterApp = () => {
  const [defaultShops, setDefaultShops] = useState<string[]>(DEFAULT_STORES);
  const [customShops, setCustomShops] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [minVolume, setMinVolume] = useState(DEFAULT_MIN_VOLUME);
  const [outputFilename, setOutputFilename] = useState('combined_filtered_data');
  const [includeSummarySheet, setIncludeSummarySheet] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);

  const shops = [...defaultShops, ...customShops];

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
        validFiles.map(async (file) => {
          const sheetName = formatSheetName(file.name);
          return processExcelFile(file, sheetName, shops, minVolume);
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

  const handleDownload = () => {
    downloadExcelFile(files, outputFilename, includeSummarySheet, removeDuplicates);
  };

  const volumeFilterCount = files.reduce((sum, file) => sum + file.volumeFilteredRows, 0);
  const defaultShopCount = files.reduce((sum, file) => sum + file.storeFilteredRows, 0);
  const customWordsCount = files.reduce((sum, file) => sum + file.customStoreFilteredRows, 0);

  const clearAllFiles = () => {
    setFiles([]);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-8 pt-20">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolIntro 
          title="Lacoste Semrush Excel Filters & Formatting"
          description="Remove e-commerce store names, filter by search volume, and format your keyword data into a single, professionally-styled Excel workbook for easier analysis."
          icon={<FileSpreadsheet className="w-6 h-6 text-[#004526]" />}
        />
        
        <Card>
          <CardContent className="pt-6">
            <StoreFilters
              defaultShops={defaultShops}
              setDefaultShops={setDefaultShops}
              customShops={customShops}
              setCustomShops={setCustomShops}
            />

            <VolumeFilter
              minVolume={minVolume}
              setMinVolume={setMinVolume}
            />

            <FileUpload
              handleFileUpload={handleFileUpload}
              processing={processing}
            />

            <div className={`
              transition-all duration-300 ease-in-out
              ${files.length > 0 ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}
            `}>
              <FileList
                files={files}
                removeFile={removeFile}
                updateSheetName={updateSheetName}
                clearAllFiles={clearAllFiles}
              />

              <DeletedRowsSummary
                volumeFilterCount={volumeFilterCount}
                defaultShopCount={defaultShopCount}
                customWordsCount={customWordsCount}
              />

              <DownloadSection
                outputFilename={outputFilename}
                setOutputFilename={setOutputFilename}
                includeSummarySheet={includeSummarySheet}
                setIncludeSummarySheet={setIncludeSummarySheet}
                removeDuplicates={removeDuplicates}
                setRemoveDuplicates={setRemoveDuplicates}
                onDownload={handleDownload}
                disabled={files.length === 0}
              />
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <Alert variant="destructive" className="mt-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
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
    </div>
  );
};

export default ExcelFilterApp;