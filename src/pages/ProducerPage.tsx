import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, MapPin, Award, Droplets, Sun,
  Coffee, DollarSign, ArrowUpRight, ArrowRight
} from 'lucide-react';
import { lotes } from '@/data/mock';
import { Link } from 'react-router-dom';

export function ProducerPage() {
  const { id } = useParams<{ id: string }>();
  const producerId = Number(id);

  // Find producer and their lots
  const producerLots = lotes.filter(l => l.caficultor.id === producerId);
  const producer = producerLots[0]?.caficultor;

  if (!producer) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-4">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-volcanic-gold mx-auto mb-4" />
          <h1 className="font-display text-2xl text-text-warm mb-2">Productor no encontrado</h1>
          <p className="text-sm text-text-sand mb-4">El enlace puede haber expirado.</p>
          <a
            href="https://wa.me/573001234567?text=Hola%20Organicode,%20mi%20link%20expiró"
            target="_blank"
            rel="noopener noreferrer"
            className="text-volcanic-gold hover:underline text-sm"
          >
            Solicitar nuevo link por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const activeLots = producerLots.filter(l => l.estado === 'publicado' || l.estado === 'ofertado');
  const totalKg = producerLots.reduce((acc, l) => acc + l.cantidad_kg, 0);
  const avgSCA = producerLots.reduce((acc, l) => acc + l.sca_score, 0) / producerLots.length;
  const estimatedRevenue = producerLots.reduce((acc, l) => acc + (l.precio_calculado * l.cantidad_kg), 0);
  const copRate = 3950;
  const revenueCOP = estimatedRevenue * copRate;

  // Quality evolution data (mock)
  const qualityHistory = [82, 84, 85, 86, 87, 87.5, 88, 88.5, 89, 89.25];

  return (
    <div className="min-h-screen bg-void pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-gold-subtle">
        <div className="max-w-lg mx-auto px-4 pt-6 pb-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <img
                src={producer.foto}
                alt={producer.nombre}
                className="w-16 h-16 rounded-full object-cover border-2 border-volcanic-gold/30"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-huila-green rounded-full border-2 bg-void flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-huila-green rounded-full" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl text-text-warm">{producer.nombre}</h1>
              <p className="text-sm text-text-sand flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Finca {producer.finca} · {producer.municipio}, Huila
              </p>
              <p className="text-xs text-text-muted mt-0.5">Caficultor desde {producer.desde}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Earnings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-volcanic-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-volcanic-gold" />
              <span className="text-xs uppercase tracking-wider text-text-muted">Ingresos estimados</span>
            </div>
            <p className="font-mono-data text-3xl font-bold text-volcanic-gold mb-1">
              ${(revenueCOP / 1000000).toFixed(1)}M COP
            </p>
            <p className="text-xs text-text-sand mb-3">≈ ${estimatedRevenue.toFixed(0)} USD</p>
            <div className="flex items-center gap-2 px-3 py-2 bg-huila-green/10 rounded-lg">
              <ArrowUpRight className="w-4 h-4 text-huila-green" />
              <span className="text-xs text-huila-green font-medium">
                +$1.8M COP vs cooperativa local
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-panel rounded-xl p-4 text-center"
          >
            <Coffee className="w-5 h-5 text-volcanic-gold mx-auto mb-2" />
            <p className="font-mono-data text-lg font-bold text-text-warm">{activeLots.length}</p>
            <p className="text-[10px] text-text-muted">Lotes activos</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-4 text-center"
          >
            <Droplets className="w-5 h-5 text-huila-green mx-auto mb-2" />
            <p className="font-mono-data text-lg font-bold text-text-warm">{totalKg}</p>
            <p className="text-[10px] text-text-muted">Kg total</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-panel rounded-xl p-4 text-center"
          >
            <Award className="w-5 h-5 text-volcanic-gold mx-auto mb-2" />
            <p className="font-mono-data text-lg font-bold text-text-warm">{avgSCA.toFixed(1)}</p>
            <p className="text-[10px] text-text-muted">SCA promedio</p>
          </motion.div>
        </div>

        {/* Quality Evolution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-volcanic-gold" />
              <span className="text-sm font-medium text-text-warm">Evolución de calidad</span>
            </div>
            <span className="font-mono-data text-xs text-huila-green flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +7.25 pts
            </span>
          </div>
          
          {/* Bar chart */}
          <div className="flex items-end gap-1 h-20 mb-2">
            {qualityHistory.map((score, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all hover:bg-volcanic-gold"
                style={{
                  height: `${((score - 80) / 15) * 100}%`,
                  backgroundColor: i === qualityHistory.length - 1 ? '#C9A84C' : `rgba(201, 168, 76, ${0.2 + (i / qualityHistory.length) * 0.5})`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>2020</span>
            <span>{qualityHistory[0]} pts</span>
            <span className="text-volcanic-gold font-mono-data font-semibold">{qualityHistory[qualityHistory.length - 1]} pts</span>
          </div>
        </motion.div>

        {/* Active Lots */}
        <div>
          <h2 className="text-sm font-medium text-text-warm mb-3 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-volcanic-gold" />
            Tus lotes activos
          </h2>
          <div className="space-y-3">
            {producerLots.map((lote, i) => (
              <motion.div
                key={lote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="glass-panel rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text-warm">{lote.nombre}</p>
                    <p className="text-xs text-text-sand">{lote.variedad} · Lote #{lote.id}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                    lote.estado === 'publicado' ? 'bg-huila-green/10 text-huila-green' :
                    lote.estado === 'ofertado' ? 'bg-volcanic-gold/10 text-volcanic-gold' :
                    'bg-text-muted/10 text-text-muted'
                  }`}>
                    {lote.estado}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-sand mb-3">
                  <span>{lote.cantidad_kg} kg</span>
                  <span>{lote.sca_score} SCA</span>
                  <span className="font-mono-data text-volcanic-gold">${lote.precio_calculado}/kg</span>
                </div>
                <Link
                  to={`/lote/${lote.slug}`}
                  className="flex items-center gap-1 text-xs text-volcanic-gold hover:underline"
                >
                  Ver ficha completa
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Register New Lot CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-xl p-5 text-center border-volcanic-gold/30"
        >
          <Sun className="w-8 h-8 text-volcanic-gold mx-auto mb-3" />
          <h3 className="font-display text-lg text-text-warm mb-2">¿Nueva cosecha lista?</h3>
          <p className="text-xs text-text-sand mb-4">
            Registra tu nuevo lote y empieza a recibir ofertas de compradores internacionales.
          </p>
          <a
            href="https://wa.me/573001234567?text=Hola%20Organicode,%20quiero%20registrar%20un%20nuevo%20lote"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-volcanic-gold text-void text-sm font-medium rounded-xl hover:bg-volcanic-gold/90 transition-colors"
          >
            Registrar lote por WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}
