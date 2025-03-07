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