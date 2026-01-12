
import { Match } from '../types';

export const LEAGUES = [
  { id: "899985", label: "Ekstraklasa" },
  { id: "901074", label: "La Liga" },
  { id: "900326", label: "Premier League" },
  { id: "899867", label: "Bundesliga" },
] as const;

const generateRandomOdds = () => ({
  home: (Math.random() * (3.5 - 1.2) + 1.2).toFixed(2),
  draw: (Math.random() * (4.5 - 2.8) + 2.8).toFixed(2),
  away: (Math.random() * (5.5 - 1.5) + 1.5).toFixed(2),
});

const getFallbackMatches = (): Match[] => {
  const now = Date.now();
  
  const ekData = [
    { h: "Lech Poznań", hId: "8023", a: "Legia Warszawa", aId: "8021" },
    { h: "Raków Częstochowa", hId: "8025", a: "Pogoń Szczecin", aId: "8024" },
    { h: "Jagiellonia", hId: "8026", a: "Śląsk Wrocław", aId: "8027" }
  ];

  const llData = [
    { h: "Real Madryt", hId: "8633", a: "FC Barcelona", aId: "8634" },
    { h: "Atletico Madryt", hId: "9906", a: "Villarreal", aId: "10205" }
  ];

  const matches: Match[] = [];

  ekData.forEach((m, i) => {
    matches.push({
      id: `fb-ek-${i}`,
      homeTeam: m.h,
      homeTeamId: m.hId,
      awayTeam: m.a,
      awayTeamId: m.aId,
      date: new Date(now + (i + 1) * 3600000 * 5).toISOString(),
      round: "Ekstraklasa",
      odds: generateRandomOdds()
    });
  });

  llData.forEach((m, i) => {
    matches.push({
      id: `fb-ll-${i}`,
      homeTeam: m.h,
      homeTeamId: m.hId,
      awayTeam: m.a,
      awayTeamId: m.aId,
      date: new Date(now + (i + 4) * 3600000 * 5).toISOString(),
      round: "La Liga",
      odds: generateRandomOdds()
    });
  });

  return matches;
};

export const fetchAllLeaguesMatches = async (): Promise<Match[]> => {
  const now = Date.now();

  try {
    const extractRawFixtures = (responseData: any): any[] => {
      if (!responseData) return [];
      if (Array.isArray(responseData)) return responseData;
      if (Array.isArray(responseData.data)) return responseData.data;
      if (Array.isArray(responseData.fixtures)) return responseData.fixtures;
      if (Array.isArray(responseData.matches)) return responseData.matches;
      if (Array.isArray(responseData.rounds)) {
        return responseData.rounds.flatMap((roundItem: any) => {
          const matches = Array.isArray(roundItem?.matches) ? roundItem.matches : [];
          const roundLabel = roundItem?.round ?? roundItem?.name ?? roundItem?.id;
          return matches.map((m: any) => ({ ...m, _round: roundLabel }));
        });
      }
      return [];
    };

    const toTimestamp = (dateString: string) => {
      const time = new Date(dateString).getTime();
      return Number.isFinite(time) ? time : null;
    };

    const fetchLeagueMatches = async (leagueId: string, leagueLabel: string): Promise<Match[]> => {
      const API_URL = `https://gateway.score-buster.dev.royal-gambit.io/api/score/events/${leagueId}/fixtures`;

      try {
        const response = await fetch(API_URL);
        if (!response.ok) return [];
        const responseData = await response.json();
        const rawList = extractRawFixtures(responseData);

        return rawList.map((item: any) => {
          const hId = (item.homeTeam?.id || item.home_team?.id || item.homeTeamId || item.home_team_id || "").toString();
          const aId = (item.awayTeam?.id || item.away_team?.id || item.awayTeamId || item.away_team_id || "").toString();
          return {
            id: (item.id || item.event_id || Math.random()).toString(),
            homeTeam: item.homeTeam?.name || item.home_team?.name || "Gospodarze",
            homeTeamId: hId,
            awayTeam: item.awayTeam?.name || item.away_team?.name || "Goście",
            awayTeamId: aId,
            date: item.startTime || item.start_time || item.date || item.utc_date || item.utcDate,
            round: leagueLabel,
            odds: generateRandomOdds()
          };
        });
      } catch {
        return [];
      }
    };

    const results = await Promise.all(LEAGUES.map((league) => fetchLeagueMatches(league.id, league.label)));
    const allMatches = results.flat();

    const combined = allMatches
      .map((m) => ({ m, ts: m.date ? toTimestamp(m.date) : null }))
      .filter((x) => x.ts !== null && (x.ts as number) > now)
      .sort((a, b) => (a.ts as number) - (b.ts as number))
      .slice(0, 5)
      .map((x) => x.m);

    return combined.length === 5 ? combined : getFallbackMatches();
  } catch (error) {
    return getFallbackMatches();
  }
};

export const getTeamLogoUrl = (teamId: string) => {
  if (!teamId || teamId === "undefined" || teamId === "") return "";
  return `https://gateway.score-buster.dev.royal-gambit.io/api/images/teams/${teamId}/logo?size=small`;
};
