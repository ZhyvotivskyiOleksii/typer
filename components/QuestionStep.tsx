
import React from 'react';

interface QuestionStepProps {
  question: string;
  stepNumber: number;
  onAnswer: (ans: boolean) => void;
  logoSrc?: string;
  logoAlt?: string;
}

const QuestionStep: React.FC<QuestionStepProps> = ({ question, stepNumber, onAnswer, logoSrc, logoAlt }) => {
  return (
    <div className="glass-card p-6 sm:p-8 md:p-10 rounded-[2.5rem] text-center border-green-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <div className="flex justify-center gap-1.5 mb-6 sm:mb-8">
        <div className={`h-1.5 w-8 rounded-full ${stepNumber >= 1 ? 'bg-green-500' : 'bg-white/10'}`}></div>
        <div className={`h-1.5 w-8 rounded-full ${stepNumber >= 2 ? 'bg-green-500' : 'bg-white/10'}`}></div>
      </div>
      
      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-500/10 rounded-2xl mb-4 sm:mb-6 border border-green-500/20 rotate-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {logoSrc && (
        <div className="flex justify-center mb-4 sm:mb-6">
          <div
            className={`rounded-2xl px-6 py-3 ${
              stepNumber === 2
                ? 'bg-[#FFD100] border border-black/10 shadow-[0_10px_25px_rgba(0,0,0,0.25)] px-5 py-2'
                : 'bg-black/20 border border-white/10 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.35)]'
            }`}
          >
            <img
              src={logoSrc}
              alt={logoAlt ?? ''}
              className={`object-contain ${
                stepNumber === 2 ? 'h-5 md:h-6' : 'h-10 md:h-12 filter drop-shadow-md'
              }`}
              loading="eager"
            />
          </div>
        </div>
      )}
      
      <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-7 sm:mb-10 leading-tight italic uppercase tracking-tighter text-white">
        {question}
      </h3>
      
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <button 
          onClick={() => onAnswer(false)}
          className="btn-interact w-full py-4 sm:py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase italic text-lg sm:text-xl shadow-[0_10px_25px_rgba(22,163,74,0.3)] transition-all"
        >
          NIE, CHCĘ BONUS
        </button>
        
        <button 
          onClick={() => onAnswer(true)}
          className="btn-interact w-full py-3 sm:py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl font-bold uppercase italic text-xs sm:text-sm transition-all"
        >
          Tak, już mam konto
        </button>
      </div>
    </div>
  );
};

export default QuestionStep;
