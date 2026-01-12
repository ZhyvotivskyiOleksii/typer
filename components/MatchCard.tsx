
import React, { useState, useEffect, useRef } from 'react';
import { Match, Prediction } from '../types';
import { getTeamLogoUrl } from '../services/api';

interface MatchCardProps {
  match: Match;
  currentPick: Prediction;
  onPick: (p: Prediction) => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

const SoccerBallIcon = ({ className = "w-6 h-6 opacity-50" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1"/>
    <path d="M12 2L15 8.5L22 9.5L17 14.5L18.5 21.5L12 18L5.5 21.5L7 14.5L2 9.5L9 8.5L12 2Z" fill="currentColor" opacity="0.1" />
  </svg>
);

const isIOS =
  typeof navigator !== 'undefined' &&
  (() => {
    const ua = navigator.userAgent || '';
    const iOSDevice = /iPad|iPhone|iPod/.test(ua);
    // iPadOS 13+ reports itself as Macintosh, but still has touch points.
    const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return iOSDevice || iPadOS;
  })();

const MatchCard: React.FC<MatchCardProps> = ({ match, currentPick, onPick, isActive = false, isDisabled = false }) => {
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);
  const [showFrame, setShowFrame] = useState(isActive);
  const [isLeaving, setIsLeaving] = useState(false);
  const [triggerBounce, setTriggerBounce] = useState(false);
  const prevActiveRef = useRef(isActive);

  useEffect(() => {
    setHomeImgError(false);
    setAwayImgError(false);
  }, [match.id]);

  // Handle frame animation when isActive changes
  useEffect(() => {
    if (isIOS) return; // Disable frame animation on iOS
    const wasActive = prevActiveRef.current;

    if (wasActive && !isActive) {
      // Was active, now inactive - animate out
      setIsLeaving(true);
      const timer = setTimeout(() => {
        setShowFrame(false);
        setIsLeaving(false);
      }, 400); // Match the animation duration
      return () => clearTimeout(timer);
    } else if (!wasActive && isActive) {
      // Was inactive, now active - show frame with animation
      setShowFrame(true);
      setIsLeaving(false);
    }

    prevActiveRef.current = isActive;
  }, [isActive]);

  // Handle bounce animation when isActive changes
  useEffect(() => {
    const wasActive = prevActiveRef.current;

    if (wasActive && !isActive) {
      // Was active, now inactive - reset bounce
      setTriggerBounce(false);
    } else if (!wasActive && isActive) {
      // Was inactive, now active - trigger bounce with reset to ensure restart
      setTriggerBounce(false);
      setTimeout(() => setTriggerBounce(true), 10);
    }

    prevActiveRef.current = isActive;
  }, [isActive]);

  const abbreviateTeamName = (name: string) => {
    const trimmed = name.trim().replace(/\s+/g, ' ');
    const parts = trimmed.split(' ');
    if (parts.length < 2) return trimmed;

    const [first, ...rest] = parts;
    if (first.length <= 2) return trimmed;

    const initial = Array.from(first)[0] ?? '';
    const remaining = rest.join(' ');
    return remaining ? `${initial}. ${remaining}` : trimmed;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) + " " + 
             date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Dziś";
    }
  };

  const getButtonClass = (p: Prediction) => {
    const base = "relative flex-1 aspect-[2.2/1] rounded-xl transition-all duration-300 border flex flex-col items-center justify-center overflow-hidden btn-interact";
    if (currentPick === p) {
      return `${base} border-green-400 bg-green-400/15 shadow-[inset_0_0_20px_rgba(74,222,128,0.15)] ${isDisabled ? 'opacity-75' : ''}`;
    }
    if (isDisabled) {
      return `${base} bg-white/[0.03] border-white/[0.06] opacity-40 cursor-not-allowed`;
    }
    return `${base} bg-white/[0.04] border-white/[0.08] hover:border-white/20`;
  };

  return (
    <div
      className={`electric-card-wrapper mb-3 ${isActive ? 'is-active' : 'opacity-80'}`}
      aria-current={isActive ? 'true' : undefined}
    >
      {/* iOS Border Animation (no SVG filters, no mask-composite) */}
      {isIOS && isActive && (
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none z-0">
          <div className="absolute inset-[-12px] rounded-[inherit] opacity-30 blur-2xl bg-[conic-gradient(from_0deg,rgba(34,197,94,0)_0deg,rgba(34,197,94,0)_60deg,rgba(74,222,128,0.85)_72deg,rgba(74,222,128,0.85)_84deg,rgba(34,197,94,0)_96deg,rgba(34,197,94,0)_360deg)] animate-spin [animation-duration:6.5s] [animation-direction:reverse] will-change-transform motion-reduce:animate-none" />
          <div className="absolute inset-0 rounded-[inherit] opacity-90 bg-[conic-gradient(from_0deg,rgba(34,197,94,0)_0deg,rgba(34,197,94,0)_60deg,rgba(74,222,128,0.95)_72deg,rgba(74,222,128,0.95)_84deg,rgba(34,197,94,0)_96deg,rgba(34,197,94,0)_360deg)] animate-spin [animation-duration:2.8s] will-change-transform motion-reduce:animate-none" />
          <div className="absolute inset-0 rounded-[inherit] ring-1 ring-green-400/35 shadow-[0_0_18px_rgba(74,222,128,0.18)]" />
        </div>
      )}

      {/* Electric Border Container - shows during active and leaving states, disabled on iOS */}
      {!isIOS && showFrame && (
        <div className={`electric-border-container ${isLeaving ? 'is-leaving' : ''}`}>
          <div className="electric-inner">
            <div className="electric-border-outer">
              <div className="electric-border-main"></div>
            </div>
            <div className="electric-glow-1"></div>
            <div className="electric-glow-2"></div>
          </div>
          <div className="electric-bg-glow"></div>
        </div>
      )}
      
      {/* Контент картки */}
      <div className={`glass-card rounded-[1.8rem] p-3.5 relative z-10 transition-all duration-500 ${triggerBounce ? 'ios-bounce' : ''}`}>
        {/* Header Info */}
        <div className="flex items-start gap-2.5 mb-3 px-1">
          <div className="mt-1">
            <div className="w-3.5 h-3.5 rounded-full border border-green-500/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"></div>
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[11px] text-white/40 font-bold leading-none mb-1">
              {formatDate(match.date)} • {match.round}
            </span>
            <h2 className="text-[15px] sm:text-[17px] font-black italic uppercase tracking-tight leading-tight text-white/90">
              <span className="sm:hidden">{abbreviateTeamName(match.homeTeam)}</span>
              <span className="hidden sm:inline">{match.homeTeam}</span>{' '}
              <span className="text-white/10 mx-0.5 not-italic font-normal">X</span>{' '}
              <span className="sm:hidden">{abbreviateTeamName(match.awayTeam)}</span>
              <span className="hidden sm:inline">{match.awayTeam}</span>
            </h2>
          </div>
        </div>

        {/* Prediction Buttons Row */}
        <div className="flex gap-2 justify-center px-1">
          {/* HOME PICK */}
          <button disabled={isDisabled} onClick={() => onPick(Prediction.HOME)} className={getButtonClass(Prediction.HOME)}>
            <div className={`w-11 h-11 flex items-center justify-center transition-all duration-300 ${currentPick === Prediction.HOME ? 'scale-110 opacity-100' : 'opacity-100'}`}>
              {!homeImgError && match.homeTeamId ? (
                <img src={getTeamLogoUrl(match.homeTeamId)} alt="" onError={() => setHomeImgError(true)} className="w-full h-full object-contain filter drop-shadow-md" />
              ) : <SoccerBallIcon className="w-8 h-8 opacity-50" />}
            </div>
          </button>

          {/* DRAW PICK */}
          <button disabled={isDisabled} onClick={() => onPick(Prediction.DRAW)} className={getButtonClass(Prediction.DRAW)}>
            <span className={`text-3xl font-black italic tracking-tighter transition-all duration-300 ${currentPick === Prediction.DRAW ? 'text-green-400 scale-110' : 'text-white/25'}`}>
              X
            </span>
          </button>

          {/* AWAY PICK */}
          <button disabled={isDisabled} onClick={() => onPick(Prediction.AWAY)} className={getButtonClass(Prediction.AWAY)}>
            <div className={`w-11 h-11 flex items-center justify-center transition-all duration-300 ${currentPick === Prediction.AWAY ? 'scale-110 opacity-100' : 'opacity-100'}`}>
              {!awayImgError && match.awayTeamId ? (
                <img src={getTeamLogoUrl(match.awayTeamId)} alt="" onError={() => setAwayImgError(true)} className="w-full h-full object-contain filter drop-shadow-md" />
              ) : <SoccerBallIcon className="w-8 h-8 opacity-50" />}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
