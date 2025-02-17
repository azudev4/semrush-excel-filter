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

export const formatData = (data: any[], minVolume: number): any[] => {
  return data
    .map(row => {
      const newRow: any = {};
      Object.entries(row).forEach(([key, value]) => {
        if (!COLUMNS_TO_EXCLUDE.includes(key)) {
          if (key === 'Volume') {
            newRow[key] = typeof value === 'string' 
              ? parseInt(value.replace(/[^0-9]/g, ''), 10) 
              : typeof value === 'number' ? value : 0;
          } else {
            newRow[key] = value;
          }
        }
      });
      return newRow;
    })
    .filter(row => {
      const volume = row.Volume;
      return !isNaN(volume) && volume >= minVolume;
    });
}; 