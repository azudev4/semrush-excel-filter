import type { InputHTMLAttributes } from 'react';

export const DEFAULT_STORES = [
  'zalando', 'asos', 'amazon', 'farfetch', 'mytheresa',
  'net-a-porter', 'matchesfashion', 'ssense', 'nordstrom', 'shopbop',
  'luisaviaroma', 'ralph lauren', 'tommy hilfiger', 'calvin klein',
  'hugo boss', 'nike', 'adidas', 'puma', 'the outnet', 'yoox',
  'end clothing', 'mr porter', 'browns fashion', 'flannels', 'selfridges',
  'harrods', 'bloomingdales', 'saks fifth avenue', 'neiman marcus',
  'bergdorf goodman', 'galeries lafayette', 'printemps', 'la redoute',
  'spartoo', 'about you', 'boozt', 'breuninger', 'uniqlo', 'zara',
  'von dutch', 'h&m', 'mango', 'bershka', 'pull&bear', 'massimo dutti',
  'stradivarius', 'urban outfitters', 'cos', 'arket', 'weekday',
  'monki', '& other stories', 'foot locker', 'jd sports', 'size?',
  'snipes', 'office', 'schuh', 'apc', 'sandro', 'maje', 'the kooples',
  'fendi', 'gucci', 'prada', 'louis vuitton', 'dior', 'balenciaga',
  'saint laurent', 'bottega veneta', 'burberry', 'versace', 'valentino',
  'dolce & gabbana', 'alexander mcqueen', 'givenchy', 'loewe', 'celine',
  'chanel', 'hermes', 'stone island', 'off-white', 'palm angels',
  'amiri', 'fear of god', 'acne studios', 'ami paris', 'maison margiela',
  'rick owens', 'thom browne', 'jil sander', 'jacquemus', 'lemaire',
  'carhartt', 'dickies', 'champion', 'the north face', 'patagonia',
  'columbia', 'vans', 'converse', 'new balance', 'reebok', 'asics',
  'under armour', 'fila', 'ellesse', 'kappa', 'napapijri', 'fred perry'
];

export const ACCEPTED_FILE_TYPES = ['.xlsx', '.xls', '.csv'] as const;
export const COLUMNS_TO_EXCLUDE = ['CPC (USD)', 'SERP Features', 'Keyword Difficulty'];
export const DEFAULT_MIN_VOLUME = 100;

export interface FileData {
  id: string;
  originalData: Record<string, string | number>[];
  filteredData: Record<string, string | number>[];
  fileName: string;
  sheetName: string;
  originalRows: number;
  filteredRows: number;
  storeFilteredRows: number;
  volumeFilteredRows: number;
}

export interface ExtendedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
} 