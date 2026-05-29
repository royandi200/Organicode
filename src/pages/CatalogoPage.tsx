import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, ChevronRight, Package,
  Coffee, Star, TrendingUp, ChevronDown, Loader2
} from 'lucide-react';
import { useLotes, usePrecioActual } from '@/hooks/useApi';
import { lotes as mockLotes, precioActual as mockPrecio } from '@/data/mock';
import { useAppStore } from '@/store';

/* ── Lote Card ── */
function CatalogLoteCard({ lote, index }: { lote: any; index: number }) {
  const { openOfferModal, openSampleModal } = useAppStore();
  const scaScore = parseFloat(lote.sca_score);
  const precio = parseFloat(lote.precio_calculado);
  const scaColor = scaScore >= 87 ? 'bg-huila-green/10 text-huila-green' : scaScore >= 85 ? 'bg-volcanic-gold/10 text-volcanic-gold' : 'bg-text-muted/10 text-text-muted';
  const estadoConfig: Record<string, { label: string; color: string }> = {
    publicado:  { label: 'DISPONIBLE', color: 'bg-huila-green/10 text-huila-green border-huila-green/30' },
    ofertado:   { label: 'OFERTADO',   color: 'bg-volcanic-gold/10 text-volcanic-gold border-volcanic-gold/30' },
    vendido:    { label: 'VENDIDO',    color: 'bg-warm-rust/10 text-warm-rust border-warm-rust/30' },
    borrador:   { label: 'BORRADOR',   color: 'bg-text-muted/10 text-text-muted border-text-muted/30' },
    archivado:  { label: 'ARCHIVADO',  color: 'bg-text-muted/5 text-text-muted border-text-muted/20 opacity-50' },
  };
  const estado = estadoConfig[lote.estado] || estadoConfig.borrador;
  const notas = (lote.notas_sensoriales || '').split(',').slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`group bg-surface border border-gold-subtle rounded-xl overflow-hidden hover:border-volcanic-gold/40 hover:-translate-y-1 hover:shadow-gold transition-all duration-300 ${lote.estado === 'vendido' ? 'opacity-40' : ''}`}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img src={lote.foto_url || '/images/farm-aerial.jpg'} alt={lote.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${scaColor} border-current`}>
            {scaScore} SCA
          </span>
          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${estado.color}`}>
            {estado.label}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg text-text-warm group-hover:text-volcanic-gold transition-colors mb-1">
          <Link to={`/lote/${lote.slug}`}>{lote.nombre}</Link>
        </h3>
        <p className="text-xs text-text-sand mb-3">
          {lote.variedad} · {lote.proceso} · {lote.caficultor_municipio || lote.municipio}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {notas.map((n: string) => (
            <span key={n} className="px-2 py-0.5 bg-volcanic-gold/5 border border-volcanic-gold/20 rounded-full text-[10px] text-volcanic-gold">{n.trim()}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono-data text-xl font-bold text-volcanic-gold">${precio.toFixed(2)}</span>
            <span className="text-xs text-text-sand">/kg</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openSampleModal(lote)} className="px-3 py-1.5 text-xs text-text-sand border border-gold-subtle rounded-lg hover:border-volcanic-gold transition-colors">Muestra</button>
            <button onClick={() => openOfferModal(lote)} className="px-3 py-1.5 text-xs bg-volcanic-gold text-void rounded-lg hover:bg-volcanic-gold/90 transition-colors">Oferta</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Coffee Matcher ── */
function CoffeeMatcher({ onComplete }: { onComplete: (prefs: any) => void }) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({ volumen: '', perfil: [] as string[], scaMin: 82, presupuesto: 50 });
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="glass-panel rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-volcanic-gold/30 transition-colors" onClick={() => setCollapsed(false)}>
        <div className="flex items-center gap-3">
          <Coffee className="w-5 h-5 text-volcanic-gold" />
          <span className="text-sm text-text-warm font-medium">Coffee Matcher — Encuentra tu lote ideal</span>
        </div>
        <ChevronDown className="w-4 h-4 text-text-muted" />
      </div>
    );
  }

  const steps = [
    { title: 'Volumen', desc: '¿Qué cantidad necesitas?' },
    { title: 'Perfil', desc: '¿Qué sabor buscas?' },
    { title: 'SCA', desc: 'Calidad mínima' },
    { title: 'Presupuesto', desc: 'Rango de precio' },
  ];

  const volumenOptions = [
    { value: 'muestra', label: 'Muestra (200g gratis)', icon: Package },
    { value: 'microlote', label: 'Microlote (1–10 sacos)', icon: Coffee },
    { value: 'lote', label: 'Lote completo (10–50 sacos)', icon: Package },
    { value: 'contenedor', label: 'Contenedor (300+ sacos)', icon: Package },
  ];

  const perfilOptions = [
    { value: 'chocolate', label: 'Clásico achocolatado', emoji: '🍫' },
    { value: 'citrus', label: 'Cítrico y brillante', emoji: '🍋' },
    { value: 'floral', label: 'Floral y delicado', emoji: '🌸' },
    { value: 'exotico', label: 'Exótico fermentado', emoji: '🍷' },
    { value: 'dulce', label: 'Dulce y miel', emoji: '🍯' },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else { onComplete(prefs); setCollapsed(true); }
  };

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Coffee className="w-5 h-5 text-volcanic-gold" />
          <div>
            <h3 className="text-sm font-medium text-text-warm">Coffee Matcher</h3>
            <p className="text-xs text-text-muted">Encuentra tu lote ideal en 4 preguntas</p>
          </div>
        </div>
        <button onClick={() => setCollapsed(true)} className="text-text-muted hover:text-text-warm transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.title} className="flex-1">
            <div className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-volcanic-gold' : 'bg-gold-subtle'}`} />
            <p className={`text-[10px] mt-1.5 uppercase tracking-wider ${i <= step ? 'text-volcanic-gold' : 'text-text-muted'}`}>{s.title}</p>
          </div>
        ))}
      </div>
      <div className="min-h-[180px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="volumen" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm text-text-sand mb-4">{steps[0].desc}</p>
              <div className="space-y-2">
                {volumenOptions.map(opt => (
                  <button key={opt.value} onClick={() => setPrefs({ ...prefs, volumen: opt.value })}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      prefs.volumen === opt.value ? 'border-volcanic-gold bg-volcanic-gold/10' : 'border-gold-subtle hover:border-volcanic-gold/30'
                    }`}>
                    <opt.icon className="w-4 h-4 text-volcanic-gold shrink-0" />
                    <span className="text-sm text-text-warm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="perfil" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm text-text-sand mb-4">Selecciona uno o más</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {perfilOptions.map(opt => (
                  <button key={opt.value} onClick={() => {
                    const newPerfil = prefs.perfil.includes(opt.value) ? prefs.perfil.filter(p => p !== opt.value) : [...prefs.perfil, opt.value];
                    setPrefs({ ...prefs, perfil: newPerfil });
                  }} className={`p-4 rounded-lg border transition-all text-center ${
                    prefs.perfil.includes(opt.value) ? 'border-volcanic-gold bg-volcanic-gold/10' : 'border-gold-subtle hover:border-volcanic-gold/30'
                  }`}>
                    <span className="text-2xl mb-1 block">{opt.emoji}</span>
                    <span className="text-xs text-text-warm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="sca" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm text-text-sand mb-6">Puntaje SCA mínimo: <strong className="text-volcanic-gold font-mono-data">{prefs.scaMin}</strong></p>
              <div className="flex justify-between text-[10px] text-text-muted uppercase tracking-wider mb-2">
                <span>82 Comercial</span><span>85 Premium</span><span>87 Specialty</span><span>95 Ultra</span>
              </div>
              <input type="range" min={82} max={95} value={prefs.scaMin}
                onChange={(e) => setPrefs({ ...prefs, scaMin: Number(e.target.value) })}
                className="w-full accent-volcanic-gold" />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="presupuesto" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm text-text-sand mb-6">Presupuesto máximo: <strong className="text-volcanic-gold font-mono-data">${prefs.presupuesto}/kg</strong></p>
              <div className="flex justify-between text-[10px] text-text-muted uppercase tracking-wider mb-2">
                <span>$5</span><span>$25</span><span>$50+</span>
              </div>
              <input type="range" min={5} max={50} value={prefs.presupuesto}
                onChange={(e) => setPrefs({ ...prefs, presupuesto: Number(e.target.value) })}
                className="w-full accent-volcanic-gold" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-between mt-6">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="text-sm text-text-sand hover:text-text-warm transition-colors">← Anterior</button>
        )}
        <button onClick={handleNext}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-volcanic-gold text-void text-sm font-medium rounded-lg hover:bg-volcanic-gold/90 transition-colors">
          {step < 3 ? 'Siguiente' : 'Ver resultados'}<ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export function CatalogoPage() {
  const { data: apiLotes, loading } = useLotes();
  const { data: apiPrecio } = usePrecioActual();

  // Fallback to mock if API returns nothing
  const allLotes = (apiLotes && apiLotes.length > 0) ? apiLotes : mockLotes;
  const precioIce = apiPrecio ? parseFloat(apiPrecio.precio_ice_usd) : mockPrecio.precio_ice;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    variedades: [] as string[],
    procesos: [] as string[],
    scaMin: 82,
    precioMax: 100,
    municipios: [] as string[],
  });

  const variedades = [...new Set(allLotes.map((l: any) => l.variedad))];
  const procesos   = [...new Set(allLotes.map((l: any) => l.proceso))];
  const municipios = [...new Set(allLotes.map((l: any) => l.caficultor_municipio || l.municipio))];

  const toggleFilter = (type: 'variedades' | 'procesos' | 'municipios', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter((v: string) => v !== value) : [...prev[type], value]
    }));
  };

  const filteredLotes = useMemo(() => {
    return allLotes.filter((lote: any) => {
      if (lote.estado === 'borrador' || lote.estado === 'archivado') return false;
      const name = (lote.nombre || '').toLowerCase();
      const variedad = (lote.variedad || '').toLowerCase();
      if (search && !name.includes(search.toLowerCase()) && !variedad.includes(search.toLowerCase())) return false;
      if (filters.variedades.length && !filters.variedades.includes(lote.variedad)) return false;
      if (filters.procesos.length && !filters.procesos.includes(lote.proceso)) return false;
      if (parseFloat(lote.sca_score) < filters.scaMin) return false;
      if (parseFloat(lote.precio_calculado) > filters.precioMax) return false;
      const mun = lote.caficultor_municipio || lote.municipio;
      if (filters.municipios.length && !filters.municipios.includes(mun)) return false;
      return true;
    }).sort((a: any, b: any) => {
      if (a.estado === 'vendido' && b.estado !== 'vendido') return 1;
      if (a.estado !== 'vendido' && b.estado === 'vendido') return -1;
      return parseFloat(b.sca_score) - parseFloat(a.sca_score);
    });
  }, [allLotes, filters, search]);

  return (
    <div className="min-h-screen bg-void pt-20 pb-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl text-text-warm mb-1">Catálogo B2B</h1>
              <p className="text-sm text-text-sand">
                {loading ? 'Cargando lotes...' : `${filteredLotes.length} lotes disponibles · Precios actualizados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-pill px-3 py-1.5 flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-huila-green" />
                <span className="font-mono-data text-xs text-text-warm">${precioIce.toFixed(2)} ICE</span>
              </div>
            </div>
          </div>

          {/* Coffee Matcher */}
          <div className="mb-8">
            <CoffeeMatcher onComplete={(prefs) => setFilters(prev => ({ ...prev, scaMin: prefs.scaMin || 82, precioMax: prefs.presupuesto || 100 }))} />
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Buscar por nombre, variedad..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-gold-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-warm placeholder:text-text-muted focus:border-volcanic-gold focus:outline-none transition-colors" />
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                filtersOpen ? 'border-volcanic-gold text-volcanic-gold' : 'border-gold-subtle text-text-sand hover:text-text-warm'
              }`}>
              <SlidersHorizontal className="w-4 h-4" />Filtros
              {(filters.variedades.length + filters.procesos.length + filters.municipios.length > 0) && (
                <span className="w-5 h-5 rounded-full bg-volcanic-gold text-void text-[10px] font-bold flex items-center justify-center">
                  {filters.variedades.length + filters.procesos.length + filters.municipios.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }} className="overflow-hidden mb-6">
                <div className="glass-panel rounded-xl p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Variedad</p>
                    <div className="flex flex-wrap gap-2">
                      {variedades.map((v: any) => (
                        <button key={v} onClick={() => toggleFilter('variedades', v)}
                          className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                            filters.variedades.includes(v) ? 'border-volcanic-gold bg-volcanic-gold/10 text-volcanic-gold' : 'border-gold-subtle text-text-sand hover:border-volcanic-gold/30'
                          }`}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Proceso</p>
                    <div className="flex flex-wrap gap-2">
                      {procesos.map((p: any) => (
                        <button key={p} onClick={() => toggleFilter('procesos', p)}
                          className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                            filters.procesos.includes(p) ? 'border-volcanic-gold bg-volcanic-gold/10 text-volcanic-gold' : 'border-gold-subtle text-text-sand hover:border-volcanic-gold/30'
                          }`}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-muted mb-3">SCA Mínimo</p>
                    <input type="range" min={82} max={95} value={filters.scaMin}
                      onChange={(e) => setFilters({ ...filters, scaMin: Number(e.target.value) })}
                      className="w-full accent-volcanic-gold" />
                    <div className="flex justify-between text-[10px] text-text-muted mt-1">
                      <span>82</span><span className="text-volcanic-gold font-mono-data">{filters.scaMin}</span><span>95</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Municipio</p>
                    <div className="flex flex-wrap gap-2">
                      {municipios.map((m: any) => (
                        <button key={m} onClick={() => toggleFilter('municipios', m)}
                          className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                            filters.municipios.includes(m) ? 'border-volcanic-gold bg-volcanic-gold/10 text-volcanic-gold' : 'border-gold-subtle text-text-sand hover:border-volcanic-gold/30'
                          }`}>{m}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-volcanic-gold animate-spin" />
            </div>
          )}

          {/* Grid */}
          {!loading && filteredLotes.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredLotes.map((lote: any, i: number) => (
                  <CatalogLoteCard key={lote.id} lote={lote} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty */}
          {!loading && filteredLotes.length === 0 && (
            <div className="text-center py-20">
              <Star className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="font-display text-xl text-text-warm mb-2">No se encontraron lotes</h3>
              <p className="text-sm text-text-sand mb-4">Ajusta tus filtros o búsqueda</p>
              <button onClick={() => { setFilters({ variedades: [], procesos: [], scaMin: 82, precioMax: 100, municipios: [] }); setSearch(''); }}
                className="text-volcanic-gold hover:underline text-sm">Limpiar filtros</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
