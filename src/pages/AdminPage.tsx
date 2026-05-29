import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, DollarSign, TrendingUp,
  Bell, Search, Edit, Copy, Eye, Archive,
  Download, CheckCircle, XCircle,
  Send, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { lotes, ofertas, precioActual } from '@/data/mock';
import { useAppStore } from '@/store';

type Tab = 'dashboard' | 'lotes' | 'ofertas' | 'precios';

/* ── Sidebar Item ── */
function SidebarItem({ icon: Icon, label, active, onClick }: { icon: typeof LayoutDashboard; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
        active ? 'bg-volcanic-gold/10 text-volcanic-gold border border-volcanic-gold/30' : 'text-text-sand hover:bg-surface hover:text-text-warm'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/* ── KPI Card ── */
function KPICard({ title, value, change, changeType, icon: Icon, delay }: { title: string; value: string; change: string; changeType: 'up' | 'down'; icon: typeof Package; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-volcanic-gold/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-volcanic-gold" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${changeType === 'up' ? 'text-huila-green' : 'text-warm-rust'}`}>
          {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-mono-data font-bold text-text-warm">{value}</p>
      <p className="text-xs text-text-muted mt-1">{title}</p>
    </motion.div>
  );
}

/* ── Dashboard View ── */
function DashboardView() {
  const activeLotes = lotes.filter(l => l.estado === 'publicado').length;
  const totalOfertas = ofertas.length;
  const ofertasPendientes = ofertas.filter(o => o.estado === 'pendiente').length;
  const avgPrice = lotes.reduce((acc, l) => acc + l.precio_calculado, 0) / lotes.length;

  const priceHistory = Array.from({ length: 48 }, (_, i) => ({
    time: `${i}:00`,
    ICE: 1.75 + Math.sin(i * 0.2) * 0.08 + Math.random() * 0.04,
    Geisha: 30 + Math.sin(i * 0.15) * 2 + Math.random() * 1,
    Bourbon: 19 + Math.sin(i * 0.15) * 1.5 + Math.random() * 0.8,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Lotes activos" value={activeLotes.toString()} change="+12%" changeType="up" icon={Package} delay={0} />
        <KPICard title="Total ofertas" value={totalOfertas.toString()} change="+8%" changeType="up" icon={DollarSign} delay={0.1} />
        <KPICard title="Pendientes" value={ofertasPendientes.toString()} change="-2" changeType="down" icon={Bell} delay={0.2} />
        <KPICard title="Precio promedio" value={`$${avgPrice.toFixed(2)}`} change="+5%" changeType="up" icon={TrendingUp} delay={0.3} />
      </div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-xl p-4"
      >
        <h3 className="text-sm font-medium text-text-warm mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-volcanic-gold" />
          Alertas recientes
        </h3>
        <div className="space-y-2">
          {ofertas.filter(o => o.estado === 'pendiente').slice(0, 3).map(o => (
            <div key={o.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-gold-subtle/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-volcanic-gold animate-pulse" />
                <div>
                  <p className="text-sm text-text-warm">Nueva oferta: {o.empresa}</p>
                  <p className="text-xs text-text-sand">{o.volumen_sacos} sacos · ${o.precio_ofrecido}/kg · {o.incoterm}</p>
                </div>
              </div>
              <span className="text-xs font-mono-data text-volcanic-gold">Ahora</span>
            </div>
          ))}
          {ofertas.filter(o => o.estado === 'pendiente').length === 0 && (
            <p className="text-sm text-text-muted py-4 text-center">Sin alertas pendientes</p>
          )}
        </div>
      </motion.div>

      {/* Price Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel rounded-xl p-5"
      >
        <h3 className="text-sm font-medium text-text-warm mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-volcanic-gold" />
          Precio ICE últimas 48h
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={priceHistory}>
            <defs>
              <linearGradient id="iceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.1)" />
            <XAxis dataKey="time" stroke="#5C5646" fontSize={10} tickLine={false} />
            <YAxis stroke="#5C5646" fontSize={10} tickLine={false} domain={['dataMin - 0.05', 'dataMax + 0.05']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1C1C18', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#A09880' }}
            />
            <Area type="monotone" dataKey="ICE" stroke="#C9A84C" fill="url(#iceGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

/* ── Lotes View ── */
function LotesView() {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const navigate = useNavigate();

  const estados = ['publicado', 'ofertado', 'vendido', 'borrador', 'archivado'];
  const estadoColors: Record<string, string> = {
    publicado: 'bg-huila-green/10 text-huila-green',
    ofertado: 'bg-volcanic-gold/10 text-volcanic-gold',
    vendido: 'bg-blue-500/10 text-blue-400',
    borrador: 'bg-text-muted/10 text-text-muted',
    archivado: 'bg-text-muted/5 text-text-muted opacity-50',
  };

  const filtered = lotes.filter(l => {
    if (search && !l.nombre.toLowerCase().includes(search.toLowerCase()) && !l.variedad.toLowerCase().includes(search.toLowerCase())) return false;
    if (estadoFilter && l.estado !== estadoFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar lotes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-gold-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-warm placeholder:text-text-muted focus:border-volcanic-gold focus:outline-none"
          />
        </div>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="bg-surface border border-gold-subtle rounded-lg px-4 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {estados.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </select>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gold-subtle rounded-lg text-sm text-text-sand hover:text-text-warm transition-colors">
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold-subtle">
                {['#', 'Foto', 'Nombre', 'Variedad', 'SCA', 'Estado', 'Precio/kg', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider text-text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lote) => (
                <tr key={lote.id} className="border-b border-gold-subtle/50 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-mono-data text-xs text-text-muted">{lote.id}</td>
                  <td className="px-4 py-3">
                    <img src={lote.foto_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-text-warm font-medium">{lote.nombre}</p>
                    <p className="text-xs text-text-muted">{lote.municipio}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-sand">{lote.variedad}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono-data text-xs font-semibold ${lote.sca_score >= 87 ? 'text-huila-green' : lote.sca_score >= 85 ? 'text-volcanic-gold' : 'text-text-muted'}`}>
                      {lote.sca_score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${estadoColors[lote.estado]}`}>
                      {lote.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono-data text-sm text-volcanic-gold">${lote.precio_calculado.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-text-muted hover:text-volcanic-gold transition-colors" title="Editar">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-volcanic-gold transition-colors" title="Copiar link">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/lote/${lote.slug}`)}
                        className="p-1.5 text-text-muted hover:text-volcanic-gold transition-colors"
                        title="Ver público"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-warm-rust transition-colors" title="Archivar">
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-text-muted text-sm">No se encontraron lotes</p>
        )}
      </div>
    </div>
  );
}

/* ── Ofertas Kanban ── */
function OfertasView() {
  const { addToast } = useAppStore();
  const columns = [
    { key: 'pendiente', label: 'PENDIENTES', color: 'border-volcanic-gold', count: ofertas.filter(o => o.estado === 'pendiente').length },
    { key: 'aceptada', label: 'ACEPTADAS', color: 'border-huila-green', count: ofertas.filter(o => o.estado === 'aceptada').length },
    { key: 'rechazada', label: 'RECHAZADAS', color: 'border-warm-rust', count: ofertas.filter(o => o.estado === 'rechazada').length },
  ];

  const handleAction = (id: number, action: 'aceptada' | 'rechazada') => {
    addToast({
      type: 'sistema',
      title: action === 'aceptada' ? 'Oferta aceptada' : 'Oferta rechazada',
      message: `La oferta #${id} ha sido ${action}. Notificación enviada por WhatsApp.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => (
          <div key={col.key} className={`glass-panel rounded-xl border-t-2 ${col.color}`}>
            <div className="p-4 border-b border-gold-subtle">
              <h3 className="text-sm font-medium text-text-warm">{col.label} ({col.count})</h3>
            </div>
            <div className="p-3 space-y-3">
              {ofertas.filter(o => o.estado === col.key).map(oferta => {
                const lote = lotes.find(l => l.id === oferta.lote_id);
                return (
                  <motion.div
                    key={oferta.id}
                    layout
                    className="bg-surface rounded-lg p-4 border border-gold-subtle/50 hover:border-gold-medium transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-text-warm">{oferta.empresa}</p>
                      <span className="text-[10px] text-text-muted font-mono-data">#{oferta.id}</span>
                    </div>
                    <p className="text-xs text-text-sand mb-1">{lote?.nombre || 'Lote desconocido'} · {lote?.variedad}</p>
                    <p className="text-xs text-text-muted mb-3">{oferta.incoterm} · {oferta.volumen_sacos} sacos</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono-data text-sm text-volcanic-gold">${oferta.precio_ofrecido.toFixed(2)}/kg</span>
                      {col.key === 'pendiente' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAction(oferta.id, 'aceptada')}
                            className="p-1.5 text-huila-green hover:bg-huila-green/10 rounded transition-colors"
                            title="Aceptar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(oferta.id, 'rechazada')}
                            className="p-1.5 text-warm-rust hover:bg-warm-rust/10 rounded transition-colors"
                            title="Rechazar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {col.key === 'aceptada' && (
                        <div className="flex gap-1">
                          <button className="px-2 py-1 text-[10px] text-huila-green border border-huila-green/30 rounded hover:bg-huila-green/10 transition-colors">
                            Notificar
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {ofertas.filter(o => o.estado === col.key).length === 0 && (
                <p className="text-xs text-text-muted text-center py-6">Sin ofertas</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Precios View ── */
function PreciosView() {
  const [diferenciales, setDiferenciales] = useState({
    d_colombia: precioActual.d_colombia,
    d_huila: precioActual.d_huila,
    d_trace: precioActual.d_trace,
  });
  const { addToast } = useAppStore();

  const priceHistory = Array.from({ length: 48 }, (_, i) => ({
    time: `${i}:00`,
    ICE: 1.75 + Math.sin(i * 0.2) * 0.08 + Math.random() * 0.04,
    Geisha: 30 + Math.sin(i * 0.15) * 2 + Math.random() * 1,
    Bourbon: 19 + Math.sin(i * 0.15) * 1.5 + Math.random() * 0.8,
    Castillo: 14 + Math.sin(i * 0.12) * 1 + Math.random() * 0.5,
  }));

  const handleApply = () => {
    addToast({
      type: 'precio',
      title: 'Precios actualizados',
      message: `Diferenciales aplicados. ${lotes.filter(l => l.estado === 'publicado').length} lotes recalculados.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-5"
      >
        <h3 className="text-sm font-medium text-text-warm mb-4">Precio ICE últimas 48h</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={priceHistory}>
            <defs>
              <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.1)" />
            <XAxis dataKey="time" stroke="#5C5646" fontSize={10} tickLine={false} />
            <YAxis stroke="#5C5646" fontSize={10} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1C1C18', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '8px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="ICE" stroke="#C9A84C" fill="url(#iceGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-5"
      >
        <h3 className="text-sm font-medium text-text-warm mb-4">Comparativo por variedad</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.1)" />
            <XAxis dataKey="time" stroke="#5C5646" fontSize={10} tickLine={false} />
            <YAxis stroke="#5C5646" fontSize={10} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1C1C18', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '8px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="Geisha" stroke="#C9A84C" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Bourbon" stroke="#4A8C42" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Castillo" stroke="#8A6E2F" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Differential Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl p-5"
      >
        <h3 className="text-sm font-medium text-text-warm mb-4">Control de diferenciales</h3>
        <div className="space-y-5">
          {[
            { key: 'd_colombia' as const, label: 'Diferencial Colombia', min: 0, max: 1.00, step: 0.01, unit: 'USD/lb' },
            { key: 'd_huila' as const, label: 'Diferencial Huila', min: 0, max: 0.50, step: 0.01, unit: 'USD/lb' },
            { key: 'd_trace' as const, label: 'Prima Trazabilidad', min: 0, max: 1.00, step: 0.01, unit: 'USD/kg' },
          ].map(ctrl => (
            <div key={ctrl.key}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-sand">{ctrl.label}</span>
                <span className="font-mono-data text-sm text-volcanic-gold">{diferenciales[ctrl.key].toFixed(2)} {ctrl.unit}</span>
              </div>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={diferenciales[ctrl.key]}
                onChange={(e) => setDiferenciales({ ...diferenciales, [ctrl.key]: Number(e.target.value) })}
                className="w-full accent-volcanic-gold"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleApply}
          className="mt-5 w-full py-3 bg-volcanic-gold text-void font-medium rounded-lg hover:bg-volcanic-gold/90 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Aplicar cambios
        </button>
      </motion.div>
    </div>
  );
}

/* ── Main Admin Page ── */
export function AdminPage() {
  const { tab } = useParams<{ tab: Tab }>();
  const navigate = useNavigate();
  const activeTab = tab || 'dashboard';

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'lotes', label: 'Lotes', icon: Package },
    { key: 'ofertas', label: 'Ofertas', icon: DollarSign },
    { key: 'precios', label: 'Precios', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-void pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 border-r border-gold-subtle min-h-screen p-4">
          <div className="mb-6 px-4">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">Admin Panel</span>
          </div>
          <nav className="space-y-1">
            {tabs.map(t => (
              <SidebarItem
                key={t.key}
                icon={t.icon}
                label={t.label}
                active={activeTab === t.key}
                onClick={() => navigate(`/admin/${t.key}`)}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile Tabs */}
        <div className="lg:hidden w-full fixed top-16 left-0 z-40 bg-void/95 backdrop-blur border-b border-gold-subtle">
          <div className="flex overflow-x-auto px-4 py-2 gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => navigate(`/admin/${t.key}`)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  activeTab === t.key ? 'bg-volcanic-gold/10 text-volcanic-gold border border-volcanic-gold/30' : 'text-text-sand'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:mt-0 mt-12">
          <div className="max-w-5xl">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'lotes' && <LotesView />}
            {activeTab === 'ofertas' && <OfertasView />}
            {activeTab === 'precios' && <PreciosView />}
          </div>
        </main>
      </div>
    </div>
  );
}
