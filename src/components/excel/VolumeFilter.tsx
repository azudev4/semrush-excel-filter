import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface VolumeFilterProps {
  minVolume: number;
  setMinVolume: (volume: number) => void;
}

export const VolumeFilter: React.FC<VolumeFilterProps> = ({
  minVolume,
  setMinVolume,
}) => {
  const [inputValue, setInputValue] = useState(minVolume.toString());

  useEffect(() => {
    setInputValue(minVolume.toString());
  }, [minVolume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value === '') {
      setMinVolume(0);
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setMinVolume(numValue);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <motion.div 
        className="flex items-center justify-between gap-2 mb-4" 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 bg-[#004526] rounded-full" />
          <h3 className="text-base font-medium">Minimum Search Volume</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Volume Filter</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>This filter removes keywords with low search volume from your dataset.</p>
                  <p>Only keywords with at least {minVolume} searches per month will be included in the results.</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={inputValue}
            onChange={handleVolumeChange}
            className="w-32 focus-visible:ring-[#004526]"
            placeholder="Min Volume"
          />
          <span className="text-sm text-muted-foreground">searches/month</span>
        </div>
      </motion.div>
    </div>
  );
}; 