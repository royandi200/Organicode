import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Lang = 'es' | 'en';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  es: {
    'nav.home':      'Inicio',
    'nav.catalog':   'Catálogo',
    'nav.admin':     'Admin',
    'ticker.label':  'MERCADO CAFÉ',
    'lote.origin':   'Origen',
    'lote.variety':  'Variedad',
    'lote.process':  'Proceso',
    'lote.altitude': 'Altitud',
    'lote.score':    'Puntuación SCA',
    'lote.weight':   'Disponible',
    'lote.offer':    'Hacer Oferta',
    'lote.sample':   'Solicitar Muestra',
    'cat.title':     'Catálogo de Lotes',
    'cat.filter':    'Filtrar',
    'cat.search':    'Buscar lotes...',
    'home.hero':     'Café de especialidad directo del origen',
    'home.sub':      'Conectamos fincas colombianas con compradores del mundo.',
    'home.cta':      'Explorar Catálogo',
  },
  en: {
    'nav.home':      'Home',
    'nav.catalog':   'Catalog',
    'nav.admin':     'Admin',
    'ticker.label':  'COFFEE MARKET',
    'lote.origin':   'Origin',
    'lote.variety':  'Variety',
    'lote.process':  'Process',
    'lote.altitude': 'Altitude',
    'lote.score':    'SCA Score',
    'lote.weight':   'Available',
    'lote.offer':    'Make Offer',
    'lote.sample':   'Request Sample',
    'cat.title':     'Lot Catalog',
    'cat.filter':    'Filter',
    'cat.search':    'Search lots...',
    'home.hero':     'Specialty coffee direct from origin',
    'home.sub':      'Connecting Colombian farms with buyers worldwide.',
    'home.cta':      'Explore Catalog',
  },
};

const LangContext = createContext<LangContextType>({
  lang: 'es',
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const stored = (typeof window !== 'undefined'
    ? (localStorage.getItem('organicode_lang') || 'es')
    : 'es') as Lang;
  const [lang, setLangState] = useState<Lang>(stored);

  const setLang = (l: Lang) => {
    localStorage.setItem('organicode_lang', l);
    setLangState(l);
  };

  const t = (key: string) => translations[lang][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
