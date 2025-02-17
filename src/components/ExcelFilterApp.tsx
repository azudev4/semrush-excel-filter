'use client'
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  StoreFilters,
  VolumeFilter,
  FileUpload,
  FileList,
  DownloadSection
} from '@/components/excel';
import { DEFAULT_STORES, DEFAULT_MIN_VOLUME, type FileData } from '@/lib/constants';
import { formatSheetName } from '@/lib/excel';
import { processExcelFile, downloadExcelFile } from '@/lib/services/excelProcessor';

const ExcelFilterApp = () => {
  const [defaultShops, setDefaultShops] = useState<string[]>(DEFAULT_STORES);
  const [customShops, setCustomShops] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentSheetName, setCurrentSheetName] = useState('');
  const [minVolume, setMinVolume] = useState(DEFAULT_MIN_VOLUME);
  const [outputFilename, setOutputFilename] = useState('combined_filtered_data');
  const [includeSummarySheet, setIncludeSummarySheet] = useState(true);

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
      setCurrentSheetName('');
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
    downloadExcelFile(files, outputFilename, includeSummarySheet);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lacoste Semrush Excel Filters & Formatting</CardTitle>
            <CardDescription>
              Remove rows containing e-commerce store names, filter low volume keywords, and combine files into one workbook
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              currentSheetName={currentSheetName}
              setCurrentSheetName={setCurrentSheetName}
              processing={processing}
            />

            {files.length > 0 && (
              <>
                <FileList
                  files={files}
                  removeFile={removeFile}
                  updateSheetName={updateSheetName}
                />

                <DownloadSection
                  outputFilename={outputFilename}
                  setOutputFilename={setOutputFilename}
                  includeSummarySheet={includeSummarySheet}
                  setIncludeSummarySheet={setIncludeSummarySheet}
                  onDownload={handleDownload}
                  disabled={files.length === 0}
                />
              </>
            )}

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExcelFilterApp;