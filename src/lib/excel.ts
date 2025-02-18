import { COLUMNS_TO_EXCLUDE } from './constants';

export const formatSheetName = (fileName: string): string => {
  const nameWithoutExtension = fileName.split('.')[0];
  const baseName = nameWithoutExtension.split('_broad')[0]
    .split('_exact')[0]
    .split('_phrase')[0];
  return baseName.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatData = (
  data: Record<string, string | number>[],
  minVolume: number
): Record<string, string | number>[] => {
  return data
    .map(row => {
      const newRow: Record<string, string | number> = {};
      Object.entries(row).forEach(([key, value]) => {
        if (!COLUMNS_TO_EXCLUDE.includes(key)) {
          if (key === 'Volume') {
            let volumeValue: number;
            if (typeof value === 'string') {
              // Handle string values that might contain commas or other formatting
              volumeValue = parseInt(value.replace(/[,\s]/g, ''), 10);
            } else if (typeof value === 'number') {
              volumeValue = value;
            } else {
              volumeValue = 0;
            }
            
            if (!isNaN(volumeValue) && volumeValue >= minVolume) {
              newRow[key] = volumeValue;
            }
          } else if (key === 'Intent') {
            // Ensure Intent values are preserved as strings
            newRow[key] = value ? String(value).trim() : '';
          } else {
            newRow[key] = value;
          }
        }
      });
      return newRow;
    })
    .filter(row => 
      Object.keys(row).length > 0 && 
      // Only keep rows that have both Volume and Intent
      (row.Volume !== undefined && row.Volume !== null) &&
      (row.Intent !== undefined && row.Intent !== '')
    );
}; 