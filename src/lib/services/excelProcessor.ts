import * as XLSX from 'xlsx-js-style';
import { FileData, DEFAULT_STORES, FilteredDataRow } from '../constants';
import { formatData, filterByVolume } from '../excel';

export const processExcelFile = async (
  file: File, 
  sheetName: string,
  shops: string[],
  minVolume: number
): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('FILE_EMPTY');
        }
        
        let workbook;
        let jsonData;

        if (file.name.toLowerCase().endsWith('.csv')) {
          const csvData = event.target.result as string;
          try {
            workbook = XLSX.read(csvData, { 
              type: 'string',
              raw: false,
              cellDates: true,
              dateNF: 'yyyy-mm-dd',
              cellText: false,
              cellNF: false,
              sheets: 0,
              PRN: true
            });
          } catch {
            throw new Error('INVALID_CSV_FORMAT');
          }
        } else {
          const data = new Uint8Array(event.target.result as ArrayBuffer);
          try {
            workbook = XLSX.read(data, {
              type: 'array',
              cellDates: true,
              dateNF: 'yyyy-mm-dd'
            });
          } catch {
            throw new Error('INVALID_EXCEL_FORMAT');
          }
        }

        if (!workbook.SheetNames.length) {
          throw new Error('NO_SHEETS_FOUND');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        try {
          jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: true,
            dateNF: 'yyyy-mm-dd',
            defval: '',
            blankrows: false,
            header: 1
          });
        } catch {
          throw new Error('SHEET_PARSING_ERROR');
        }

        if (!jsonData.length) {
          throw new Error('EMPTY_SHEET');
        }

        const headers = jsonData[0] as string[];
        if (!headers.length) {
          throw new Error('NO_HEADERS_FOUND');
        }

        // Check for required columns
        const requiredColumns = ['Keyword', 'Volume'];
        const missingColumns = requiredColumns.filter(col => 
          !headers.some(header => header.trim().toLowerCase() === col.toLowerCase())
        );
        
        if (missingColumns.length > 0) {
          throw new Error(`MISSING_REQUIRED_COLUMNS:${missingColumns.join(',')}`);
        }

        const dataRows = jsonData.slice(1);
        const rowObjects = dataRows.map(row => {
          const rowArray = row as (string | number)[];
          return headers.reduce((obj, header, index) => {
            obj[header] = rowArray[index] || '';
            return obj;
          }, {} as Record<string, string | number>);
        });
        const formattedJsonData = formatData(rowObjects, minVolume) as FilteredDataRow[];

        // Create shop set for faster lookups
        const shopSet = new Set(shops.map(shop => shop.toLowerCase()));
        const defaultShopSet = new Set(shops.slice(0, DEFAULT_STORES.length).map(shop => shop.toLowerCase()));
        
        // Use filterByVolume utility
        const volumeFilteredData = filterByVolume(formattedJsonData, minVolume);

        // Helper function to check if a value contains a shop name
        const containsShopName = (value: string, shopName: string) => {
          const regex = new RegExp(`\\b${shopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return regex.test(value);
        };

        // Track rows removed by default shops
        const afterDefaultShops = volumeFilteredData.filter(row => 
          !Object.values(row).some(value => {
            const valueStr = String(value).toLowerCase();
            return Array.from(defaultShopSet).some(shop => containsShopName(valueStr, shop));
          })
        );

        // Track rows removed by custom shops
        const fullyFilteredData = afterDefaultShops.filter(row => 
          !Object.values(row).some(value => {
            const valueStr = String(value).toLowerCase();
            return Array.from(shopSet).some(shop => 
              !defaultShopSet.has(shop) && containsShopName(valueStr, shop)
            );
          })
        );

        resolve({
          id: Math.random().toString(36).substr(2, 9),
          originalData: formattedJsonData,
          filteredData: fullyFilteredData,
          fileName: file.name,
          sheetName: sheetName || file.name.split('.')[0],
          originalRows: formattedJsonData.length,
          filteredRows: fullyFilteredData.length,
          storeFilteredRows: volumeFilteredData.length - afterDefaultShops.length,
          customStoreFilteredRows: afterDefaultShops.length - fullyFilteredData.length,
          volumeFilteredRows: formattedJsonData.length - volumeFilteredData.length
        });
      } catch (err) {
        const errorMessage = (err as Error).message;
        switch (errorMessage) {
          case 'FILE_EMPTY':
            reject(new Error('The file appears to be empty. Please check the file content.'));
            break;
          case 'INVALID_CSV_FORMAT':
            reject(new Error('The CSV file format is invalid. Please ensure it\'s a properly formatted CSV file.'));
            break;
          case 'INVALID_EXCEL_FORMAT':
            reject(new Error('The Excel file format is invalid. Please ensure it\'s a properly formatted Excel file.'));
            break;
          case 'NO_SHEETS_FOUND':
            reject(new Error('No worksheets found in the file. Please ensure the file contains at least one sheet.'));
            break;
          case 'SHEET_PARSING_ERROR':
            reject(new Error('Error parsing the worksheet. The sheet structure might be corrupted.'));
            break;
          case 'EMPTY_SHEET':
            reject(new Error('The worksheet is empty. Please ensure it contains data.'));
            break;
          case 'NO_HEADERS_FOUND':
            reject(new Error('No headers found in the worksheet. Please ensure the first row contains column headers.'));
            break;
          default:
            if (errorMessage.startsWith('MISSING_REQUIRED_COLUMNS:')) {
              const missingCols = errorMessage.split(':')[1];
              reject(new Error(`Required columns missing: ${missingCols}. Please ensure all required columns are present.`));
            } else {
              reject(new Error('An unexpected error occurred while processing the file. Please try again.'));
            }
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file. The file might be corrupted or inaccessible.'));
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

interface ExcelStyles {
  headerStyle: XLSX.CellStyle;
  cellStyle: XLSX.CellStyle;
  alternateRowStyle: XLSX.CellStyle;
}

const defaultStyles: ExcelStyles = {
  headerStyle: {
    font: { 
      bold: true,
      color: { rgb: "FFFFFF" }
    },
    fill: {
      patternType: "solid",
      fgColor: { rgb: "004526" }
    },
    alignment: {
      horizontal: "center",
      vertical: "center"
    },
    border: {
      top: { style: "thin", color: { rgb: "B0B0B0" } },
      bottom: { style: "thin", color: { rgb: "B0B0B0" } },
      left: { style: "thin", color: { rgb: "B0B0B0" } },
      right: { style: "thin", color: { rgb: "B0B0B0" } }
    }
  },
  cellStyle: {
    border: {
      top: { style: "thin", color: { rgb: "B0B0B0" } },
      bottom: { style: "thin", color: { rgb: "B0B0B0" } },
      left: { style: "thin", color: { rgb: "B0B0B0" } },
      right: { style: "thin", color: { rgb: "B0B0B0" } }
    }
  },
  alternateRowStyle: {
    fill: {
      patternType: "solid",
      fgColor: { rgb: "F0F7F4" }
    }
  }
};

export const downloadExcelFile = (
  files: FileData[],
  outputFilename: string,
  includeSummarySheet: boolean
): void => {
  if (files.length === 0) return;

  const workbook = XLSX.utils.book_new();
  const { headerStyle, cellStyle, alternateRowStyle } = defaultStyles;

  // Track used sheet names to handle duplicates
  const usedSheetNames = new Set<string>();

  // Function to get unique sheet name
  const getUniqueSheetName = (baseName: string): string => {
    let sheetName = baseName;
    let counter = 1;
    while (usedSheetNames.has(sheetName)) {
      sheetName = `${baseName} (${counter})`;
      counter++;
    }
    usedSheetNames.add(sheetName);
    return sheetName;
  };

  // First add summary sheet if enabled
  if (includeSummarySheet) {
    const sheetSummaries = files.map(file => {
      const totalVolume = file.filteredData.reduce((sum, row) => {
        const volume = typeof row.Volume === 'string' ? parseInt(row.Volume, 10) : (row.Volume as number);
        return sum + (isNaN(volume) ? 0 : volume);
      }, 0);
      return {
        sheetName: file.sheetName,
        totalVolume,
        keywordCount: file.filteredData.length
      };
    }).sort((a, b) => b.totalVolume - a.totalVolume);

    const grandTotal = sheetSummaries.reduce((sum, sheet) => sum + sheet.totalVolume, 0);
    
    const summaryData = [
      ['Sheet Name', 'Number of Keywords', 'Total Search Volume'],
      ...sheetSummaries.map(summary => [
        { 
          v: summary.sheetName,
          l: { 
            Target: `#'${summary.sheetName}'!A1`,
            Tooltip: `Go to ${summary.sheetName} sheet`
          }
        },
        summary.keywordCount,
        summary.totalVolume
      ]),
      ['TOTAL', 
        sheetSummaries.reduce((sum, sheet) => sum + sheet.keywordCount, 0),
        grandTotal
      ]
    ];

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Add hyperlink styling after sheet creation
    sheetSummaries.forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: index + 1, c: 0 });
      if (summaryWorksheet[cellRef]) {
        summaryWorksheet[cellRef].s = {
          font: {
            name: 'Calibri',
            sz: 11,
            underline: true,
            color: { rgb: "0B5394" },  // Darker blue-green color
          },
          border: {
            top: { style: "thin", color: { rgb: "B0B0B0" } },
            bottom: { style: "thin", color: { rgb: "B0B0B0" } },
            left: { style: "thin", color: { rgb: "B0B0B0" } },
            right: { style: "thin", color: { rgb: "B0B0B0" } }
          },
          alignment: {
            horizontal: "left",
            vertical: "center"
          }
        };

        // Add the visited color state
        summaryWorksheet[cellRef].s2 = {
          font: {
            name: 'Calibri',
            sz: 11,
            underline: true,
            color: { theme: 11 },  // Use Excel's built-in visited hyperlink theme color
          }
        };
      }
    });

    summaryWorksheet['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
    ];

    const range = XLSX.utils.decode_range(summaryWorksheet['!ref'] || 'A1:C1');
    
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!summaryWorksheet[cell_ref]) continue;

        const cell = summaryWorksheet[cell_ref];
        
        if (R === 0) {
          cell.s = headerStyle;
        } else if (R === range.e.r) {
          cell.s = {
            font: { 
              bold: true,
              color: { rgb: "FFFFFF" }
            },
            fill: {
              patternType: "solid",
              fgColor: { rgb: "DC2626" }
            },
            alignment: {
              horizontal: C === 0 ? "left" : "right",
              vertical: "center"
            },
            border: {
              top: { style: "thin", color: { rgb: "B0B0B0" } },
              bottom: { style: "thin", color: { rgb: "B0B0B0" } },
              left: { style: "thin", color: { rgb: "B0B0B0" } },
              right: { style: "thin", color: { rgb: "B0B0B0" } }
            }
          };
        } else {
          // Preserve hyperlink styling for the first column
          if (C === 0 && cell.l) {
            cell.s = {
              font: {
                color: { rgb: "0B5394" },  // Same darker blue-green color
                underline: true
              },
              border: cellStyle.border,
              alignment: {
                horizontal: "left",
                vertical: "center"
              },
              ...(R % 2 === 1 ? { fill: alternateRowStyle.fill } : {})
            };
          } else {
            cell.s = R % 2 === 1 
              ? { ...cellStyle, ...alternateRowStyle }
              : cellStyle;
          }
        }

        if (C === 1 || C === 2) {
          cell.z = '#,##0';
        }
      }
    }

    summaryWorksheet['!rows'] = Array(range.e.r + 1).fill({ hpt: 20 });
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '📊 Summary');
    usedSheetNames.add('📊 Summary');
  }

  // Then add combined keywords sheet
  const allKeywords = files.flatMap(file => 
    file.filteredData.map(row => ({
      Keyword: row.Keyword,
      Intent: row.Intent,
      Volume: row.Volume,
      Source: file.sheetName
    }))
  ).sort((a, b) => {
    const volumeA = typeof a.Volume === 'string' ? parseInt(a.Volume, 10) : (a.Volume as number);
    const volumeB = typeof b.Volume === 'string' ? parseInt(b.Volume, 10) : (b.Volume as number);
    return (isNaN(volumeB) ? 0 : volumeB) - (isNaN(volumeA) ? 0 : volumeA);
  });

  if (allKeywords.length > 0) {
    const combinedWorksheet = XLSX.utils.json_to_sheet(allKeywords, {
      header: ['Keyword', 'Intent', 'Volume', 'Source']
    });

    const columnWidths = [
      { wch: 40 }, // Keyword
      { wch: 25 }, // Intent
      { wch: 10 }, // Volume
      { wch: 30 }, // Source
    ];

    const range = XLSX.utils.decode_range(combinedWorksheet['!ref'] || 'A1:D1');
    
    // Add autofilter to enable filtering
    combinedWorksheet['!autofilter'] = { ref: combinedWorksheet['!ref'] || 'A1:D1' };
    
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        
        if (!combinedWorksheet[cell_ref]) {
          combinedWorksheet[cell_ref] = { v: '', s: cellStyle };
          continue;
        }

        const cell = combinedWorksheet[cell_ref];
        
        if (R === 0) {
          cell.s = {
            ...headerStyle,
            alignment: {
              ...headerStyle.alignment,
              readingOrder: 2,
              vertical: "center",
              horizontal: "center",
              wrapText: true
            }
          };
        } else {
          const baseStyle = cellStyle;
          cell.s = R % 2 === 1 
            ? { ...baseStyle, ...alternateRowStyle }
            : { ...baseStyle };
          
          if (C === 2) { // Volume column
            cell.z = '#,##0';
          }
        }
      }
    }

    combinedWorksheet['!cols'] = columnWidths;
    combinedWorksheet['!rows'] = Array(range.e.r + 1).fill({ hpt: 20 });

    XLSX.utils.book_append_sheet(workbook, combinedWorksheet, getUniqueSheetName('All Keywords'));
  }

  // Finally add individual sheets
  files.forEach(file => {
    const worksheet = XLSX.utils.json_to_sheet(file.filteredData, {
      header: ['Keyword', 'Intent', 'Volume']
    });

    const columnWidths = [
      { wch: 40 },
      { wch: 25 },
      { wch: 10 },
    ];

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:C1');
    
    if (file.filteredData.length === 0) {
      worksheet['!ref'] = 'A1:C2';
      ['A1', 'B1', 'C1'].forEach(cell => {
        worksheet[cell] = {
          v: ['Keyword', 'Intent', 'Volume'][cell.charCodeAt(0) - 65],
          s: headerStyle
        };
      });
      worksheet['A2'] = {
        v: 'No results found - Keywords likely have 0 search volume',
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
            vertical: "center"
          },
          border: {
            top: { style: "thin", color: { rgb: "B0B0B0" } },
            bottom: { style: "thin", color: { rgb: "B0B0B0" } },
            left: { style: "thin", color: { rgb: "B0B0B0" } },
            right: { style: "thin", color: { rgb: "B0B0B0" } }
          }
        }
      };
      worksheet['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }];
    } else {
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
          
          if (!worksheet[cell_ref]) {
            worksheet[cell_ref] = { v: '', s: cellStyle };
            continue;
          }

          const cell = worksheet[cell_ref];
          
          if (R === 0) {
            cell.s = headerStyle;
          } else {
            const baseStyle = cellStyle;
            cell.s = R % 2 === 1 
              ? { ...baseStyle, ...alternateRowStyle }
              : { ...baseStyle };
            
            if (C === 2) {
              cell.z = '#,##0';
            }
          }
        }
      }
    }

    worksheet['!cols'] = columnWidths;
    worksheet['!rows'] = Array(range.e.r + 1).fill({ hpt: 20 });

    XLSX.utils.book_append_sheet(workbook, worksheet, getUniqueSheetName(file.sheetName));
  });

  // Save the workbook
  XLSX.writeFile(workbook, `${outputFilename}.xlsx`);
}; 