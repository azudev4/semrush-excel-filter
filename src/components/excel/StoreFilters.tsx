import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Store, HelpCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { DEFAULT_STORES } from '@/lib/constants';

interface StoreFiltersProps {
  defaultShops: string[];
  setDefaultShops: (shops: string[]) => void;
  customShops: string[];
  setCustomShops: (shops: string[]) => void;
}

export const StoreFilters: React.FC<StoreFiltersProps> = ({
  defaultShops,
  setDefaultShops,
  customShops,
  setCustomShops,
}) => {
  const [newShop, setNewShop] = useState('');
  const [showStoresList, setShowStoresList] = useState(false);
  const [showDefaultStores, setShowDefaultStores] = useState(true);

  const addShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShop.trim() && !defaultShops.includes(newShop.trim().toLowerCase()) && !customShops.includes(newShop.trim().toLowerCase())) {
      setCustomShops([...customShops, newShop.trim().toLowerCase()]);
      setNewShop('');
    }
  };

  const removeCustomShop = (shopToRemove: string) => {
    setCustomShops(customShops.filter(shop => shop !== shopToRemove));
  };

  const removeDefaultShop = (shopToRemove: string) => {
    setDefaultShops(defaultShops.filter(shop => shop !== shopToRemove));
  };

  return (
    <div className="mb-6">
      <form onSubmit={addShop} className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            value={newShop}
            onChange={(e) => setNewShop(e.target.value)}
            placeholder="Add custom store name to filter"
          />
        </div>
        <Button type="submit">
          <Plus className="w-4 h-4 mr-2" />
          Add Store
        </Button>
      </form>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium">Words to Filter Out:</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0" aria-label="Learn more about word filtering">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Word Filtering</h4>
                <div className="text-sm text-muted-foreground">
                  <p>Any row containing these words (case-insensitive) will be removed from the results. This includes:</p>
                  <ul className="list-disc pl-4 mt-2">
                    <li>Pre-defined list of e-commerce stores</li>
                    <li>Custom words you add using the input above</li>
                  </ul>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {showDefaultStores ? (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="px-3 py-1 cursor-pointer hover:bg-[#004526]/5"
                onClick={() => setShowStoresList(!showStoresList)}
              >
                <Store className="w-3 h-3 mr-1" />
                Famous E-commerce ({defaultShops.length})
                {showStoresList ? 
                  <ChevronUp className="w-3 h-3 ml-1" /> : 
                  <ChevronDown className="w-3 h-3 ml-1" />
                }
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowDefaultStores(false);
                  setDefaultShops([]);
                  setShowStoresList(false);
                }}
                className="h-6 w-6 hover:text-red-500"
                aria-label="Remove Famous E-commerce section"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDefaultStores(true);
                setDefaultShops(DEFAULT_STORES);
              }}
              className="h-7 text-xs hover:bg-[#004526]/5 hover:text-[#004526]"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Famous E-commerce List
            </Button>
          )}
          {customShops.map(shop => (
            <Badge key={shop} variant="secondary" className="px-3 py-1">
              <Store className="w-3 h-3 mr-1" />
              {shop}
              <button
                onClick={() => removeCustomShop(shop)}
                className="ml-2 hover:text-red-500"
                aria-label={`Remove ${shop}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        {showDefaultStores && showStoresList && (
          <div className="mt-2 pl-4 space-y-1">
            {defaultShops.map(shop => (
              <div key={shop} className="flex items-center gap-2 text-sm">
                <Store className="w-3 h-3" />
                {shop}
                <button
                  onClick={() => removeDefaultShop(shop)}
                  className="ml-auto hover:text-red-500"
                  aria-label={`Remove ${shop}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 