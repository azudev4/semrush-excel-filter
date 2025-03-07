import { FilteredDataRow, KW_RELEVANCY_COLUMNS } from './constants';

/**
 * Formats a filename into a clean sheet name.
 * Takes the part before the first underscore, splits by hyphens,
 * and capitalizes each word.
 * 
 * @param fileName The original file name
 * @returns A formatted sheet name
 */
export const formatSheetName = (fileName: string): string => {
  // Get the part before file extension
  const nameWithoutExtension = fileName.split('.')[0];
  
  // Get the keyword part before the first underscore
  const keywordPart = nameWithoutExtension.split('_')[0];
  
  // Split the keyword part by hyphens and format each word
  return keywordPart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formats and filters data based on provided columns.
 * 
 * @param data Raw data from Excel/CSV
 * @param columns Array of column names to include in the output
 * @param filterEmptyIntent Whether to filter out rows with empty Intent values
 * @returns Formatted data with only the specified columns
 */
export const formatData = (
  data: Record<string, string | number>[],
  columns: string[] = KW_RELEVANCY_COLUMNS,
  filterEmptyIntent: boolean = true  // Add parameter to control Intent filtering
): FilteredDataRow[] => {
  const mapped = data
    .map(row => {
      const formattedRow: Partial<FilteredDataRow> = {};
      
      // Always include Keyword
      formattedRow.Keyword = String(row.Keyword || '');
      
      // Include Volume with proper formatting
      formattedRow.Volume = typeof row.Volume === 'string' 
        ? parseInt(row.Volume.replace(/[,\s]/g, ''), 10) || 0 
        : (row.Volume as number) || 0;
      
      // Conditionally add other fields based on columns array
      if (columns.includes('Position')) {
        formattedRow.Position = String(row.Position || '');
      }
      
      if (columns.includes('Type')) {
        formattedRow.Type = String(row.Type || '');
      }
      
      if (columns.includes('Intent')) {
        formattedRow.Intent = String(row.Intent || '');
      }
      
      if (columns.includes('URL')) {
        formattedRow.URL = String(row.URL || '');
      }
      
      return formattedRow as FilteredDataRow;
    });
    
  // Only filter by Intent if filterEmptyIntent is true
  if (filterEmptyIntent && columns.includes('Intent')) {
    return mapped.filter(row => row.Intent !== undefined && row.Intent !== '');
  }
  
  return mapped;
};

/**
 * Parses and normalizes volume values from different formats
 * 
 * @param value Volume value which could be string or number
 * @returns Normalized volume as a number
 */
export const parseVolume = (value: string | number): number => {
  if (typeof value === 'string') {
    // Handle string values that might contain commas or other formatting
    return parseInt(value.replace(/[,\s]/g, ''), 10) || 0;
  } else if (typeof value === 'number') {
    return value;
  }
  return 0;
};

/**
 * Filters data based on minimum volume threshold.
 * If minVolume is 0, returns all data without filtering.
 */
export const filterByVolume = <T extends {Volume: number}>(
  data: T[], 
  minVolume: number,
): T[] => {
  // Skip volume filtering when minVolume is 0
  if (minVolume === 0) {
    return data;
  }
  
  return data.filter(row => {
    const volume = parseVolume(row.Volume);
    return !isNaN(volume) && volume >= minVolume;
  });
};

/**
 * Normalizes a keyword for comparison to detect similar keywords
 * - Converts to lowercase
 * - Normalizes accented characters (é->e, ç->c, etc.)
 * - Removes hyphens, special characters
 * - Standardizes whitespace
 * - Handles basic stemming (e.g., plurals, common variations)
 */
export const normalizeKeyword = (keyword: string): string => {
  if (!keyword) return '';
  
  // Convert to lowercase
  let normalized = keyword.toLowerCase();
  
  // Normalize accented characters (é->e, ç->c, ñ->n, etc.)
  normalized = normalized
    .normalize('NFD')                   // Decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')    // Remove diacritical marks
    .replace(/œ/g, 'oe')                // Handle special ligatures like œ
    .replace(/æ/g, 'ae')                // Handle æ ligature
    .replace(/ø/g, 'o')                 // Handle ø (used in Nordic languages)
    .replace(/ß/g, 'ss');               // Handle German eszett
  
  // Remove special characters and standardize separators
  normalized = normalized
    .replace(/[-_&\/\\,.~''"""()[\]{}]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ')                     // Standardize whitespace
    .trim();                                   // Remove leading/trailing whitespace
  
  // Basic stemming for plurals (very simplified)
  // This could be expanded with a proper stemming library for better results
  normalized = normalized
    .replace(/(\w+)s\b/g, '$1')   // Remove trailing 's' for basic plural handling
    .replace(/(\w+)es\b/g, '$1')  // Handle 'es' plurals
    .replace(/(\w+)ies\b/g, '$1y') // Handle 'ies' plurals (e.g., categories -> category)
    // French plural forms
    .replace(/(\w+)aux\b/g, '$1al')  // Handle French "-aux" plurals
    .replace(/(\w+)eux\b/g, '$1eu');  // Handle French "-eux" plurals
  
  return normalized;
};

/**
 * Groups similar keywords and keeps only the one with highest volume
 */
export const deduplicateKeywords = <T extends { Keyword: string; Volume: number | string }>(
  data: T[]
): T[] => {
  // Group by normalized keyword
  const groupedKeywords: Record<string, T[]> = {};
  
  data.forEach(item => {
    const normalizedKeyword = normalizeKeyword(item.Keyword);
    if (!groupedKeywords[normalizedKeyword]) {
      groupedKeywords[normalizedKeyword] = [];
    }
    groupedKeywords[normalizedKeyword].push(item);
  });
  
  // For each group, keep only the item with highest volume
  const deduplicated: T[] = [];
  
  Object.values(groupedKeywords).forEach(group => {
    // Sort by volume in descending order and take the first one
    const sorted = [...group].sort((a, b) => {
      const volumeA = typeof a.Volume === 'number' ? a.Volume : parseInt(String(a.Volume), 10) || 0;
      const volumeB = typeof b.Volume === 'number' ? b.Volume : parseInt(String(b.Volume), 10) || 0;
      return volumeB - volumeA;
    });
    
    deduplicated.push(sorted[0]);
  });
  
  return deduplicated;
};