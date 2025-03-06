import * as XLSX from 'xlsx-js-style';
import { filterByVolume, formatData } from '../excel';
import { DEFAULT_MIN_VOLUME, FilteredDataRow, KW_RELEVANCY_COLUMNS } from '@/lib/constants';

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
          workbook = XLSX.read(event.target.result as string, { 
            type: 'string',
            cellDates: true,
            raw: false
          });
        } else {
          workbook = XLSX.read(new Uint8Array(event.target.result as ArrayBuffer), { 
            type: 'array',
            cellDates: true 
          });
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        if (!rawData.length) throw new Error('EMPTY_SHEET');

        // Log the first row to diagnose column name issues
        console.log("First row structure:", rawData[0]);
        const headers = Object.keys(rawData[0] || {});
        console.log("File headers:", headers);

        // Check required columns with flexible matching
        const keywordColumn = headers.find(h => /keyword/i.test(h));
        const volumeColumn = headers.find(h => /volume|search.?volume/i.test(h));
        let positionColumn = headers.find(h => /position/i.test(h));
        let typeColumn = headers.find(h => /position.?type|type/i.test(h));

        if (!keywordColumn) throw new Error('MISSING_KEYWORD_COLUMN');
        if (!volumeColumn) throw new Error('MISSING_VOLUME_COLUMN');
        if (!positionColumn) positionColumn = 'Position'; // Default fallback
        if (!typeColumn) typeColumn = 'Type'; // Default fallback

        // Process data in chunks
        const chunkSize = 5000;
        let cleanData: FilteredDataRow[] = [];
        
        for (let i = 0; i < rawData.length; i += chunkSize) {
          const chunk = rawData.slice(i, i + chunkSize);
          
          // Map raw data to standardized structure with KW_RELEVANCY_COLUMNS
          const processedChunk = chunk.map(row => {
            const mappedRow: Record<string, string | number> = {
              Keyword: String((row as Record<string, unknown>)[keywordColumn] || ''),
              Position: String((row as Record<string, unknown>)[positionColumn] || ''),
              Volume: (row as Record<string, unknown>)[volumeColumn] as string | number,
              Type: String((row as Record<string, unknown>)[typeColumn] || '')
            };
            
            return formatData([mappedRow], KW_RELEVANCY_COLUMNS)[0];
          });
          
          cleanData = [...cleanData, ...processedChunk];
        }

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
        console.error("Processing error details:", err);
        console.error("File name:", file.name);
        
        const errorMsg = (err as Error).message;
        const userError = getErrorMessage(errorMsg, file.name);
        reject(new Error(userError));
      }
    };

    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

function getErrorMessage(errorMsg: string, fileName: string): string {
  switch (true) {
    case errorMsg.includes('MISSING_KEYWORD_COLUMN'):
      return 'Could not find a "Keyword" column in the file. Please ensure your file has this column.';
    case errorMsg.includes('MISSING_VOLUME_COLUMN'):
      return 'Could not find a "Volume" or "Search Volume" column in the file. Please ensure your file has this column.';
    case errorMsg.includes('FILE_EMPTY'):
      return `The file "${fileName}" appears to be empty.`;
    case errorMsg.includes('EMPTY_SHEET'):
      return `No data found in the first sheet of "${fileName}".`;
    default:
      return `Error processing file: ${fileName} - ${errorMsg}`;
  }
}

// Question words in English and French
const QUESTION_WORDS = [
  // English question words
  'why', 'how', 'what', 'when', 'where', 'which', 'who', 'whose', 'whom',
  // French question words
  'pourquoi', 'comment', 'quoi', 'que', 'qu', 'quand', 'où', 'quel', 'quelle', 
  'quels', 'quelles', 'qui', 'combien', 'lequel', 'laquelle', 'lesquels', 'lesquelles'
];

// Function to check if a keyword is a question
function isQuestionKeyword(keyword: string): boolean {
  const lowercaseKeyword = keyword.toLowerCase();
  return QUESTION_WORDS.some(word => 
    lowercaseKeyword.startsWith(word + ' ') || 
    lowercaseKeyword.includes(' ' + word + ' ')
  );
}

// Filter for question keywords
function filterQuestionKeywords(data: FilteredDataRow[]): FilteredDataRow[] {
  return data.filter(row => isQuestionKeyword(row.Keyword));
}

export const generateKwRelevancyReport = (
  files: ProcessedData[],
  outputFilename: string,
  mainKeyword: string,
  keepOnlyQuestions: boolean = false
): void => {
  const workbook = XLSX.utils.book_new();
  const usedSheetNames = new Set<string>();

  // 1. Filter data if needed
  const processedFiles = files.map(file => {
    if (keepOnlyQuestions) {
      return {
        ...file,
        filteredData: filterQuestionKeywords(file.filteredData)
      };
    }
    return file;
  });

  // 2. Create keyword map and process data for summary
  const keywordMap = new Map<string, KeywordOccurrence>();

  processedFiles.forEach(file => {
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
            position: row.Position || '',
            volume: isNaN(volume) ? 0 : volume
          });
        } else {
          // Update existing competitor with best position if found
          const currentPos = Number(row.Position) || 999;
          const existingPos = Number(existing.competitors[competitorIndex].position) || 999;
          if (currentPos < existingPos) {
            existing.competitors[competitorIndex].position = row.Position || '';
          }
        }
      } else {
        keywordMap.set(keyword, {
          keyword: row.Keyword,
          position: row.Position || '',
          volume: isNaN(volume) ? 0 : volume,
          type: row.Type || '',
          occurrences: 1,
          totalVolume: isNaN(volume) ? 0 : volume,
          competitors: [{
            name: file.sheetName,
            position: row.Position || '',
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

  // 3. Create and add summary sheet FIRST
  const title = mainKeyword 
    ? `Keyword Relevancy Analysis: ${mainKeyword}`
    : 'Keyword Relevancy Analysis';

  let summaryData;
  if (sortedKeywords.length === 0) {
    // Handle empty data case
    summaryData = [
      [title],
      [keepOnlyQuestions ? 'Top Question-Based Keyword Opportunities' : 'Top Keyword Opportunities'],
      ['No corresponding rows were detected']
    ];
  } else {
    summaryData = [
      [title],
      [keepOnlyQuestions ? 'Top Question-Based Keyword Opportunities' : 'Top Keyword Opportunities'],
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
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Style the empty data message if present
  if (sortedKeywords.length === 0) {
    const cell_ref = XLSX.utils.encode_cell({ r: 2, c: 0 });
    summarySheet[cell_ref] = {
      v: 'No corresponding rows were detected',
      s: {
        font: { 
          bold: true,
          color: { rgb: "FFFFFF" }
        },
        fill: {
          patternType: "solid",
          fgColor: { rgb: "FF0000" }
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true
        },
        border: {
          top: { style: "thin", color: { rgb: "B0B0B0" } },
          bottom: { style: "thin", color: { rgb: "B0B0B0" } },
          left: { style: "thin", color: { rgb: "B0B0B0" } },
          right: { style: "thin", color: { rgb: "B0B0B0" } }
        }
      }
    };

    // Set row height for the message
    if (!summarySheet['!rows']) {
      summarySheet['!rows'] = [];
    }
    summarySheet['!rows'][2] = { hpt: 25 }; // Set height for the message row

    // Merge cells for the message to span all columns
    summarySheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Subtitle
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }  // Message - spans all columns
    ];

    // Set the reference range to include all merged cells
    summarySheet['!ref'] = 'A1:F3';
  }

  // Set column widths
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

  // Add the summary sheet FIRST
  XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Summary');

  // 3. Then add individual sheets for each competitor
  processedFiles.forEach(file => {
    let worksheet;
    
    if (file.filteredData.length === 0) {
      // Create empty sheet with message
      worksheet = XLSX.utils.aoa_to_sheet([
        ['Keyword', 'Position', 'Volume', 'Type'],
        ['No corresponding rows were detected']
      ]);
      
      // Style the empty data message
      const cell_ref = XLSX.utils.encode_cell({ r: 1, c: 0 });
      worksheet[cell_ref] = {
        v: 'No corresponding rows were detected',
        s: {
          font: { 
            bold: true,
            color: { rgb: "FFFFFF" }
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: "FF0000" }
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true
          },
          border: {
            top: { style: "thin", color: { rgb: "B0B0B0" } },
            bottom: { style: "thin", color: { rgb: "B0B0B0" } },
            left: { style: "thin", color: { rgb: "B0B0B0" } },
            right: { style: "thin", color: { rgb: "B0B0B0" } }
          }
        }
      };

      // Set row height for the message
      worksheet['!rows'] = [
        { hpt: 30 }, // Header row
        { hpt: 25 }  // Message row
      ];

      // Merge cells for the message
      worksheet['!merges'] = [
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }  // Message spans all columns
      ];

      // Set the reference range
      worksheet['!ref'] = 'A1:D2';
    } else {
      worksheet = XLSX.utils.json_to_sheet(file.filteredData);
    }
    
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
        } else if (file.filteredData.length > 0) {
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

  // Save the workbook
  XLSX.writeFile(workbook, `${outputFilename}.xlsx`);
};