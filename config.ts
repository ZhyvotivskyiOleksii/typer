
export const CONFIG = {
  leagueName: "Ekstraklasa",
  minMatchesRequired: 3,
  maxMatchesToShow: 5,
  
  // Bonus configurations
  offers: {
    superbet: {
      name: "Superbet",
      description: "Odbierz bonus powitalny na start!",
      ctaText: "Odbierz bonus Superbet",
      link: "https://example.com/partner-superbet",
      logo: new URL('./images/super-bet.svg', import.meta.url).href
    },
    fortuna: {
      name: "Fortuna",
      description: "Graj bez ryzyka do 600 PLN i zyskaj 20 PLN na start!",
      ctaText: "Zarejestruj się w Fortunie",
      link: "https://online.efortuna.pl/page?key=ej0xNTc1Mzg3MyZsPTE1OTUyMDkxJnA9MTAwMTA3",
      logo: new URL('./images/fortuna.png', import.meta.url).href
    },
    fallback: {
      name: "Inne Bonusy",
      description: "Sprawdź najlepsze oferty u innych legalnych bukmacherów!",
      ctaText: "Sprawdź listę bonusów",
      link: "https://example.com/all-bonuses",
      logo: new URL('./images/logo.png', import.meta.url).href
    }
  },

  // Questions texts
  questions: {
    step1: "Czy masz konto w Superbecie? Odbierz bonus!",
    step2: "Czy masz konto w Fortunie? Odbierz bonus !"
  }
};
