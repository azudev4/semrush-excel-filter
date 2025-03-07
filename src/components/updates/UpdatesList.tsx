'use client'

import React, { useEffect, useState } from 'react';
import { fetchGithubCommits, FormattedCommit } from '@/lib/services/githubService';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitCommit, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export const UpdatesList = () => {
  const [commits, setCommits] = useState<FormattedCommit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCommits = async () => {
      try {
        setIsLoading(true);
        const data = await fetchGithubCommits();
        setCommits(data);
        setError(null);
      } catch (err) {
        setError('Failed to load commits. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommits();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 text-[#004526] animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading commit history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-500">No commits found.</p>
      </div>
    );
  }

  // Function to extract PR number from commit message
  const extractPRNumber = (message: string) => {
    const match = message.match(/\(#(\d+)\)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-4">
      {commits.map((commit, index) => {
        const prNumber = extractPRNumber(commit.message);
        
        // Split commit message into title and description
        const [title, ...description] = commit.message.split('\n').map(line => line.trim());
        
        return (
          <motion.div
            key={commit.id}
            className="border border-gray-200 rounded-lg p-4 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-start gap-3">
              <img 
                src={commit.avatarUrl} 
                alt={commit.author} 
                className="w-8 h-8 rounded-full mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-[#004526]">
                      {title.replace(/\(#\d+\)/, '')}
                    </h4>
                    
                    {description.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                        {description.join('\n')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <a 
                      href={commit.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-gray-500 hover:text-[#004526]"
                    >
                      <GitCommit className="h-3 w-3 mr-1" />
                      {commit.id.substring(0, 7)}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a 
                      href={commit.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-[#004526]"
                    >
                      {commit.author}
                    </a>
                    
                    {prNumber && (
                      <Badge variant="secondary" className="px-2 py-0 text-xs">
                        PR #{prNumber}
                      </Badge>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}; 