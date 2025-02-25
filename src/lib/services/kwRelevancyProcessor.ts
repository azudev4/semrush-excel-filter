import * as XLSX from 'xlsx-js-style';
import { parseVolume, filterByVolume } from '../excel';
import { DEFAULT_MIN_VOLUME } from '@/lib/constants';

interface KeywordOccurrence {
  keyword: string;
  position: string | number;
  volume: number;
  type: string;
  occurrences: number;
  totalVolume: number;
  competitors: Array<{
    name: string;
    position: string | number;
    volume: number;
  }>;
}

interface RawDataRow {
  Keyword: string;
  Position: string | number;
  'Search Volume': number | string;
  'Position Type': string;
  [key: string]: unknown;
}

interface FilteredDataRow {
  Keyword: string;
  Position: string | number;
  Volume: number;
  Type: string;
}

export interface ProcessedData {
  id: string;
  fileName: string;
  sheetName: string;
  originalRows: number;
  filteredRows: number;
  volumeFilteredRows: number;
  originalData: FilteredDataRow[];
  filteredData: FilteredDataRow[];
}

export const processKwRelevancyFile = async (
  file: File,
  sheetName: string,
  minVolume: number = DEFAULT_MIN_VOLUME
): Promise<ProcessedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error('FILE_EMPTY');

        let workbook;
        if (file.name.toLowerCase().endsWith('.csv')) {
          workbook = XLSX.read(event.target.result as string, { type: 'string' });
        } else {
          workbook = XLSX.read(new Uint8Array(event.target.result as ArrayBuffer), { type: 'array' });
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        if (!rawData.length) throw new Error('EMPTY_SHEET');

        // Use parseVolume utility for volume parsing
        const cleanData = (rawData as RawDataRow[]).map(row => ({
          Keyword: row.Keyword || '',
          Position: row.Position || '',
          Volume: parseVolume(row['Search Volume']),
          Type: row['Position Type'] || ''
        }));

        // Use filterByVolume utility
        const filteredData = filterByVolume(cleanData, minVolume);

        resolve({
          id: crypto.randomUUID(),
          fileName: file.name,
          sheetName: sheetName || file.name.split('.')[0],
          originalRows: cleanData.length,
          filteredRows: filteredData.length,
          volumeFilteredRows: cleanData.length - filteredData.length,
          originalData: cleanData,
          filteredData: filteredData
        });

      } catch (err) {
        reject(new Error('Error processing file: ' + (err as Error).message));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

export const generateKwRelevancyReport = (
  files: ProcessedData[],
  outputFilename: string,
  mainKeyword: string
): void => {
  const workbook = XLSX.utils.book_new();
  const usedSheetNames = new Set<string>();

  // 1. First add individual sheets for each competitor
  files.forEach(file => {
    const worksheet = XLSX.utils.json_to_sheet(file.filteredData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 40 }, // Keyword
      { wch: 10 }, // Position
      { wch: 15 }, // Volume
      { wch: 15 }, // Type
    ];

    // Style the sheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:D1');
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cell_ref]) continue;

        const cell = worksheet[cell_ref];
        
        if (R === 0) {
          cell.s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { patternType: "solid", fgColor: { rgb: "004526" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "B0B0B0" } },
              bottom: { style: "thin", color: { rgb: "B0B0B0" } },
              left: { style: "thin", color: { rgb: "B0B0B0" } },
              right: { style: "thin", color: { rgb: "B0B0B0" } }
            }
          };
        } else {
          cell.s = {
            border: {
              top: { style: "thin", color: { rgb: "B0B0B0" } },
              bottom: { style: "thin", color: { rgb: "B0B0B0" } },
              left: { style: "thin", color: { rgb: "B0B0B0" } },
              right: { style: "thin", color: { rgb: "B0B0B0" } }
            },
            fill: {
              patternType: "solid",
              fgColor: { rgb: R % 2 ? "F0F7F4" : "FFFFFF" }
            }
          };
        }

        // Add number formatting for volume
        if (C === 2 && R > 0) {
          cell.z = '#,##0';
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, file.sheetName);
    usedSheetNames.add(file.sheetName);
  });

  // 2. Create summary data
  const keywordMap = new Map<string, KeywordOccurrence>();

  files.forEach(file => {
    file.filteredData.forEach((row: FilteredDataRow) => {
      const keyword = row.Keyword?.toString().toLowerCase();
      if (!keyword) return;

      // Use the already processed Volume field
      const volume = row.Volume;

      if (keywordMap.has(keyword)) {
        const existing = keywordMap.get(keyword)!;
        // Check if we already have an entry for this competitor
        const competitorIndex = existing.competitors.findIndex(c => c.name === file.sheetName);
        
        if (competitorIndex === -1) {
          // New competitor for this keyword
          existing.occurrences++;
          existing.totalVolume += isNaN(volume) ? 0 : volume;
          existing.competitors.push({
            name: file.sheetName,
            position: row.Position,
            volume: isNaN(volume) ? 0 : volume
          });
        } else {
          // Update existing competitor with best position if found
          const currentPos = Number(row.Position) || 999;
          const existingPos = Number(existing.competitors[competitorIndex].position) || 999;
          if (currentPos < existingPos) {
            existing.competitors[competitorIndex].position = row.Position;
          }
        }
      } else {
        keywordMap.set(keyword, {
          keyword: row.Keyword,
          position: row.Position,
          volume: isNaN(volume) ? 0 : volume,
          type: row.Type || '',
          occurrences: 1,
          totalVolume: isNaN(volume) ? 0 : volume,
          competitors: [{
            name: file.sheetName,
            position: row.Position,
            volume: isNaN(volume) ? 0 : volume
          }]
        });
      }
    });
  });

  // Sort keywords by occurrences and total volume
  const sortedKeywords = Array.from(keywordMap.values())
    .sort((a, b) => {
      if (b.occurrences !== a.occurrences) {
        return b.occurrences - a.occurrences;
      }
      return b.totalVolume - a.totalVolume;
    });

  // 3. Create summary sheet with streamlined structure
  const title = mainKeyword 
    ? `Keyword Relevancy Analysis: ${mainKeyword}`
    : 'Keyword Relevancy Analysis';

  const summaryData = [
    [title],
    ['Top Keyword Opportunities'],
    ['Keyword', 'Best Position', 'Total Volume', 'Type', 'Occurrences', 'Details'],
    ...sortedKeywords.map(kw => [
      kw.keyword,
      Math.min(...kw.competitors.map(c => Number(c.position) || 999)),
      kw.totalVolume,
      kw.type,
      kw.occurrences,
      kw.competitors.map(c => `${c.name}(#${c.position})`).join(', ')
    ])
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Column widths
  summarySheet['!cols'] = [
    { wch: 45 }, // Keyword
    { wch: 15 }, // Best Position
    { wch: 15 }, // Volume
    { wch: 15 }, // Type
    { wch: 12 }, // Occurrences
    { wch: 70 }, // Details
  ];

  // Row heights
  summarySheet['!rows'] = Array(summaryData.length).fill({ hpt: 20 }); // Default height
  summarySheet['!rows'][0] = { hpt: 35 }; // Title row
  summarySheet['!rows'][1] = { hpt: 25 }; // Opportunities header

  // Merge cells for headers and title
  summarySheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Main title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Opportunities header
  ];

  // Style the sheet
  const range = XLSX.utils.decode_range(summarySheet['!ref'] || 'A1:F' + summaryData.length);

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!summarySheet[cell_ref]) continue;

      const cell = summarySheet[cell_ref];

      if (R === 0) {
        // Main title style
        cell.s = {
          font: { 
            bold: true, 
            size: 16, 
            color: { rgb: "FFFFFF" } 
          },
          fill: { 
            patternType: "solid", 
            fgColor: { rgb: "004526" } 
          },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "FFFFFF" } },
            bottom: { style: "thin", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } }
          }
        };
      } else if (R === 1) {
        // Opportunities header
        cell.s = {
          font: { 
            bold: true, 
            size: 12, 
            color: { rgb: "004526" } 
          },
          fill: { 
            patternType: "solid", 
            fgColor: { rgb: "F0F7F4" } 
          },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };
      } else if (R === 2) {
        // Column headers style
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { patternType: "solid", fgColor: { rgb: "004526" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "FFFFFF" } },
            bottom: { style: "thin", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } }
          }
        };
      } else {
        // Data rows style
        cell.s = {
          font: { size: 10 },
          alignment: {
            horizontal: C === 5 ? "left" : "center",
            vertical: "center",
            wrapText: C === 5
          },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: R % 2 ? "F8FAFC" : "FFFFFF" }
          }
        };

        // Number formatting
        if (C === 2) { // Volume column
          cell.z = '#,##0';
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Summary');

  // Save the workbook
  XLSX.writeFile(workbook, `${outputFilename}.xlsx`);
};