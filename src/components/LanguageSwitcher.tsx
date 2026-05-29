import { useLang } from '@/context/LangContext';

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-1.5 py-1 border border-white/10">
      <button
        onClick={() => setLang('es')}
        title="Español"
        className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
          lang === 'es'
            ? 'ring-2 ring-volcanic-gold ring-offset-1 ring-offset-transparent scale-110'
            : 'opacity-50 hover:opacity-80'
        }`}
      >
        <span className="text-lg leading-none select-none" role="img" aria-label="Español">
          🇨🇴
        </span>
      </button>

      <button
        onClick={() => setLang('en')}
        title="English"
        className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
          lang === 'en'
            ? 'ring-2 ring-volcanic-gold ring-offset-1 ring-offset-transparent scale-110'
            : 'opacity-50 hover:opacity-80'
        }`}
      >
        <span className="text-lg leading-none select-none" role="img" aria-label="English">
          🇺🇸
        </span>
      </button>
    </div>
  );
}
