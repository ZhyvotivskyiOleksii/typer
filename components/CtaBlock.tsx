
import React from 'react';
import { BonusOffer } from '../types';

interface CtaBlockProps {
  offer: BonusOffer;
  onCtaClick: () => void;
}

const CtaBlock: React.FC<CtaBlockProps> = ({ offer, onCtaClick }) => {
  return (
    <div className="glass-card overflow-hidden rounded-3xl shadow-2xl border-2 border-green-500/30">
      <div className="bg-gradient-to-r from-green-900/40 to-black p-8 text-center border-b border-white/10">
        <img 
          src={offer.logo} 
          alt={offer.name} 
          className="h-12 mx-auto mb-6 object-contain filter drop-shadow-md"
        />
        <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-4">
          Wspaniale! <br/> Twój bonus jest gotowy.
        </h3>
        <p className="text-gray-300 text-lg md:text-xl font-medium max-w-sm mx-auto">
          {offer.description}
        </p>
      </div>
      
      <div className="p-8">
        <a 
          href={offer.link}
          onClick={onCtaClick}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-6 bg-green-600 hover:bg-green-500 text-white text-center font-black text-2xl uppercase italic tracking-tighter rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-green-900/40"
        >
          {offer.ctaText}
        </a>
        <p className="mt-6 text-gray-500 text-[10px] text-center uppercase tracking-widest font-bold">
          Klikając powyższy przycisk zostaniesz przekierowany do strony rejestracji partnera.
        </p>
      </div>
    </div>
  );
};

export default CtaBlock;
