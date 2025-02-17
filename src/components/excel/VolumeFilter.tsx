import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from 'lucide-react';

interface VolumeFilterProps {
  minVolume: number;
  setMinVolume: (volume: number) => void;
}

export const VolumeFilter: React.FC<VolumeFilterProps> = ({
  minVolume,
  setMinVolume,
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setMinVolume(value);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Minimum Search Volume:</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Data Processing Rules</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>The following filters are applied to your data:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Removes rows with volume less than {minVolume}</li>
                    <li>Excludes columns: CPC, SERP Features, Keyword Difficulty</li>
                    <li>Only keeps the Keyword, Intent, and Volume columns</li>
                  </ul>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={minVolume}
            onChange={handleVolumeChange}
            className="w-32 focus-visible:ring-[#004526]"
            placeholder="Min Volume"
          />
          <span className="text-sm text-muted-foreground">searches/month</span>
        </div>
      </div>
    </div>
  );
}; 