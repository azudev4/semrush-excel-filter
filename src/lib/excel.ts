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
            const volumeValue = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value;
            if (!isNaN(volumeValue) && volumeValue >= minVolume) {
              newRow[key] = volumeValue;
            }
          } else {
            newRow[key] = value;
          }
        }
      });
      return newRow;
    })
    .filter(row => Object.keys(row).length > 0);
}; 