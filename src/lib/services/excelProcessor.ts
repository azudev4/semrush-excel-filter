import * as XLSX from 'xlsx-js-style';
import { FileData, DEFAULT_STORES, FilteredDataRow, KSUG_FORMATTER_COLUMNS, DEFAULT_MIN_VOLUME } from '../constants';
import { formatData, filterByVolume, deduplicateKeywords } from '../excel';

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
        
        // Count rows before formatting and filtering
        const originalRowCount = rowObjects.length;
        
        // Use KSUG_FORMATTER_COLUMNS for the Excel formatter app
        const formattedJsonData = formatData(rowObjects, KSUG_FORMATTER_COLUMNS, false) as FilteredDataRow[];

        // Use filterByVolume utility (which now skips filtering when minVolume is 0)
        const volumeFilteredData = filterByVolume(formattedJsonData, minVolume);

        // Helper function to check if a value contains a shop name
        const containsShopName = (value: string, shopName: string) => {
          const regex = new RegExp(`\\b${shopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return regex.test(value);
        };

        // Create shop set for faster lookups
        const shopSet = new Set(shops.map(shop => shop.toLowerCase()));
        const defaultShopSet = new Set(shops.slice(0, DEFAULT_STORES.length).map(shop => shop.toLowerCase()));

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

        // Après avoir chargé les données initiales:
        const storeFilteredData = filterStoreNames(volumeFilteredData, shops);

        // Puis calculez le nombre de lignes filtrées:
        const storeFilteredRows = volumeFilteredData.length - storeFilteredData.length;

        resolve({
          id: Math.random().toString(36).substr(2, 9),
          originalData: formattedJsonData,
          filteredData: fullyFilteredData,
          fileName: file.name,
          sheetName: sheetName || file.name.split('.')[0],
          originalRows: originalRowCount,
          filteredRows: fullyFilteredData.length,
          storeFilteredRows: storeFilteredRows,
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
  includeSummarySheet: boolean,
  removeDuplicates: boolean = false,
  shops: string[] = [],
  minVolume: number = DEFAULT_MIN_VOLUME
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

  // Apply deduplication to files if enabled
  const processedFiles = files.map(file => {
    if (removeDuplicates) {
      return {
        ...file,
        filteredData: deduplicateKeywords(file.filteredData)
      };
    }
    return file;
  });

  // First add summary sheet if enabled
  if (includeSummarySheet) {
    const sheetSummaries = processedFiles.map(file => {
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
    const totalKeywords = sheetSummaries.reduce((sum, sheet) => sum + sheet.keywordCount, 0);
    
    // Définir le type explicitement pour summaryData
    const summaryData: (string | { v: string; l: { Target: string; Tooltip: string } })[][] = [
      ['Keyword Analysis'],
      [`Generated on ${new Date().toLocaleDateString()}`],
      []
    ];
    
    // Ajouter la section des métriques clés
    summaryData.push(
      ['Key Metrics'],
      ['Number of Sheets', String(sheetSummaries.length)],
      ['Total Keywords', String(totalKeywords)],
      ['Total Search Volume', String(grandTotal)],
      []  // Ligne vide pour l'espacement
    );
    
    // Ajouter le tableau des détails des feuilles avec en-têtes
    summaryData.push(
      ['Sheet Details'],
      ['Sheet Name', 'Keywords', 'Search Volume', 'Average Volume', '% of Total Volume']
    );
    
    // Ajouter les lignes de données
    sheetSummaries.forEach(summary => {
      const avgVolume = summary.keywordCount > 0 ? Math.round(summary.totalVolume / summary.keywordCount) : 0;
      const percentOfTotal = grandTotal > 0 ? (summary.totalVolume / grandTotal * 100).toFixed(1) + '%' : '0%';
      
      summaryData.push([
        { 
          v: summary.sheetName,
          l: { 
            Target: `#'${summary.sheetName}'!A1`,
            Tooltip: `Go to sheet ${summary.sheetName}`
          }
        },
        String(summary.keywordCount),
        String(summary.totalVolume),
        String(avgVolume),
        percentOfTotal
      ]);
    });
    
    // Ajouter la ligne des totaux
    summaryData.push(
      ['TOTAL', String(totalKeywords), String(grandTotal), String(Math.round(grandTotal / totalKeywords) || 0), '100%']
    );
    
    // Ajouter une ligne vide pour l'espacement
    summaryData.push([]);
    
    // Ajouter les paramètres de filtrage
    summaryData.push(
      ['Filter Parameters'],
      ['Minimum Volume', String(minVolume)],
      ['Duplicate Removal', removeDuplicates ? 'Enabled' : 'Disabled'],
      ['Filtered Stores', shops.join(', ')],
      []  // Ligne vide pour l'espacement
    );
    
    // Ajouter les instructions et notes
    summaryData.push(
      ['Notes'],
      ['• Click on sheet names to navigate directly to respective sheets'],
      ['• All keywords have been filtered by minimum search volume and store names'],
      ['• Sheets are sorted by total search volume (highest to lowest)'],
      ['• When duplicate removal is enabled, very similar keywords (like "T-shirt" vs "t shirt" or "polos" & "polo") are considered duplicates and only the variation with the highest search volume is kept'],
      ['• This report was generated using the tool available at https://semrush-excel-filter.vercel.app/']
    );

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Définir tous les styles dont nous avons besoin
    const titleStyle = {
      font: { 
        bold: true,
        sz: 16,
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
        bottom: { style: "thin", color: { rgb: "FFFFFF" } }
      }
    };
    
    const subtitleStyle = {
      font: { 
        italic: true,
        sz: 11,
        color: { rgb: "FFFFFF" } 
      },
      fill: { 
        patternType: "solid", 
        fgColor: { rgb: "004526" } 
      },
      alignment: { 
        horizontal: "center", 
        vertical: "center" 
      }
    };
    
    const sectionHeaderStyle = {
      font: { 
        bold: true, 
        sz: 12, 
        color: { rgb: "FFFFFF" } 
      },
      fill: { 
        patternType: "solid", 
        fgColor: { rgb: "004526" } 
      },
      alignment: { 
        horizontal: "left", 
        vertical: "center"
      },
      border: {
        top: { style: "thin", color: { rgb: "B0B0B0" } },
        bottom: { style: "thin", color: { rgb: "B0B0B0" } }
      }
    };
    
    const tableHeaderStyle = {
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
        };
    
    const metricLabelStyle = {
      font: { 
        bold: true,
      },
      alignment: { 
        horizontal: "left", 
        vertical: "center" 
      }
    };
    
    const metricValueStyle = {
      alignment: { 
        horizontal: "right", 
        vertical: "center" 
      },
      font: {
        bold: true,
        color: { rgb: "004526" }
      }
    };
    
    const hyperlinkStyle = {
      font: {
        sz: 11,
        underline: true,
        color: { rgb: "0B5394" },
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
    
    const totalRowStyle = {
      font: { 
        bold: true,
        color: { rgb: "FFFFFF" }
      },
      fill: {
        patternType: "solid",
        fgColor: { rgb: "C00000" }
      },
      alignment: {
        horizontal: "right",
        vertical: "center"
      },
      border: {
        top: { style: "thin", color: { rgb: "B0B0B0" } },
        bottom: { style: "thin", color: { rgb: "B0B0B0" } },
        left: { style: "thin", color: { rgb: "B0B0B0" } },
        right: { style: "thin", color: { rgb: "B0B0B0" } }
      }
    };
    
    const noteStyle = {
      font: { 
        italic: true,
        sz: 10,
        color: { rgb: "666666" }
      },
      alignment: { 
        horizontal: "left", 
        vertical: "center" 
      }
    };
    
    const noteHeaderStyle = {
      font: { 
        bold: true, 
        sz: 11, 
        color: { rgb: "004526" } 
      },
      alignment: { 
        horizontal: "left", 
        vertical: "center" 
      },
      border: {
        bottom: { style: "thin", color: { rgb: "004526" } }
      }
    };
    
    // Appliquer les styles aux cellules
    const range = XLSX.utils.decode_range(summaryWorksheet['!ref'] || 'A1:E1');
    
    // Appliquer les styles de cellule en fonction du contenu de la ligne
    for (let R = 0; R <= range.e.r; R++) {
      for (let C = 0; C <= range.e.c; C++) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!summaryWorksheet[cell_ref]) continue;
        
        // Obtenir la cellule
        const cell = summaryWorksheet[cell_ref];
        
        // Ligne de titre
        if (R === 0) {
          cell.s = titleStyle;
        }
        // Ligne de sous-titre
        else if (R === 1) {
          cell.s = subtitleStyle;
        }
        // En-tête de section Métriques clés
        else if (R === 3 && C === 0) {
          cell.s = sectionHeaderStyle;
        }
        // Étiquettes des métriques clés
        else if (R >= 4 && R <= 6 && C === 0) {
          cell.s = metricLabelStyle;
        }
        // Valeurs des métriques clés
        else if (R >= 4 && R <= 6 && C === 1) {
          cell.s = metricValueStyle;
        }
        // En-tête de section Détails des feuilles
        else if (R === 8 && C === 0) {
          cell.s = sectionHeaderStyle;
        }
        // Ligne d'en-tête du tableau
        else if (R === 9) {
          cell.s = tableHeaderStyle;
        }
        // Lignes de données - noms de feuilles avec hyperliens
        else if (R >= 10 && R < 10 + sheetSummaries.length && C === 0 && cell.l) {
          cell.s = hyperlinkStyle;
        }
        // Lignes de données - autres valeurs
        else if (R >= 10 && R < 10 + sheetSummaries.length && C > 0) {
          cell.s = {
            border: {
              top: { style: "thin", color: { rgb: "B0B0B0" } },
              bottom: { style: "thin", color: { rgb: "B0B0B0" } },
              left: { style: "thin", color: { rgb: "B0B0B0" } },
              right: { style: "thin", color: { rgb: "B0B0B0" } }
            },
            fill: {
              patternType: "solid",
              fgColor: { rgb: R % 2 === 0 ? "F0F7F4" : "FFFFFF" }
            },
            alignment: {
              horizontal: "right",
              vertical: "center"
            }
          };
        }
        // Ligne des totaux
        else if (R === 10 + sheetSummaries.length) {
          if (C === 0) {
            cell.s = {
              ...totalRowStyle,
              alignment: {
                horizontal: "left",
                vertical: "center"
              }
            };
          } else {
            cell.s = totalRowStyle;
          }
        }
        // En-tête des paramètres de filtrage
        else if (R === 12 + sheetSummaries.length) {
          cell.s = sectionHeaderStyle;
        }
        // Paramètres de filtrage - étiquettes
        else if (R >= 13 + sheetSummaries.length && R <= 15 + sheetSummaries.length && C === 0) {
          cell.s = metricLabelStyle;
        }
        // Paramètres de filtrage - valeurs
        else if (R >= 13 + sheetSummaries.length && R <= 15 + sheetSummaries.length && C === 1) {
          cell.s = metricValueStyle;
        }
        // En-tête des notes
        else if (R === 17 + sheetSummaries.length) {
          cell.s = noteHeaderStyle;
        }
        // Notes
        else if (R >= 18 + sheetSummaries.length) {
          cell.s = noteStyle;
        }
        
        // Formatage des nombres
        if ((C === 2 || C === 3) && R >= 10) {
          // Colonnes Volume de recherche et Volume moyen
          cell.z = '#,##0';
        }
      }
    }
    
    // Définir les largeurs de colonne
    summaryWorksheet['!cols'] = [
      { wch: 40 }, // Nom de la feuille
      { wch: 15 }, // Mots-clés
      { wch: 18 }, // Volume de recherche
      { wch: 15 }, // Volume moyen
      { wch: 18 }, // % du total
    ];
    
    // Fusionner les cellules pour les titres et en-têtes
    summaryWorksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Titre
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Sous-titre
      { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }, // En-tête Métriques clés
      { s: { r: 8, c: 0 }, e: { r: 8, c: 4 } }, // En-tête Détails des feuilles
      { s: { r: 12 + sheetSummaries.length, c: 0 }, e: { r: 12 + sheetSummaries.length, c: 4 } }, // En-tête Paramètres de filtrage
      { s: { r: 17 + sheetSummaries.length, c: 0 }, e: { r: 17 + sheetSummaries.length, c: 4 } }, // En-tête Notes
    ];
    
    // Définir les hauteurs de ligne
    summaryWorksheet['!rows'] = [];
    for (let i = 0; i <= range.e.r; i++) {
      if (i === 0) {
        summaryWorksheet['!rows'][i] = { hpt: 30 }; // Ligne de titre
      } else if (i === 1) {
        summaryWorksheet['!rows'][i] = { hpt: 25 }; // Ligne de sous-titre
      } else if (i === 3 || i === 8 || i === 12 + sheetSummaries.length || i === 17 + sheetSummaries.length) {
        summaryWorksheet['!rows'][i] = { hpt: 25 }; // En-têtes de section
      } else if (i === 9) {
        summaryWorksheet['!rows'][i] = { hpt: 25 }; // En-tête de tableau
      } else if (i === 10 + sheetSummaries.length) {
        summaryWorksheet['!rows'][i] = { hpt: 25 }; // Ligne des totaux
      } else {
        summaryWorksheet['!rows'][i] = { hpt: 20 }; // Lignes régulières
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '📊 Résumé');
    usedSheetNames.add('📊 Résumé');
  }

  // Then add combined keywords sheet
  const allKeywords = processedFiles.flatMap(file => 
    file.filteredData.map(row => ({
      Keyword: row.Keyword,
      Intent: row.Intent,
      Volume: row.Volume
    }))
  );

  // If remove duplicates is enabled, deduplicate the combined list too
  const finalAllKeywords = removeDuplicates 
    ? deduplicateKeywords(allKeywords)
    : allKeywords;
  
  // Trier les mots-clés par volume (du plus grand au plus petit)
  finalAllKeywords.sort((a, b) => {
    const volumeA = typeof a.Volume === 'string' ? parseInt(a.Volume, 10) : (a.Volume as number);
    const volumeB = typeof b.Volume === 'string' ? parseInt(b.Volume, 10) : (b.Volume as number);
    return volumeB - volumeA; // Ordre décroissant
  });
  
  if (finalAllKeywords.length > 0) {
    const combinedWorksheet = XLSX.utils.json_to_sheet(finalAllKeywords, {
      header: KSUG_FORMATTER_COLUMNS
    });

    const columnWidths = [
      { wch: 40 }, // Keyword
      { wch: 25 }, // Intent
      { wch: 10 }, // Volume
    ];

    const range = XLSX.utils.decode_range(combinedWorksheet['!ref'] || 'A1:C1');
    
    // Update autofilter
    combinedWorksheet['!autofilter'] = { ref: combinedWorksheet['!ref'] || 'A1:C1' };
    
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
          
          if (C === 2) {
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
  processedFiles.forEach(file => {
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

const filterStoreNames = (data: FilteredDataRow[], storeNames: string[]): FilteredDataRow[] => {
  // Créer un tableau d'expressions régulières à partir des noms de magasins
  const storeRegexes = storeNames.map(store => {
    // Normaliser le nom du magasin
    const normalizedStore = store.toLowerCase()
      .replace(/[-&\/\\,.~''"""()[\]{}]/g, '.?')
      .trim();
    
    // Créer une regex qui cherche le nom du magasin comme mot entier
    // avec prise en compte des variations possibles
    return new RegExp(`\\b${normalizedStore}\\b|\\b${normalizedStore}s\\b`, 'i');
  });

  // Filtrer les lignes dont le mot-clé ne contient pas de nom de magasin
  return data.filter(row => {
    // Normaliser le mot-clé pour la comparaison
    const keyword = row.Keyword.toLowerCase();
    
    // Vérifier si le mot-clé contient l'un des noms de magasins
    return !storeRegexes.some(regex => regex.test(keyword));
  });
};