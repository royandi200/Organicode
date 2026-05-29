import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLang } from '@/context/LangContext';

interface TickerItem {
  label: string;
  value: string;
  change: number;   // % cambio
  unit?: string;
}

// Datos base — se refrescan desde /api/precios/actual cada 60 s
const FALLBACK: TickerItem[] = [
  { label: 'ICE Arábica',    value: '2.52', change:  0.82, unit: 'USD/lb' },
  { label: 'ICE Robusta',    value: '5.18', change: -0.31, unit: 'USD/kg' },
  { label: 'Diferencial CO', value: '+0.40', change: 0.00, unit: 'USD/lb' },
  { label: 'USD/COP',        value: '4,210', change: -0.15, unit: '' },
  { label: 'Huila SCA 87+',  value: '5.80', change:  1.20, unit: 'USD/kg' },
  { label: 'Geisha',         value: '15.50', change: 2.40, unit: 'USD/kg' },
  { label: 'Pink Bourbon',   value: '10.20', change: 0.60, unit: 'USD/kg' },
  { label: 'Natural',        value: '+0.80', change: 0.00, unit: 'dif.' },
  { label: 'Anaeróbico',     value: '+1.20', change: 0.00, unit: 'dif.' },
];

function ChangeIcon({ change }: { change: number }) {
  if (change > 0)  return <TrendingUp  className="w-3 h-3 text-emerald-400" />;
  if (change < 0)  return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-text-sand/40" />;
}

function ChangeColor(change: number) {
  if (change > 0) return 'text-emerald-400';
  if (change < 0) return 'text-red-400';
  return 'text-text-sand/50';
}

export function MarketTicker() {
  const { t } = useLang();
  const [items, setItems] = useState<TickerItem[]>(FALLBACK);
  const trackRef = useRef<HTMLDivElement>(null);

  // Intentar cargar precios reales
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/precios/actual');
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data?.precio_ice_usd_lb) {
          setItems(prev => prev.map(item =>
            item.label === 'ICE Arábica'
              ? { ...item, value: Number(json.data.precio_ice_usd_lb).toFixed(2) }
              : item
          ));
        }
      } catch { /* usar fallback */ }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  // Duplicar ítems para scroll infinito
  const doubled = [...items, ...items];

  return (
    <div className="w-full bg-void/95 border-b border-volcanic-gold/20 overflow-hidden h-8 flex items-center">
      {/* Label fijo izquierda */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 border-r border-volcanic-gold/30 h-full bg-volcanic-gold/10">
        <span className="text-volcanic-gold text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">
          {t('ticker.label')}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Track scrollable */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={trackRef}
          className="flex items-center gap-0 animate-ticker"
          style={{ width: 'max-content' }}
        >
          {doubled.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-4 border-r border-white/5 whitespace-nowrap"
            >
              <span className="text-text-sand/60 text-[11px] uppercase tracking-wide">
                {item.label}
              </span>
              <span className="text-text-warm text-[12px] font-semibold font-mono">
                {item.value}
              </span>
              {item.unit && (
                <span className="text-text-sand/40 text-[10px]">{item.unit}</span>
              )}
              <ChangeIcon change={item.change} />
              {item.change !== 0 && (
                <span className={`text-[10px] font-mono ${ChangeColor(item.change)}`}>
                  {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
