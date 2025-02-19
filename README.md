# Lacoste Semrush Excel Filter App

A Next.js application designed to process and filter Semrush keyword suggestion exports, specifically tailored for Lacoste's e-commerce SEO needs. This tool helps clean up keyword suggestion data by removing competitor-related terms and low-volume keywords while providing a clean, formatted Excel output.

## Features

- **File Processing**
  - Support for multiple Excel (.xlsx, .xls) and CSV files
  - Bulk upload via folder selection
  - Drag-and-drop file upload interface
  - Progress tracking during file processing

- **Advanced Filtering**
  - Remove rows containing e-commerce competitor names
  - Filter keywords based on minimum search volume
  - Pre-configured list of 89+ major fashion brands and retailers
  - Custom store name filtering
  - Maintains essential columns (Keyword, Intent, Volume)

- **Data Management**
  - Customizable sheet names for each file
  - Automatic sheet name formatting from filenames
  - Real-time file processing and reprocessing
  - Individual file removal capability

- **Export Features**
  - Combined Excel workbook output
  - Optional summary sheet with total volumes
  - "All Keywords" sheet combining data from all files
  - Interactive hyperlinks in summary sheet for quick navigation
  - Professional styling with alternating row colors
  - Formatted headers and cell borders
  - Custom filename for export

## Technical Stack

- **Frontend Framework**: Next.js (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Excel Processing**: xlsx-js-style
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/azudev4/semrush-excel-filter.git
cd semrush-excel-filter
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install required shadcn/ui components:
```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add table
npx shadcn-ui@latest add progress
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Files**
   - Click the upload area or drag and drop Excel/CSV files
   - Alternatively, select a folder containing multiple files
   - Files will be processed automatically

2. **Configure Filters**
   - Adjust minimum search volume threshold
   - Add or remove e-commerce store names from the filter list
   - Add custom store names to filter out

3. **Customize Output**
   - Edit individual sheet names
   - Set output filename
   - Toggle summary sheet inclusion

4. **Export Results**
   - Click "Download Combined File" to get the processed Excel workbook
   - Each file will be in its own sheet
   - Optional summary sheet with total volumes and hyperlinks to individual sheets
   - "All Keywords" sheet containing combined data from all processed files


## Data Processing Rules

- Removes rows containing any configured store names (case-insensitive)
- Filters out keywords with search volume below the specified threshold
- Excludes columns: CPC (USD), SERP Features, Keyword Difficulty
- Retains only: Keyword, Intent, and Volume columns
- Formats numbers with thousands separators
- Applies consistent styling across all sheets

##Contributing

This tool was specifically developed for Lacoste's SEO needs and their unique requirements. As such, it's not actively seeking contributions. However, I'm working on a public version of this Excel filtering tool that will be more generalized and open for community contributions. Stay tuned to my GitHub profile (@azudev4) for updates on this upcoming project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide](https://lucide.dev/)
- Excel processing powered by [xlsx-js-style](https://github.com/gitbrent/xlsx-js-style)

## Codebase Structure

The application is organized into several key components and modules:

### Core Configuration (`src/lib/constants.ts`)
- `DEFAULT_STORES`: List of 89+ competitor brands and retailers to filter out
- `ACCEPTED_FILE_TYPES`: Supported file formats (.xlsx, .xls, .csv)
- `COLUMNS_TO_EXCLUDE`: Semrush columns to remove from output
- `DEFAULT_MIN_VOLUME`: Default minimum search volume threshold

### Excel Processing (`src/lib/services/excelProcessor.ts`)
- Main logic for processing Excel and CSV files
- Handles file reading, parsing, and data transformation
- Manages Excel workbook creation and styling
- Implements sheet generation and formatting

### Data Formatting (`src/lib/excel.ts`)
- Functions for formatting sheet names
- Data filtering and transformation logic
- Volume parsing and validation

### UI Components (`src/components/excel/`)
- `FileUpload.tsx`: File upload interface with drag-and-drop
- `FileList.tsx`: Processed files management
- `StoreFilters.tsx`: Competitor filter management
- `VolumeFilter.tsx`: Search volume threshold controls
- `DownloadSection.tsx`: Export options and controls

### Container Component (`src/components/container/`)
- `ExcelFilterApp.tsx`: Main application component
- Manages state and data flow
- Coordinates between UI components and processing logic

### Styling
- Uses Tailwind CSS for styling
- Global styles in `app/globals.css`
- Lacoste brand color (#004526) theming