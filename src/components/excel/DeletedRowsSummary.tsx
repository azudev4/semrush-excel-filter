import React from 'react';

interface DeletedRowsSummaryProps {
  volumeFilterCount: number;
  defaultShopCount: number;
  customWordsCount: number;
}

const DeletedRowsSummary: React.FC<DeletedRowsSummaryProps> = ({
  volumeFilterCount,
  defaultShopCount,
  customWordsCount,
}) => {
  return (
    <div className="mt-4 mb-4 p-4 bg-gray-100 rounded">
      <p className="text-sm text-gray-500">
        Rows removed by filters:
      </p>
      <div className="flex gap-6 mt-2">
        <p className="text-sm">
          Volume: <strong>{volumeFilterCount}</strong>
        </p>
        <p className="text-sm">
          Default Shop: <strong>{defaultShopCount}</strong>
        </p>
        <p className="text-sm">
          Custom Words: <strong>{customWordsCount}</strong>
        </p>
      </div>
    </div>
  );
};

export default DeletedRowsSummary; 