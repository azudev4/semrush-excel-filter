import React from 'react';
import { ToolIntro } from "@/components/common/ToolIntro";
import { GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UpdatesList } from "@/components/updates/UpdatesList";

export default function UpdatesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-8 pt-20">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolIntro 
          title="Latest Updates"
          description="Stay informed about the most recent changes, improvements, and new features added to the SEO tools suite."
          icon={<GitBranch className="w-6 h-6 text-[#004526]" />}
        />
        
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1 bg-[#004526] rounded-full" />
              <h3 className="text-base font-medium">Recent Changes</h3>
            </div>
            
            <UpdatesList />

            <div className="mt-8 pt-4 border-t border-[#004526]/10 text-sm text-gray-500">
              <p>
                For more detailed information, visit the{' '}
                <a 
                  href="https://github.com/azudev4/semrush-excel-filter" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#004526] hover:underline"
                >
                  GitHub repository
                </a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 