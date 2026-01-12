
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full pt-6 pb-3 sm:pt-8 sm:pb-4 text-center px-4 relative">
      <h1 className="text-[13vw] sm:text-7xl md:text-8xl font-black mb-1 tracking-tighter leading-none italic uppercase flex flex-col sm:flex-row items-center justify-center gap-x-3">
        <span className="text-white drop-shadow-sm">WEEKLY</span>
        <span className="text-green-500 relative inline-block">
          TYPER
          {/* Czysty gradient bez rozmycia (glow) */}
          <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-700 pointer-events-none select-none">
            TYPER
          </span>
        </span>
      </h1>
    </header>
  );
};

export default Header;
