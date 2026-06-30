import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Users, FileText,
  Check, X, ExternalLink, Loader2, RefreshCw,
  ChevronRight, DollarSign, AlertCircle,
  TrendingUp, Truck, Globe, Star, FlaskConical
} from 'lucide-react';
import {
  useAdminLotes, useAdminOfertas, useAdminCompradores, useAdminMuestras,
  usePrecioActual, patchOferta, patchMuestra
} from '@/hooks/useApi';
import { lotes as mockLotes, ofertas as mockOfertas } from '@/data/mock';

type Tab = 'dashboard' | 'lotes' | 'ofertas' | 'compradores' | 'muestras';

const ESTADO_COLOR: Record<string, string> = {
  publicado:   'bg-huila-green/10 text-huila-green border-huila-green/30',
  ofertado:    'bg-volcanic-gold/10 text-volcanic-gold border-volcanic-gold/30',
  vendido:     'bg-warm-rust/10 text-warm-rust border-warm-rust/30',
  borrador:    'bg-text-muted/10 text-text-muted border-text-muted/30',
  pendiente:   'bg-volcanic-gold/10 text-volcanic-gold border-volcanic-gold/30',
  aceptada:    'bg-huila-green/10 text-huila-green border-huila-green/30',
  rechazada:   'bg-warm-rust/10 text-warm-rust border-warm-rust/30',
  negociando:  'bg-blue-400/10 text-blue-400 border-blue-400/30',
  enviada:     'bg-huila-green/10 text-huila-green border-huila-green/30',
  preparando:  'bg-volcanic-gold/10 text-volcanic-gold border-volcanic-gold/30',
  entregada:   'bg-text-muted/10 text-text-muted border-text-muted/30',
};

const LEAD_COLOR: Record<string, string> = {
  HOT:  'bg-warm-rust/15 text-warm-rust  border-warm-rust/30',
  WARM: 'bg-volcanic-gold/15 text-volcanic-gold border-volcanic-gold/30',
  COLD: 'bg-text-muted/15 text-text-muted border-text-muted/30',
};

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [procesando, setProcesando] = useState<number | null>(null);

  const { data: apiLotes,       loading: lLoading,  refetch: refetchLotes }       = useAdminLotes();
  const { data: apiOfertas,     loading: oLoading,  refetch: refetchOfertas, kpis: ofertaKpis } = useAdminOfertas();
  const { data: apiCompradores, loading: cLoading,  refetch: refetchCompradores } = useAdminCompradores();
  const { data: apiMuestras,    loading: mLoading,  refetch: refetchMuestras }    = useAdminMuestras();
  const { data: apiPrecio } = usePrecioActual();

  const lotes      = apiLotes.length      > 0 ? apiLotes      : mockLotes;
  const ofertas    = apiOfertas.length    > 0 ? apiOfertas    : mockOfertas;
  const compradores = apiCompradores;
  const muestras   = apiMuestras;

  const precioIce = apiPrecio ? parseFloat(apiPrecio.precio_ice_usd) : 2.89;
  const trmCop    = apiPrecio ? parseFloat(apiPrecio.trm_cop)        : 4180;

  const stats = {
    totalLotes:     lotes.length,
    publicados:     lotes.filter((l: any) => l.estado === 'publicado').length,
    ofertasPend:    ofertas.filter((o: any) => o.estado === 'pendiente').length,
    hotsLeads:      compradores.filter((c: any) => c.lead_score === 'HOT').length,
    muestrasPend:   muestras.filter((m: any) => m.estado === 'pendiente' || m.estado === 'preparando').length,
    valorNegoc:     ofertaKpis?.valor_total_usd ?? '—',
  };

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'lotes',       label: 'Lotes',        icon: Package,      badge: stats.totalLotes },
    { id: 'ofertas',     label: 'Ofertas',      icon: DollarSign,   badge: stats.ofertasPend },
    { id: 'compradores', label: 'Compradores',  icon: Users,        badge: stats.hotsLeads },
    { id: 'muestras',    label: 'Muestras',     icon: FlaskConical, badge: stats.muestrasPend },
  ];

  const handleOferta = async (id: number, accion: 'aceptada' | 'rechazada') => {
    setProcesando(id);
    const res = await patchOferta(id, accion);
    if (res.ok) { refetchOfertas(); refetchLotes(); }
    setProcesando(null);
  };

  const handleMuestra = async (id: number, estado: 'preparando' | 'enviada' | 'entregada') => {
    setProcesando(id);
    await patchMuestra(id, estado);
    refetchMuestras();
    setProcesando(null);
  };

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
                  tab === t.id
                    ? 'bg-volcanic-gold/10 text-volcanic-gold'
                    : 'text-text-sand hover:text-text-warm hover:bg-white/5'
                }`}>
                <t.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-volcanic-gold text-void text-[10px] font-bold flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          {/* Precio live */}
          <div className="p-4 border-t border-gold-subtle">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Bolsa NY ICE</p>
            <p className="font-mono-data text-xl font-bold text-volcanic-gold">${precioIce.toFixed(2)}</p>
            <p className="text-xs text-text-muted">TRM: ${trmCop.toLocaleString()}</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ── */}
            {tab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className="font-display text-2xl text-text-warm mb-6">Dashboard</h1>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Lotes publicados',  value: stats.publicados,   icon: Package,      color: 'text-huila-green' },
                    { label: 'Ofertas pendientes',value: stats.ofertasPend,  icon: AlertCircle,  color: 'text-warm-rust' },
                    { label: 'Leads HOT',         value: stats.hotsLeads,    icon: TrendingUp,   color: 'text-volcanic-gold' },
                    { label: 'Muestras activas',  value: stats.muestrasPend, icon: FlaskConical, color: 'text-blue-400' },
                    { label: 'Total compradores', value: compradores.length, icon: Globe,        color: 'text-text-sand' },
                    { label: 'Valor en mesa USD', value: `$${typeof stats.valorNegoc === 'string' ? stats.valorNegoc : parseFloat(stats.valorNegoc).toLocaleString()}`, icon: DollarSign, color: 'text-volcanic-gold' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface border border-gold-subtle rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-text-muted">{stat.label}</p>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <p className={`font-mono-data text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <h2 className="font-display text-lg text-text-warm mb-4">Ofertas recientes</h2>
                <div className="space-y-3">
                  {ofertas.slice(0, 5).map((o: any) => (
                    <div key={o.id} className="bg-surface border border-gold-subtle rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-warm truncate">{o.empresa || 'Sin empresa'}</p>
                        <p className="text-xs text-text-muted">{o.lote_nombre || `Lote #${o.lote_id}`} · {o.pais_destino || o.pais}</p>
                      </div>
                      <span className="font-mono-data text-sm text-volcanic-gold">${parseFloat(o.precio_oferta || o.precio_ofrecido || 0).toFixed(2)}/kg</span>
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${ESTADO_COLOR[o.estado] || ''}`}>{o.estado}</span>
                      <button onClick={() => setTab('ofertas')} className="text-text-muted hover:text-volcanic-gold transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {ofertas.length === 0 && (
                    <div className="text-center py-12 text-text-muted">
                      <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Sin ofertas aún</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── LOTES ── */}
            {tab === 'lotes' && (
              <motion.div key="lotes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl text-text-warm">Lotes ({lotes.length})</h1>
                  <button onClick={refetchLotes} className="flex items-center gap-2 text-sm text-text-sand hover:text-volcanic-gold transition-colors">
                    <RefreshCw className={`w-4 h-4 ${lLoading ? 'animate-spin' : ''}`} /> Actualizar
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
                            {lote.variedad} · {lote.proceso} · {lote.caficultor_municipio || lote.municipio}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono-data text-sm text-volcanic-gold">${parseFloat(lote.precio_calculado || 0).toFixed(2)}/kg</p>
                          <p className="text-xs text-text-muted">{lote.cantidad_kg} kg · {parseFloat(lote.sca_score).toFixed(1)} SCA</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${ESTADO_COLOR[lote.estado] || ''}`}>
                            {lote.estado}
                          </span>
                          {lote.total_ofertas > 0 && (
                            <span className="text-[10px] text-text-muted">{lote.total_ofertas} oferta{lote.total_ofertas > 1 ? 's' : ''}</span>
                          )}
                        </div>
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

            {/* ── OFERTAS ── */}
            {tab === 'ofertas' && (
              <motion.div key="ofertas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="font-display text-2xl text-text-warm">Ofertas</h1>
                  <button onClick={refetchOfertas} className="flex items-center gap-2 text-sm text-text-sand hover:text-volcanic-gold transition-colors">
                    <RefreshCw className={`w-4 h-4 ${oLoading ? 'animate-spin' : ''}`} /> Actualizar
                  </button>
                </div>
                {/* KPIs oferta */}
                {ofertaKpis && (
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Total',     value: ofertaKpis.total,      color: 'text-text-sand' },
                      { label: 'Pendientes',value: ofertaKpis.pendientes,  color: 'text-volcanic-gold' },
                      { label: 'Aceptadas', value: ofertaKpis.aceptadas,   color: 'text-huila-green' },
                      { label: 'Rechazadas',value: ofertaKpis.rechazadas,  color: 'text-warm-rust' },
                    ].map(k => (
                      <div key={k.label} className="bg-surface border border-gold-subtle rounded-xl p-4 text-center">
                        <p className={`font-mono-data text-2xl font-bold ${k.color}`}>{k.value}</p>
                        <p className="text-[10px] text-text-muted mt-1">{k.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                {oLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-volcanic-gold animate-spin" /></div>
                ) : (
                  <div className="space-y-3">
                    {ofertas.length === 0 && (
                      <div className="text-center py-12 text-text-muted">
                        <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Sin ofertas registradas</p>
                      </div>
                    )}
                    {ofertas.map((o: any) => (
                      <div key={o.id} className="bg-surface border border-gold-subtle rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-text-warm">{o.empresa || 'Sin empresa'}</p>
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${ESTADO_COLOR[o.estado] || ''}`}>
                                {o.estado}
                              </span>
                            </div>
                            <p className="text-xs text-text-muted mb-1">
                              <span className="text-volcanic-gold">{o.lote_nombre || `Lote #${o.lote_id}`}</span>
                              {' · '}{o.lote_variedad} {o.lote_proceso ? `· ${o.lote_proceso}` : ''}
                              {' · '}{o.pais_destino || o.pais} · {o.incoterm} · {o.volumen_sacos} sacos
                            </p>
                            {o.caficultor_municipio && <p className="text-xs text-text-muted">Finca: {o.caficultor_finca} — {o.caficultor_municipio}</p>}
                            {o.mensaje && <p className="text-xs text-text-sand italic mt-1">"{o.mensaje}"</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono-data text-xl font-bold text-volcanic-gold">
                              ${parseFloat(o.precio_oferta || o.precio_ofrecido || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-text-muted">USD/kg {o.incoterm}</p>
                            {o.lote_precio_fob && (
                              <p className="text-[10px] text-text-muted">FOB ref: ${parseFloat(o.lote_precio_fob).toFixed(2)}</p>
                            )}
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

            {/* ── COMPRADORES ── */}
            {tab === 'compradores' && (
              <motion.div key="compradores" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl text-text-warm">Compradores ({compradores.length})</h1>
                  <button onClick={refetchCompradores} className="flex items-center gap-2 text-sm text-text-sand hover:text-volcanic-gold transition-colors">
                    <RefreshCw className={`w-4 h-4 ${cLoading ? 'animate-spin' : ''}`} /> Actualizar
                  </button>
                </div>
                {cLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-volcanic-gold animate-spin" /></div>
                ) : compradores.length === 0 ? (
                  <div className="text-center py-12 text-text-muted">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Sin compradores registrados aún</p>
                    <p className="text-xs mt-1">Los leads B2B aparecen aquí tras completar el formulario</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {compradores.map((c: any) => (
                      <div key={c.id} className="bg-surface border border-gold-subtle rounded-xl p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-volcanic-gold/10 flex items-center justify-center shrink-0">
                          <span className="text-volcanic-gold font-bold text-sm">{(c.empresa || c.nombre || '?')[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-text-warm">{c.empresa || c.nombre}</p>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${LEAD_COLOR[c.lead_score] || LEAD_COLOR.COLD}`}>
                              {c.lead_score || 'COLD'}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted">
                            {c.nombre} · {c.pais || '—'} · {c.segmento || 'Sin segmento'}
                          </p>
                          {c.perfil_sensorial && (
                            <p className="text-xs text-text-muted mt-1">Perfil: {c.perfil_sensorial}</p>
                          )}
                          {c.notas_internas && (
                            <p className="text-xs text-text-sand italic mt-1">{c.notas_internas}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          {c.total_ofertas > 0 && (
                            <p className="text-xs text-volcanic-gold">{c.total_ofertas} oferta{c.total_ofertas > 1 ? 's' : ''}</p>
                          )}
                          {c.total_muestras > 0 && (
                            <p className="text-xs text-text-muted">{c.total_muestras} muestra{c.total_muestras > 1 ? 's' : ''}</p>
                          )}
                          {c.volumen_anual_kg && (
                            <p className="text-xs text-text-muted">{c.volumen_anual_kg.toLocaleString()} kg/año</p>
                          )}
                          {c.telefono_wa && (
                            <a href={`https://wa.me/${c.telefono_wa.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-huila-green hover:underline block">Abrir WhatsApp</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── MUESTRAS ── */}
            {tab === 'muestras' && (
              <motion.div key="muestras" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl text-text-warm">Muestras ({muestras.length})</h1>
                  <button onClick={refetchMuestras} className="flex items-center gap-2 text-sm text-text-sand hover:text-volcanic-gold transition-colors">
                    <RefreshCw className={`w-4 h-4 ${mLoading ? 'animate-spin' : ''}`} /> Actualizar
                  </button>
                </div>
                {mLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-volcanic-gold animate-spin" /></div>
                ) : muestras.length === 0 ? (
                  <div className="text-center py-12 text-text-muted">
                    <FlaskConical className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Sin solicitudes de muestra aún</p>
                    <p className="text-xs mt-1">Las solicitudes desde el catálogo aparecen aquí</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {muestras.map((m: any) => (
                      <div key={m.id} className="bg-surface border border-gold-subtle rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-text-warm">{m.empresa || m.telefono_solicitante}</p>
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${ESTADO_COLOR[m.estado] || ''}`}>
                                {m.estado}
                              </span>
                            </div>
                            <p className="text-xs text-text-muted mb-1">
                              <span className="text-volcanic-gold">{m.lote_nombre}</span>
                              {' · '}{m.variedad} {m.proceso ? `· ${m.proceso}` : ''}
                              {' · '}{m.gramos_solicitados}g · {m.pais_destino || '—'}
                            </p>
                            {m.numero_guia && (
                              <p className="text-xs text-text-sand">📦 Guía {m.courier}: <span className="font-mono">{m.numero_guia}</span></p>
                            )}
                            {m.direccion_entrega && (
                              <p className="text-xs text-text-muted mt-1">📍 {m.direccion_entrega}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {m.costo_envio_usd && <p className="text-sm font-mono-data text-volcanic-gold">${m.costo_envio_usd}</p>}
                            <p className="text-[10px] text-text-muted">{new Date(m.created_at).toLocaleDateString('es-CO')}</p>
                          </div>
                        </div>
                        {/* Acciones de logística */}
                        {(m.estado === 'pendiente' || m.estado === 'preparando') && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-gold-subtle flex-wrap">
                            {m.estado === 'pendiente' && (
                              <button
                                onClick={() => handleMuestra(m.id, 'preparando')}
                                disabled={procesando === m.id}
                                className="flex items-center gap-2 px-3 py-2 border border-volcanic-gold/30 text-volcanic-gold rounded-lg text-xs hover:bg-volcanic-gold/10 transition-colors disabled:opacity-50">
                                {procesando === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className="w-3 h-3" />}
                                Preparando muestra
                              </button>
                            )}
                            {m.estado === 'preparando' && (
                              <button
                                onClick={() => handleMuestra(m.id, 'enviada')}
                                disabled={procesando === m.id}
                                className="flex items-center gap-2 px-3 py-2 bg-huila-green text-white rounded-lg text-xs hover:bg-huila-green/90 transition-colors disabled:opacity-50">
                                {procesando === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                                Marcar como enviada
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
