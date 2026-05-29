import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, TrendingUp, Users,
  Check, X, ExternalLink, Loader2, RefreshCw,
  ChevronRight, DollarSign, AlertCircle
} from 'lucide-react';
import { useAdminLotes, useAdminOfertas, usePrecioActual, patchOferta } from '@/hooks/useApi';
import { lotes as mockLotes, ofertas as mockOfertas, precioActual as mockPrecio } from '@/data/mock';

type Tab = 'dashboard' | 'lotes' | 'ofertas';

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { data: apiLotes, loading: lLoading, refetch: refetchLotes } = useAdminLotes();
  const { data: apiOfertas, loading: oLoading, refetch: refetchOfertas } = useAdminOfertas();
  const { data: apiPrecio } = usePrecioActual();
  const [procesando, setProcesando] = useState<number | null>(null);

  const lotes   = apiLotes.length   > 0 ? apiLotes   : mockLotes;
  const ofertas  = apiOfertas.length > 0 ? apiOfertas : mockOfertas;
  const precioIce = apiPrecio ? parseFloat(apiPrecio.precio_ice_usd) : mockPrecio.precio_ice;
  const trmCop    = apiPrecio ? parseFloat(apiPrecio.trm_cop)        : mockPrecio.trm;

  const stats = {
    totalLotes:    lotes.length,
    publicados:    lotes.filter((l: any) => l.estado === 'publicado').length,
    ofertados:     lotes.filter((l: any) => l.estado === 'ofertado').length,
    vendidos:      lotes.filter((l: any) => l.estado === 'vendido').length,
    ofertasPend:   ofertas.filter((o: any) => o.estado === 'pendiente').length,
  };

  const estadoColor: Record<string, string> = {
    publicado:  'bg-huila-green/10 text-huila-green border-huila-green/30',
    ofertado:   'bg-volcanic-gold/10 text-volcanic-gold border-volcanic-gold/30',
    vendido:    'bg-warm-rust/10 text-warm-rust border-warm-rust/30',
    borrador:   'bg-text-muted/10 text-text-muted border-text-muted/30',
    pendiente:  'bg-volcanic-gold/10 text-volcanic-gold border-volcanic-gold/30',
    aceptada:   'bg-huila-green/10 text-huila-green border-huila-green/30',
    rechazada:  'bg-warm-rust/10 text-warm-rust border-warm-rust/30',
  };

  const handleOferta = async (id: number, accion: 'aceptada' | 'rechazada') => {
    setProcesando(id);
    const res = await patchOferta(id, accion);
    if (res.ok) { refetchOfertas(); refetchLotes(); }
    setProcesando(null);
  };

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'lotes',     label: 'Lotes',      icon: Package,    badge: stats.totalLotes },
    { id: 'ofertas',   label: 'Ofertas',    icon: Users,      badge: stats.ofertasPend },
  ];

  return (
    <div className="min-h-screen bg-void pt-16">
      <div className="flex h-[calc(100vh-4rem)]">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-surface border-r border-gold-subtle flex flex-col">
          <div className="p-5 border-b border-gold-subtle">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Panel</p>
            <h2 className="font-display text-lg text-text-warm">Organicode Admin</h2>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  tab === t.id ? 'bg-volcanic-gold/10 text-volcanic-gold' : 'text-text-sand hover:text-text-warm hover:bg-white/5'
                }`}>
                <t.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-volcanic-gold text-void text-[10px] font-bold flex items-center justify-center">{t.badge}</span>
                )}
              </button>
            ))}
          </nav>
          {/* Precio live */}
          <div className="p-4 border-t border-gold-subtle">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Bolsa NY ICE</p>
            <p className="font-mono-data text-xl font-bold text-volcanic-gold">${precioIce.toFixed(2)}</p>
            <p className="text-xs text-text-muted">TRM: ${trmCop.toLocaleString()}</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-display text-2xl text-text-warm mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Lotes totales',   value: stats.totalLotes,  icon: Package,     color: 'text-volcanic-gold' },
                  { label: 'Publicados',      value: stats.publicados,  icon: TrendingUp,  color: 'text-huila-green' },
                  { label: 'Ofertados',       value: stats.ofertados,   icon: DollarSign,  color: 'text-volcanic-gold' },
                  { label: 'Ofertas pend.',   value: stats.ofertasPend, icon: AlertCircle, color: 'text-warm-rust' },
                ].map(stat => (
                  <div key={stat.label} className="bg-surface border border-gold-subtle rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-text-muted">{stat.label}</p>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className={`font-mono-data text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Ofertas recientes */}
              <h2 className="font-display text-lg text-text-warm mb-4">Ofertas recientes</h2>
              <div className="space-y-3">
                {ofertas.slice(0, 5).map((o: any) => (
                  <div key={o.id} className="bg-surface border border-gold-subtle rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-warm truncate">{o.empresa || 'Sin empresa'}</p>
                      <p className="text-xs text-text-muted">{o.lote_nombre || `Lote #${o.lote_id}`} · {o.pais_destino || o.pais}</p>
                    </div>
                    <span className="font-mono-data text-sm text-volcanic-gold">${parseFloat(o.precio_oferta || o.precio_ofrecido || 0).toFixed(2)}/kg</span>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${estadoColor[o.estado] || ''}`}>{o.estado}</span>
                    <button onClick={() => setTab('ofertas')} className="text-text-muted hover:text-volcanic-gold transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* LOTES */}
          {tab === 'lotes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl text-text-warm">Lotes</h1>
                <button onClick={refetchLotes} className="flex items-center gap-2 text-sm text-text-sand hover:text-volcanic-gold transition-colors">
                  <RefreshCw className={`w-4 h-4 ${lLoading ? 'animate-spin' : ''}`} />Actualizar
                </button>
              </div>
              {lLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-volcanic-gold animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  {lotes.map((lote: any) => (
                    <div key={lote.id} className="bg-surface border border-gold-subtle rounded-xl p-4 flex items-center gap-4">
                      <img src={lote.foto_url || '/images/farm-aerial.jpg'} alt={lote.nombre}
                        className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-warm">{lote.nombre}</p>
                        <p className="text-xs text-text-muted">
                          {lote.variedad} · {lote.proceso} · {lote.caficultor_municipio || lote.municipio} · {parseFloat(lote.sca_score).toFixed(2)} SCA
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono-data text-sm text-volcanic-gold">${parseFloat(lote.precio_calculado).toFixed(2)}/kg</p>
                        <p className="text-xs text-text-muted">{lote.cantidad_kg} kg</p>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${estadoColor[lote.estado] || ''}`}>
                        {lote.estado}
                      </span>
                      <Link to={`/lote/${lote.slug}`} target="_blank"
                        className="text-text-muted hover:text-volcanic-gold transition-colors shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* OFERTAS */}
          {tab === 'ofertas' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl text-text-warm">Gestión de Ofertas</h1>
                <button onClick={refetchOfertas} className="flex items-center gap-2 text-sm text-text-sand hover:text-volcanic-gold transition-colors">
                  <RefreshCw className={`w-4 h-4 ${oLoading ? 'animate-spin' : ''}`} />Actualizar
                </button>
              </div>
              {oLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-volcanic-gold animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  {ofertas.map((o: any) => (
                    <div key={o.id} className="bg-surface border border-gold-subtle rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-text-warm">{o.empresa || 'Sin empresa'}</p>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${estadoColor[o.estado] || ''}`}>{o.estado}</span>
                          </div>
                          <p className="text-xs text-text-muted mb-2">
                            {o.lote_nombre || `Lote #${o.lote_id}`} · {o.pais_destino || o.pais} · {o.incoterm} · {o.volumen_sacos} sacos
                          </p>
                          {o.mensaje && <p className="text-xs text-text-sand italic">"{o.mensaje}"</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono-data text-xl font-bold text-volcanic-gold">
                            ${parseFloat(o.precio_oferta || o.precio_ofrecido || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-text-muted">USD/kg {o.incoterm}</p>
                        </div>
                      </div>
                      {o.estado === 'pendiente' && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gold-subtle">
                          <button
                            onClick={() => handleOferta(o.id, 'rechazada')}
                            disabled={procesando === o.id}
                            className="flex items-center gap-2 px-4 py-2 border border-warm-rust/30 text-warm-rust rounded-lg text-sm hover:bg-warm-rust/10 transition-colors disabled:opacity-50">
                            {procesando === o.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            Rechazar
                          </button>
                          <button
                            onClick={() => handleOferta(o.id, 'aceptada')}
                            disabled={procesando === o.id}
                            className="flex items-center gap-2 px-4 py-2 bg-huila-green text-white rounded-lg text-sm hover:bg-huila-green/90 transition-colors disabled:opacity-50">
                            {procesando === o.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Aceptar oferta
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}
