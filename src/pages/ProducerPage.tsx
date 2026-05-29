import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, TrendingUp, Package,
  Leaf, Users, Heart, Flower2, DollarSign, Loader2, Hexagon
} from 'lucide-react';
import { useProductor } from '@/hooks/useApi';

export function ProducerPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useProductor(id || '');

  const valoresMap: Record<string, { icon: typeof Leaf; label: string }> = {
    organico:              { icon: Leaf,    label: 'Cultivo orgánico' },
    mujeres_caficultoras:  { icon: Users,   label: 'Mujeres caficultoras' },
    proceso_paz:           { icon: Heart,   label: 'Proceso de Paz' },
    apicultura:            { icon: Flower2, label: 'Apicultura integrada' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-volcanic-gold animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <Hexagon className="w-16 h-16 text-volcanic-gold mx-auto mb-4" />
          <h1 className="font-display text-2xl text-text-ink mb-2">Productor no encontrado</h1>
          <Link to="/catalogo" className="text-volcanic-gold hover:underline">Ver catálogo</Link>
        </div>
      </div>
    );
  }

  const { caficultor, lotes, pagos, totalCop } = data;
  const valores = Array.isArray(caficultor.valores) ? caficultor.valores : [];

  const estadoColor: Record<string, string> = {
    publicado: 'text-huila-green bg-huila-green/10 border-huila-green/30',
    ofertado:  'text-volcanic-gold bg-volcanic-gold/10 border-volcanic-gold/30',
    vendido:   'text-warm-rust bg-warm-rust/10 border-warm-rust/30',
    borrador:  'text-text-muted bg-text-muted/10 border-text-muted/30',
  };

  return (
    <div className="min-h-screen bg-parchment pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-volcanic-gold transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />Volver al catálogo
        </Link>

        {/* Header productor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-gold-subtle/50 p-6 mb-6">
          <div className="flex items-start gap-5">
            <img src={caficultor.foto_url || '/images/producer-portrait.jpg'} alt={caficultor.nombre}
              className="w-20 h-20 rounded-xl object-cover shrink-0 sepia-[0.2]" />
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl text-text-ink mb-1">{caficultor.nombre}</h1>
              <p className="text-sm text-text-muted mb-3">Finca {caficultor.finca} · {caficultor.vereda}, {caficultor.municipio}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: MapPin,   label: caficultor.departamento || 'Huila' },
                  { icon: TrendingUp, label: `${caficultor.altitud_msnm?.toLocaleString()} msnm` },
                  { icon: Calendar,  label: `Desde ${caficultor.desde_anio || caficultor.desde}` },
                ].map(item => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 px-3 py-1 bg-parchment rounded-lg text-xs text-text-ink">
                    <item.icon className="w-3.5 h-3.5 text-volcanic-gold" />{item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {valores.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gold-subtle/30">
              {valores.map((v: string) => {
                const vm = valoresMap[v];
                if (!vm) return null;
                return (
                  <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-huila-green/5 rounded-lg text-xs font-medium text-text-ink border border-huila-green/20">
                    <vm.icon className="w-3.5 h-3.5 text-huila-green" />{vm.label}
                  </span>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Resumen pagos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Lotes totales',  value: lotes.length,                            color: 'text-volcanic-gold' },
            { label: 'Lotes vendidos', value: lotes.filter((l: any) => l.estado === 'vendido').length, color: 'text-huila-green' },
            { label: 'Total pagado',   value: `$${(totalCop / 1_000_000).toFixed(1)}M`, color: 'text-volcanic-gold' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gold-subtle/50 p-4 text-center">
              <p className={`font-mono-data text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Historial lotes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <h2 className="font-display text-xl text-text-ink mb-4">Historial de Lotes</h2>
          <div className="space-y-3">
            {lotes.map((lote: any) => (
              <Link key={lote.id} to={`/lote/${lote.slug}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-gold-subtle/50 p-4 hover:border-volcanic-gold/40 transition-colors group">
                <img src={lote.foto_url || '/images/farm-aerial.jpg'} alt={lote.nombre}
                  className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-ink group-hover:text-volcanic-gold transition-colors">{lote.nombre}</p>
                  <p className="text-xs text-text-muted">{lote.variedad} · {lote.proceso} · {parseFloat(lote.sca_score).toFixed(2)} SCA</p>
                  <p className="text-xs text-text-muted">{lote.cantidad_kg} kg · {lote.fecha_cosecha}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono-data text-sm text-volcanic-gold">${parseFloat(lote.precio_calculado).toFixed(2)}/kg</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${estadoColor[lote.estado] || ''}` }>{lote.estado}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Historial pagos */}
        {pagos && pagos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-8">
            <h2 className="font-display text-xl text-text-ink mb-4">Historial de Pagos</h2>
            <div className="bg-white rounded-2xl border border-gold-subtle/50 overflow-hidden">
              {pagos.map((pago: any, i: number) => (
                <div key={i} className={`flex items-center gap-4 p-4 ${
                  i < pagos.length - 1 ? 'border-b border-gold-subtle/30' : ''
                }`}>
                  <div className="w-10 h-10 rounded-full bg-huila-green/10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-huila-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-ink">{pago.lote_nombre}</p>
                    <p className="text-xs text-text-muted">{pago.concepto} · {pago.fecha_pago}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-data text-sm text-huila-green">+${pago.monto_usd?.toFixed(2)} USD</p>
                    <p className="text-xs text-text-muted">${(pago.monto_cop / 1000).toFixed(0)}K COP</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Package count motivador */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-6 bg-void rounded-xl p-5 flex items-center gap-4">
          <Package className="w-8 h-8 text-volcanic-gold shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-warm">Su café ha llegado a {lotes.filter((l: any) => l.estado === 'vendido').length * 3 + 2} países</p>
            <p className="text-xs text-text-sand">Gracias por cultivar los mejores cafés de Colombia</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
