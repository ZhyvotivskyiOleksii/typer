
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppView, Match, UserPicks, Prediction, BonusOffer } from './types';
import { CONFIG } from './config';
import { fetchAllLeaguesMatches } from './services/api';
import Header from './components/Header';
import MatchCard from './components/MatchCard';
import QuestionStep from './components/QuestionStep';
import CtaBlock from './components/CtaBlock';
import StickySummary from './components/StickySummary';

const isIOS =
  typeof navigator !== 'undefined' &&
  (() => {
    const ua = navigator.userAgent || '';
    const iOSDevice = /iPad|iPhone|iPod/.test(ua);
    const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return iOSDevice || iPadOS;
  })();

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('loading');
  const [typerStep, setTyperStep] = useState<1 | 2>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [picks, setPicks] = useState<UserPicks>({});
  const [selectedBonus, setSelectedBonus] = useState<BonusOffer | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollAnimRef = useRef<number | null>(null);

  const smoothScrollTo = useCallback((targetY: number, durationMs = 520) => {
    if (typeof window === 'undefined') return;
    if (scrollAnimRef.current !== null) cancelAnimationFrame(scrollAnimRef.current);

    const startY = window.scrollY;
    const delta = targetY - startY;
    if (Math.abs(delta) < 2) return;

    const startTime = performance.now();
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + delta * eased);

      if (progress < 1) scrollAnimRef.current = requestAnimationFrame(step);
      else scrollAnimRef.current = null;
    };

    scrollAnimRef.current = requestAnimationFrame(step);
  }, []);

  const loadData = async () => {
    setView('loading');
    try {
      const data = await fetchAllLeaguesMatches();
      setMatches(data);
      setView('typer');
      setTyperStep(1);
      setPicks({});
    } catch (err) {
      setView('typer');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isIOS) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const filterEl = document.getElementById('electric-displace') as SVGFilterElement | null;
    if (!filterEl) return;

    const offsetNoise1 = filterEl.querySelector('feOffset[result="offsetNoise1"]') as SVGFEOffsetElement | null;
    const offsetNoise2 = filterEl.querySelector('feOffset[result="offsetNoise2"]') as SVGFEOffsetElement | null;
    const offsetNoise3 = filterEl.querySelector('feOffset[result="offsetNoise3"]') as SVGFEOffsetElement | null;
    const offsetNoise4 = filterEl.querySelector('feOffset[result="offsetNoise4"]') as SVGFEOffsetElement | null;
    if (!offsetNoise1 || !offsetNoise2 || !offsetNoise3 || !offsetNoise4) return;

    const maxDy = 700;
    const maxDx = 490;
    const loopMs = 6000;

    let rafId = 0;
    let lastUpdate = 0;
    let cancelled = false;

    const startJsFallback = () => {
      const tick = (now: number) => {
        // ~30fps to reduce mobile GPU/CPU load.
        if (now - lastUpdate >= 32) {
          lastUpdate = now;

          const phase = (now % loopMs) / loopMs; // 0..1
          offsetNoise1.setAttribute('dy', String(maxDy * (1 - phase)));
          offsetNoise2.setAttribute('dy', String(-maxDy * phase));
          offsetNoise3.setAttribute('dx', String(maxDx * (1 - phase)));
          offsetNoise4.setAttribute('dx', String(-maxDx * phase));
        }

        rafId = window.requestAnimationFrame(tick);
      };

      rafId = window.requestAnimationFrame(tick);
    };

    // If SMIL animations work (Android/desktop Chrome), keep native <animate>.
    // On iOS Safari, SMIL often doesn't run, so we fall back to JS.
    const hasSmil = filterEl.querySelector('animate') !== null;
    const dyStart = offsetNoise1.dy?.animVal ?? 0;
    const dxStart = offsetNoise3.dx?.animVal ?? 0;

    const probeTimer = window.setTimeout(() => {
      if (cancelled) return;
      const dyNow = offsetNoise1.dy?.animVal ?? 0;
      const dxNow = offsetNoise3.dx?.animVal ?? 0;
      const smilRunning = hasSmil && (Math.abs(dyNow - dyStart) > 1 || Math.abs(dxNow - dxStart) > 1);
      if (!smilRunning) startJsFallback();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(probeTimer);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const currentVisibleMatches = typerStep === 1 ? matches.slice(0, 3) : matches.slice(3, 5);
  const activeMatchId =
    view === 'typer'
      ? currentVisibleMatches.find((m) => (picks[m.id] || Prediction.NONE) === Prediction.NONE)?.id ?? null
      : null;

  useEffect(() => {
    if (view !== 'typer') return;
    if (!activeMatchId) return;

    requestAnimationFrame(() => {
      const el = matchRefs.current[activeMatchId];
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const stickyOffset = 96;
      const viewport = Math.max(0, window.innerHeight - stickyOffset);
      const targetY = rect.top + window.scrollY - viewport / 2 + rect.height / 2;
      smoothScrollTo(Math.max(0, targetY), 520);
    });
  }, [activeMatchId, smoothScrollTo, view]);

  const handlePick = useCallback((matchId: string, prediction: Prediction) => {
    setPicks(prev => {
      if (view !== 'typer') return prev;

      const visibleMatches = typerStep === 1 ? matches.slice(0, 3) : matches.slice(3, 5);
      const activeId = visibleMatches.find((m) => (prev[m.id] || Prediction.NONE) === Prediction.NONE)?.id;

      if (!activeId || matchId !== activeId) return prev;
      if ((prev[matchId] || Prediction.NONE) !== Prediction.NONE) return prev;

      const nextPick = prediction;
      const newPicks = {
        ...prev,
        [matchId]: nextPick
      };
      
      const allPicksCount = Object.values(newPicks).filter(p => p !== Prediction.NONE).length;
      const step1Matches = matches.slice(0, 3);
      const step1PicksCount = step1Matches.filter(m => newPicks[m.id] && newPicks[m.id] !== Prediction.NONE).length;
      
      const willAdvanceToStep2 = typerStep === 1 && step1PicksCount === 3 && !isTransitioning;
      const willAdvanceToQuestion1 = typerStep === 2 && allPicksCount === 5 && !isTransitioning;

      // Auto-transition to Step 2
      if (willAdvanceToStep2) {
        setIsTransitioning(true);
        setTimeout(() => {
          setTyperStep(2);
          setIsTransitioning(false);
        }, 400);
      }
      
      // Auto-transition to Question 1 after finishing all 5 picks
      if (willAdvanceToQuestion1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setView('step1');
          setIsTransitioning(false);
          smoothScrollTo(0, 650);
        }, 600);
      }
      
      return newPicks;
    });
  }, [matches, typerStep, isTransitioning, smoothScrollTo, view]);

  const handleQuestionAnswer = (step: number, answer: boolean) => {
    if (step === 1) {
      if (!answer) {
        setSelectedBonus(CONFIG.offers.superbet);
        setView('final');
      } else {
        setView('step2');
      }
    } else if (step === 2) {
      if (!answer) {
        setSelectedBonus(CONFIG.offers.fortuna);
        setView('final');
      } else {
        setSelectedBonus(CONFIG.offers.fallback);
        setView('final');
      }
    }
  };

  const activePicksCount = Object.values(picks).filter(p => p !== Prediction.NONE).length;
  const isSubmitDisabled = activePicksCount < matches.length;

  if (view === 'loading') {
    return (
      <div className="min-h-screen min-h-[100svh] flex flex-col items-center justify-center bg-[#050507]">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-green-500 font-black uppercase tracking-[0.2em] text-[10px]">Wczytywanie...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen min-h-[100svh] flex flex-col w-full ${view === 'typer' ? 'pb-20' : 'pb-8'}`}>
      {/* Header outside the width-restricted container */}
      <Header />

      {/* Main content container with max-width */}
      <div className="w-full max-w-xl mx-auto px-3 flex-1">
        <div className="view-transition-in flex-1 mt-1">
          {view === 'typer' && (
            <main>
              <div className="flex flex-col mb-4 text-center">
                <span className="text-[11px] text-green-500 font-black uppercase tracking-[0.25em]">
                  {typerStep === 1 ? 'KROK 1: TYPUJ 3 MECZE' : 'KROK 2: DOKOŃCZ KUPON'}
                </span>
                <div className="flex justify-center gap-1.5 mt-2">
                  <div className={`h-1.5 w-12 rounded-full ${typerStep >= 1 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`}></div>
                  <div className={`h-1.5 w-12 rounded-full ${typerStep >= 2 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`}></div>
                </div>
              </div>
              
              <div ref={containerRef} className={`space-y-0.5 transition-all ${isTransitioning ? 'slide-out' : 'slide-in'}`}>
                {currentVisibleMatches.map((match, index) => (
                  <div
                    key={match.id}
                    ref={(el) => {
                      matchRefs.current[match.id] = el;
                    }}
                    className="match-card-animate"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <MatchCard
                      match={match}
                      currentPick={picks[match.id] || Prediction.NONE}
                      onPick={(p) => handlePick(match.id, p)}
                      isActive={match.id === activeMatchId}
                      isDisabled={match.id !== activeMatchId}
                    />
                  </div>
                ))}
              </div>

              {matches.length > 0 && (
                <StickySummary count={activePicksCount} max={matches.length} disabled={isSubmitDisabled} onSubmit={() => setView('step1')} />
              )}
            </main>
          )}

          {view === 'step1' && (
            <div className="mt-4 pb-10">
              <QuestionStep
                stepNumber={1}
                question={CONFIG.questions.step1}
                logoSrc={CONFIG.offers.superbet.logo}
                logoAlt={CONFIG.offers.superbet.name}
                onAnswer={(ans) => handleQuestionAnswer(1, ans)}
              />
            </div>
          )}
          {view === 'step2' && (
            <div className="mt-4 pb-10">
              <QuestionStep
                stepNumber={2}
                question={CONFIG.questions.step2}
                logoSrc={CONFIG.offers.fortuna.logo}
                logoAlt={CONFIG.offers.fortuna.name}
                onAnswer={(ans) => handleQuestionAnswer(2, ans)}
              />
            </div>
          )}
          {view === 'final' && selectedBonus && <div className="mt-4 pb-10"><CtaBlock offer={selectedBonus} onCtaClick={() => {}} /></div>}
        </div>
      </div>

      <footer className="mt-auto py-6 sm:py-8 text-center opacity-30 text-[10px] sm:text-[12px] uppercase font-black tracking-[0.2em] w-full">
        <p>Graj odpowiedzialnie | 18+ | 2026</p>
      </footer>
    </div>
  );
};

export default App;
