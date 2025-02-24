import * as XLSX from 'xlsx-js-style';
import { FileData } from '../constants';

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

export interface ProcessedData {
  id: string;
  fileName: string;
  sheetName: string;
  originalRows: number;
  filteredRows: number;
  volumeFilteredRows: number;
  originalData: any[];
  filteredData: any[];
}

const REQUIRED_COLUMNS = ['Keyword', 'Position', 'Search Volume', 'Position Type'];

export const processKwRelevancyFile = async (
  file: File,
  sheetName: string,
  minVolume: number
): Promise<ProcessedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) throw new Error('FILE_EMPTY');

        // 1. Read file and get raw data
        let workbook;
        if (file.name.toLowerCase().endsWith('.csv')) {
          workbook = XLSX.read(event.target.result as string, { type: 'string' });
        } else {
          workbook = XLSX.read(new Uint8Array(event.target.result as ArrayBuffer), { type: 'array' });
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        if (!rawData.length) throw new Error('EMPTY_SHEET');

        // 2. Keep only required columns
        const cleanData = rawData.map((row: any) => ({
          Keyword: row.Keyword || '',
          Position: row.Position || '',
          Volume: row['Search Volume'] || 0,
          Type: row['Position Type'] || ''
        }));

        // 3. Filter by volume
        const filteredData = cleanData.filter(row => {
          const volume = typeof row.Volume === 'string' 
            ? parseInt(row.Volume.replace(/[,\s]/g, ''), 10)
            : row.Volume;
          return !isNaN(volume) && volume >= minVolume;
        });

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
    file.filteredData.forEach((row: any) => {
      const keyword = row.Keyword?.toString().toLowerCase();
      if (!keyword) return;

      const volume = typeof row.Volume === 'string' 
        ? parseInt(row.Volume.replace(/[,\s]/g, ''), 10)
        : row.Volume;

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

  // 3. Create summary sheet with better structure
  const summaryData = [
    ['Keyword Relevancy Analysis'],
    [],
    ['Analysis Details'],
    ['Main Keyword', mainKeyword || 'Not specified'],
    ['Competitors', files.length.toString()],
    [],
    ['Top Keyword Opportunities'],
    ['', '', '', '', '', ''],  // Separator row
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

  // Calculate max width needed for second column (including header and data)
  const getTextWidth = (text: string | number) => {
    const str = String(text);
    return Math.max(
      str.length * 1.2, // Base width
      str.length * (str.length > 10 ? 0.8 : 1) // Adjust for long text
    );
  };

  const secondColumnWidth = Math.max(
    getTextWidth('Best Position'),
    getTextWidth(mainKeyword || 'Not specified'),
    getTextWidth(files.length.toString()),
    ...sortedKeywords.map(kw => 
      getTextWidth(Math.min(...kw.competitors.map(c => Number(c.position) || 999)))
    )
  );

  // Column widths
  summarySheet['!cols'] = [
    { wch: 45 }, // Keyword
    { wch: Math.max(15, secondColumnWidth) }, // Best Position/Values - dynamic width
    { wch: 15 }, // Volume
    { wch: 15 }, // Type
    { wch: 12 }, // Occurrences
    { wch: 70 }, // Details
  ];

  // Row heights
  summarySheet['!rows'] = Array(summaryData.length).fill({ hpt: 20 }); // Default height
  summarySheet['!rows'][0] = { hpt: 35 }; // Title row
  summarySheet['!rows'][2] = { hpt: 25 }; // Analysis Details header
  summarySheet['!rows'][6] = { hpt: 25 }; // Opportunities header
  summarySheet['!rows'][7] = { hpt: 8 }; // Separator row
  summarySheet['!rows'][8] = { hpt: 25 }; // Column headers row

  // Merge cells for headers and title
  summarySheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Main title
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // Analysis Details header
    { s: { r: 6, c: 0 }, e: { r: 6, c: 5 } }, // Opportunities header
    { s: { r: 7, c: 0 }, e: { r: 7, c: 5 } }, // Separator
  ];

  // Style the sheet
  const range = XLSX.utils.decode_range(summarySheet['!ref'] || 'A1:F' + summaryData.length);

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!summarySheet[cell_ref]) continue;

      const cell = summarySheet[cell_ref];

      if (R === 0 || R === 2 || R === 6) {
        // Headers style
        cell.s = {
          font: { 
            bold: true, 
            size: R === 0 ? 16 : 12, 
            color: R === 0 ? { rgb: "FFFFFF" } : { rgb: "004526" } 
          },
          fill: { 
            patternType: "solid", 
            fgColor: { rgb: R === 0 ? "004526" : "F0F7F4" } 
          },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: R === 0 ? "FFFFFF" : "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: R === 0 ? "FFFFFF" : "E2E8F0" } },
            left: { style: "thin", color: { rgb: R === 0 ? "FFFFFF" : "E2E8F0" } },
            right: { style: "thin", color: { rgb: R === 0 ? "FFFFFF" : "E2E8F0" } }
          }
        };
      } else if (R >= 3 && R <= 4) {
        // Analysis details rows
        cell.s = {
          font: { 
            bold: C === 0,
            size: 11,
            color: { rgb: C === 0 ? "004526" : "000000" }
          },
          fill: { patternType: "solid", fgColor: { rgb: "F8FAFC" } },
          alignment: { 
            horizontal: C === 0 ? "right" : "left", 
            vertical: "center",
            wrapText: C === 1
          },
          border: {
            top: { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left: { style: "thin", color: { rgb: "E2E8F0" } },
            right: { style: "thin", color: { rgb: "E2E8F0" } }
          }
        };
      } else if (R === 7) {
        // Separator style
        cell.s = {
          fill: { patternType: "solid", fgColor: { rgb: "E2E8F0" } },
        };
      } else if (R === 8) {
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