import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAppStore } from '@/store';

interface PrecioLiveProps {
  compact?: boolean;
}

export function PrecioLive({ compact = false }: PrecioLiveProps) {
  const { precioActual } = useAppStore();
  const [flash, setFlash] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Flash animation when price changes
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(timer);
  }, [precioActual.precio_ice]);

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(precioActual.updated_at).getTime()) / 60000));
    }, 30000);
    return () => clearInterval(interval);
  }, [precioActual.updated_at]);

  const TrendIcon = precioActual.trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = precioActual.trend === 'up' ? 'text-huila-green' : 'text-warm-rust';

  if (compact) {
    return (
      <div className={`glass-pill px-3 py-1.5 flex items-center gap-2 ${flash ? 'animate-price-flash' : ''}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-huila-green animate-dot-pulse" />
        <span className="font-mono-data text-xs text-text-warm">
          ${precioActual.precio_ice.toFixed(2)}
        </span>
        <TrendIcon className={`w-3 h-3 ${trendColor}`} />
      </div>
    );
  }

  return (
    <div className={`glass-pill px-4 py-2 flex items-center gap-3 ${flash ? 'animate-price-flash' : ''}`}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-huila-green opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-huila-green" />
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">ICE Live</span>
        <span className="font-mono-data text-sm font-medium text-text-warm">
          ${precioActual.precio_ice.toFixed(2)} USD/lb
        </span>
        <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
      </div>
      {elapsed > 0 && (
        <span className="text-[10px] text-text-muted">hace {elapsed}m</span>
      )}
    </div>
  );
}
