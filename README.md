# Lacoste Semrush Excel Tools

A Next.js application designed to process, analyze, and optimize Semrush keyword data, specifically tailored for Lacoste's e-commerce SEO needs. This comprehensive toolkit offers two powerful modes: the KSUG Formatter for cleaning and filtering keyword exports, and the Keyword Relevancy Analysis tool for competitor research and opportunity identification. With a modern UI and advanced data processing capabilities, this application streamlines SEO workflows and delivers actionable insights through professionally formatted Excel reports.

## Features

### KSUG Formatter
- **File Processing**
  - Support for multiple Excel (.xlsx, .xls) and CSV files
  - Bulk upload via folder selection
  - Drag-and-drop file upload interface
  - Progress tracking during file processing
  - Large file handling with warning dialogs

- **Advanced Filtering**
  - Remove rows containing e-commerce competitor names
  - Filter keywords based on minimum search volume
  - Pre-configured list of 400+ major fashion brands and retailers
  - Custom store name filtering
  - Maintains essential columns (Keyword, Intent, and Volume)

- **Data Management**
  - Customizable sheet names for each file
  - Automatic sheet name formatting from filenames
  - Real-time file processing and reprocessing
  - Individual file removal capability
  - Detailed row filtering statistics

- **Export Features**
  - Combined Excel workbook output
  - Optional summary sheet with total volumes
  - "All Keywords" sheet combining data from all files
  - Interactive hyperlinks in summary sheet for quick navigation
  - Professional styling with alternating row colors
  - Formatted headers and cell borders
  - Custom filename for export

### NEW! Keyword Relevancy Analysis
- **Competitor Analysis**
  - Upload multiple Semrush exports for different competitors
  - Identify keyword overlaps across competitors
  - Discover keyword opportunities by volume and prevalence
  - Analyze keyword ranking positions across competitors

- **Advanced Report Generation**
  - Summary sheet with key metrics
  - Detailed breakdown of best-performing keywords
  - Competitor position analysis
  - Main keyword-focused reporting
  - Individual sheets for each competitor
  - Professional styling with branded colors

## Technical Stack

- **Frontend Framework**: Next.js 15.1.7 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Excel Processing**: xlsx-js-style
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.0 or later
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
npx shadcn-ui@latest add dialog
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### KSUG Formatter Mode

1. **Upload Files**
   - Click the upload area or drag and drop Excel/CSV files
   - Alternatively, select a folder containing multiple files
   - Files will be processed automatically
   - Large files will show a warning dialog

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

### NEW! Keyword Relevancy Mode

1. **Set Analysis Parameters**
   - Enter the main keyword you're analyzing
   - Set minimum volume threshold

2. **Upload Competitor Files**
   - Upload Semrush export files for each competitor
   - Each file should contain keyword rankings for a different competitor

3. **Customize Output**
   - Edit competitor sheet names
   - Set output filename

4. **Generate Report**
   - Click "Download Combined File" to generate the analysis
   - Review the summary sheet for keyword opportunities
   - See which keywords appear across multiple competitors
   - Identify best ranking positions for each keyword

## Data Processing Rules

- Removes rows containing any configured store names (case-insensitive)
- Filters out keywords with search volume below the specified threshold
- Excludes columns: CPC (USD), SERP Features, Keyword Difficulty
- Retains only: Keyword, Intent, and Volume columns
- Formats numbers with thousands separators
- Applies consistent styling across all sheets

## Contributing

This tool was specifically developed for Lacoste's SEO needs and their unique requirements. As such, it's not actively seeking contributions. However, I'm working on a public version of this Excel filtering tool that will be more generalized and open for community contributions. Stay tuned to my GitHub profile (@azudev4) for updates on this upcoming project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide](https://lucide.dev/)
- Excel processing powered by [xlsx-js-style](https://github.com/gitbrent/xlsx-js-style)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## Codebase Structure

The application is organized into several key components and modules:

### Core Configuration (`src/lib/constants.ts`)
- `DEFAULT_STORES`: List of 400+ competitor brands and retailers to filter out
- `ACCEPTED_FILE_TYPES`: Supported file formats (.xlsx, .xls, .csv)
- `COLUMNS_TO_EXCLUDE`: Semrush columns to remove from output
- `DEFAULT_MIN_VOLUME`: Default minimum search volume threshold

### Utilities & Core Logic (`src/lib/excel.ts`)
- `formatSheetName`: Formats file names into clean sheet names
- `formatData`: Core data filtering and transformation logic
- `parseVolume`: Normalizes volume values across different formats
- `filterByVolume`: Generic function for volume-based filtering

### Excel Processing Services (`src/lib/services/`)
- `excelProcessor.ts`: Processing logic for KSUG Formatter
- `kwRelevancyProcessor.ts`: Processing logic for Keyword Relevancy Analysis

### UI Components (`src/components/excel/`)
- `FileUpload.tsx`: File upload interface with drag-and-drop
- `FileList.tsx`: Processed files management
- `StoreFilters.tsx`: Competitor filter management
- `VolumeFilter.tsx`: Search volume threshold controls
- `DownloadSection.tsx`: Export options and controls
- `LargeFileDialog.tsx`: Large file warning dialog
- `DownloadProgressDialog.tsx`: Download progress indicator

### Container Components (`src/components/container/`)
- `ExcelFilterApp.tsx`: Main KSUG filtering application
- `KwRelevancyApp.tsx`: Keyword relevancy analysis application

### Navigation & Layout (`src/components/navigation/`)
- `MainNav.tsx`: Navigation between different app modes
- `PageTransition.tsx`: Smooth transitions between pages

### Styling
- Uses Tailwind CSS for styling
- Global styles in `app/globals.css`
- Lacoste brand color (#004526) theming