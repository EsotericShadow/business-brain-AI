import React from 'react';

interface SpreadsheetViewProps {
  content: string[][];
  onUpdate: (newContent: string[][]) => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ content, onUpdate }) => {
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newContent = content.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
      }
      return row;
    });
    onUpdate(newContent);
  };

  if (!content || content.length === 0) {
    return <div className="text-center text-gray-500 dark:text-gray-400">This spreadsheet is empty.</div>;
  }
  
  const [header, ...rows] = content;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {header.map((cell, index) => (
              <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <input
                  type="text"
                  value={cell}
                  onChange={(e) => handleCellChange(0, index, e.target.value)}
                  className="w-full bg-transparent p-0 border-none focus:ring-0 font-medium"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="px-1 py-1 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex + 1, colIndex, e.target.value)}
                    className="w-full p-2 bg-transparent border border-transparent rounded-md focus:bg-white dark:focus:bg-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
