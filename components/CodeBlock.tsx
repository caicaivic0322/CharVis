import React from 'react';

interface CodeBlockProps {
  code: string;
  activeLine?: number; // 0-based index
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, activeLine }) => {
  const lines = code.trim().split('\n');

  return (
    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-slate-700 shadow-inner">
      <div className="flex flex-col min-w-max">
        {lines.map((line, idx) => (
          <div 
            key={idx} 
            className={`flex px-2 py-0.5 rounded ${activeLine === idx ? 'bg-blue-900/50 border-l-2 border-blue-400' : ''}`}
          >
            <span className="text-slate-600 w-8 select-none text-right mr-4">{idx + 1}</span>
            <pre className={`
              ${line.trim().startsWith('//') ? 'text-slate-500 italic' : 'text-slate-300'}
              ${activeLine === idx ? 'text-white font-bold' : ''}
            `}>
              {line}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeBlock;
