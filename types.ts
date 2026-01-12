
export enum Prediction {
  HOME = '1',
  DRAW = 'X',
  AWAY = '2',
  NONE = ''
}

export interface Match {
  id: string;
  homeTeam: string;
  homeTeamId: string;
  awayTeam: string;
  awayTeamId: string;
  date: string;
  venue?: string;
  round?: string;
  odds?: {
    home: string;
    draw: string;
    away: string;
  };
}

export interface UserPicks {
  [matchId: string]: Prediction;
}

export type AppView = 'loading' | 'typer' | 'step1' | 'step2' | 'final';

export interface BonusOffer {
  name: string;
  description: string;
  ctaText: string;
  link: string;
  logo: string;
}
