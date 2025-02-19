import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { X, Trash2 } from 'lucide-react';
import { FileData } from '@/lib/constants';

interface FileListProps {
  files: FileData[];
  removeFile: (id: string) => void;
  updateSheetName: (id: string, name: string) => void;
  clearAllFiles: () => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  removeFile,
  updateSheetName,
  clearAllFiles,
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-[#004526]/3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-[#004526] rounded-full" />
            <h4 className="text-sm font-medium">Uploaded Files</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFiles}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#004526]/3">
              <TableHead>Sheet Name</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead className="text-right">Original Rows</TableHead>
              <TableHead className="text-right">Filtered Rows</TableHead>
              <TableHead className="text-right">Final Rows</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map(file => (
              <TableRow key={file.id} className="hover:bg-[#004526]/3">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={file.sheetName}
                      onChange={(e) => {
                        const newName = e.target.value.trim();
                        if (newName) {
                          updateSheetName(file.id, newName);
                        }
                      }}
                      className="h-8 w-full focus-visible:ring-[#004526]"
                      placeholder="Sheet name"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{file.fileName}</TableCell>
                <TableCell className="text-right">{file.originalRows}</TableCell>
                <TableCell className="text-right text-red-500">-{file.storeFilteredRows + file.volumeFilteredRows}</TableCell>
                <TableCell className="text-right font-medium text-[#004526]">{file.filteredRows}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 