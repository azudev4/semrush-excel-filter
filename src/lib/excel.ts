import { FilteredDataRow } from './constants';

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
 * Formats and filters data based on exclusion criteria.
 * Removes columns in COLUMNS_TO_EXCLUDE.
 * Ensures rows have Intent fields.
 * Volume filtering is now handled separately by filterByVolume.
 * 
 * @param data Raw data from Excel/CSV
 * @returns Formatted data
 */
export const formatData = (
  data: Record<string, string | number>[]
): FilteredDataRow[] => {
  return data
    .map(row => ({
      Keyword: String(row.Keyword || ''),
      Position: String(row.Position || ''),
      Volume: typeof row.Volume === 'string' ? parseInt(row.Volume.replace(/[,\s]/g, ''), 10) || 0 : (row.Volume as number) || 0,
      Type: String(row.Type || ''),
      Intent: String(row.Intent || '')
    }))
    .filter(row => row.Intent !== '');
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
 * Filters data based on minimum volume threshold
 */
export const filterByVolume = <T extends FilteredDataRow>(
  data: T[], 
  minVolume: number,
): T[] => {
  return data.filter(row => {
    const volume = parseVolume(row.Volume);
    return !isNaN(volume) && volume >= minVolume;
  });
};