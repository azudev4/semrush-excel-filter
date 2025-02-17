export const DEFAULT_STORES = [
  'lacoste', 'zalando', 'asos', 'amazon', 'farfetch', 'mytheresa',
  'net-a-porter', 'matchesfashion', 'ssense', 'nordstrom', 'shopbop',
  'luisaviaroma', 'ralph lauren', 'tommy hilfiger', 'calvin klein',
  'hugo boss', 'nike', 'adidas', 'puma', 'the outnet', 'yoox',
  'end clothing', 'mr porter', 'browns fashion', 'flannels', 'selfridges',
  'harrods', 'bloomingdales', 'saks fifth avenue', 'neiman marcus',
  'bergdorf goodman', 'galeries lafayette', 'printemps', 'la redoute',
  'spartoo', 'about you', 'boozt', 'breuninger'
];

export const COLUMNS_TO_EXCLUDE = ['CPC (USD)', 'SERP Features', 'Keyword Difficulty'];
export const DEFAULT_MIN_VOLUME = 100;

export interface FileData {
  id: string;
  originalData: any[];
  filteredData: any[];
  fileName: string;
  sheetName: string;
  originalRows: number;
  filteredRows: number;
  storeFilteredRows: number;
  volumeFilteredRows: number;
}

export interface ExtendedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
} 