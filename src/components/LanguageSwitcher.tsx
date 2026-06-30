import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'es', flag: '🇨🇴', label: 'Español' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-1.5 py-1 border border-white/10">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          title={label}
          aria-label={label}
          className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
            lang === code
              ? 'ring-2 ring-volcanic-gold ring-offset-1 ring-offset-transparent scale-110'
              : 'opacity-50 hover:opacity-80'
          }`}
        >
          <span className="text-lg leading-none select-none" role="img" aria-hidden="true">
            {flag}
          </span>
        </button>
      ))}
    </div>
  );
}
