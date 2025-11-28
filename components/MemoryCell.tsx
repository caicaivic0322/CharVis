import React from 'react';
import { CharData } from '../types';

interface MemoryCellProps {
  data: CharData;
  isLeft?: boolean;
  isRight?: boolean;
  isSwapping?: boolean;
  highlight?: boolean;
}

const MemoryCell: React.FC<MemoryCellProps> = ({ 
  data, 
  isLeft, 
  isRight, 
  isSwapping,
  highlight 
}) => {
  const isNullTerminator = data.char === '\\0';
  const asciiValue = isNullTerminator ? 0 : data.char.charCodeAt(0);
  
  // Base colors
  let borderColor = "border-slate-700";
  let bgGradient = "bg-gradient-to-b from-slate-800 to-slate-900";
  let textColor = "text-slate-100";
  let asciiColor = "text-slate-400";
  let indexBg = "bg-slate-800";
  
  // State specific overrides
  if (highlight) {
    borderColor = "border-amber-500";
    bgGradient = "bg-gradient-to-b from-amber-900/30 to-amber-950/30";
    textColor = "text-amber-100";
    asciiColor = "text-amber-200";
    indexBg = "bg-amber-900/40";
  } else if (isSwapping) {
    borderColor = "border-purple-500";
    bgGradient = "bg-gradient-to-b from-purple-900/30 to-purple-950/30";
    textColor = "text-purple-100";
    asciiColor = "text-purple-200";
    indexBg = "bg-purple-900/40";
  } else if (isNullTerminator) {
    borderColor = "border-red-500/40";
    bgGradient = "bg-gradient-to-b from-red-900/20 to-red-950/20";
    textColor = "text-red-400";
    asciiColor = "text-red-300";
    indexBg = "bg-red-900/30";
  }

  return (
    <div className="flex flex-col items-center relative mx-1.5 transition-all duration-300 group select-none">
      {/* Pointers Top (Left) */}
      <div className="h-8 flex items-end justify-center mb-1 w-full relative">
        {isLeft && (
          <div className="absolute flex flex-col items-center text-cyan-400 animate-bounce transition-transform duration-300 z-10" style={{ bottom: -6 }}>
            <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 shadow-black drop-shadow-md bg-cyan-950/80 px-1.5 py-0.5 rounded text-cyan-200 border border-cyan-500/30">Left</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="rotate-180 filter drop-shadow-lg text-cyan-400">
              <path d="M12 0L24 24H0L12 0Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Main Cell Card */}
      <div 
        className={`
          w-16 h-24 md:w-20 md:h-28 
          border-2 ${borderColor} ${bgGradient}
          rounded-lg flex flex-col
          shadow-lg shadow-black/20 relative overflow-hidden
          transition-all duration-300
        `}
      >
        {/* Index Tag */}
        <div className={`absolute top-0 left-0 px-1.5 py-0.5 ${indexBg} border-b border-r border-white/5 rounded-br text-[10px] font-mono text-slate-500`}>
          {data.index}
        </div>
        
        {/* Character */}
        <div className="flex-1 flex items-center justify-center pt-2">
          <span className={`font-mono text-3xl md:text-4xl font-bold ${textColor} drop-shadow-sm`}>
            {data.char}
          </span>
        </div>

        {/* ASCII Section */}
        <div className="h-7 w-full bg-black/20 flex items-center justify-between px-2.5 border-t border-white/5 backdrop-blur-sm">
           <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">ASCII</span>
           <span className={`text-xs font-mono font-medium ${asciiColor}`}>
             {asciiValue}
           </span>
        </div>
      </div>

      {/* Address */}
      <div className="mt-2 text-[10px] text-slate-600 font-mono tracking-tight group-hover:text-slate-400 transition-colors">
        {data.address}
      </div>

      {/* Pointers Bottom (Right) */}
      <div className="h-8 flex items-start justify-center mt-1 w-full relative">
        {isRight && (
          <div className="absolute flex flex-col items-center text-emerald-400 animate-bounce transition-transform duration-300 z-10" style={{ top: -6 }}>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="filter drop-shadow-lg text-emerald-400">
              <path d="M12 0L24 24H0L12 0Z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 shadow-black drop-shadow-md bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-200 border border-emerald-500/30">Right</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCell;