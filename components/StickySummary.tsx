
import React from 'react';

interface StickySummaryProps {
  count: number;
  max: number;
  disabled: boolean;
  onSubmit: () => void;
}

const StickySummary: React.FC<StickySummaryProps> = ({ count, max, disabled, onSubmit }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 pb-6 bg-black/90 border-t border-white/5 backdrop-blur-md z-[100]">
      <div className="max-w-xl mx-auto flex items-center gap-3 bg-white/[0.03] p-2 rounded-xl border border-white/5">
        <div className="flex-1 pl-1">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Kupon</span>
            <span className="text-[10px] font-black text-green-500">{count}/{max}</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full shadow-[0_0_10px_rgba(34,197,94,0.6)] transition-all duration-700 ease-out" 
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
        
        <button 
          onClick={onSubmit}
          disabled={disabled}
          className={`px-4 py-3 rounded-lg font-black uppercase italic tracking-tighter transition-all text-xs whitespace-nowrap ${
            disabled 
              ? 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5' 
              : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20 active:scale-95 border-b-2 border-green-800'
          }`}
        >
          {count === max ? 'Zatwierdź' : 'Graj dalej'}
        </button>
      </div>
    </div>
  );
};

export default StickySummary;
