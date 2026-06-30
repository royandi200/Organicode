import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hexagon, MapPin, TrendingUp, TrendingDown, Copy, Check,
  ExternalLink, ChevronDown, Clock,
  Sun, CloudRain, Wind, Leaf, Users, Heart, Shield, Flower2,
  FileText, MessageCircle, Send, Loader2
} from 'lucide-react';
import { useLote, usePrecioActual } from '@/hooks/useApi';
import { getLoteBySlug, calcularDesglosePrecio, precioActual as mockPrecio, incotermRates } from '@/data/mock';
import { useAppStore } from '@/store';
import { FlavorWheel } from '@/components/FlavorWheel';

export function LotePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: apiLote, loading } = useLote(slug || '');
  const { data: apiPrecio } = usePrecioActual();

  // Fallback to mock while API loads or if not found
  const mockLote = getLoteBySlug(slug || '');

  // Normalize API lote to match mock shape
  const lote = apiLote ? {
    ...apiLote,
    caficultor: {
      id: apiLote.caficultor_id,
      nombre: apiLote.caficultor_nombre,
      finca: apiLote.caficultor_finca,
      vereda: apiLote.caficultor_vereda,
      municipio: apiLote.caficultor_municipio,
      desde: apiLote.caficultor_desde,
      foto: apiLote.caficultor_foto || '/images/producer-portrait.jpg',
      valores: typeof apiLote.caficultor_valores === 'string'
        ? JSON.parse(apiLote.caficultor_valores)
        : (apiLote.caficultor_valores || []),
      bio: apiLote.caficultor_storytelling || ''
    },
    coordenadas: {
      lat: parseFloat(apiLote.coordenadas_lat) || 1.85,
      lng: parseFloat(apiLote.coordenadas_lng) || -76.05
    },
    foto_url: apiLote.foto_url || '/images/farm-aerial.jpg',
    timeline: (apiLote.timeline || []).map((t: any) => ({
      fecha: t.fecha,
      evento: t.evento?.toUpperCase(),
      detalle: t.detalle,
      hash: t.hash_tx || null
    })),
    suelo: apiLote.suelo || mockLote?.suelo || 'Volcánico-Andosol',
    brillo_solar: apiLote.brillo_solar || mockLote?.brillo_solar || '2,100 hrs/año',
    precipitacion: apiLote.precipitacion || mockLote?.precipitacion || '1,800 mm/año',
    microclima: apiLote.microclima || mockLote?.microclima || 'Cruce Andes-Amazonía',
    cosecha: mockLote?.cosecha || apiLote.fecha_cosecha,
    sugerencia_ia: apiLote.sugerencia_ia || mockLote?.sugerencia_ia || 'Perfil de especialidad. Recomendamos tueste claro para resaltar sus características únicas.',
    storytelling_ia: apiLote.storytelling_ia || mockLote?.storytelling_ia || ''
  } : mockLote;

  // Precio: use API if available, else mock
  const precio = apiPrecio ? {
    precio_ice: parseFloat(apiPrecio.precio_ice_usd),
    trm: parseFloat(apiPrecio.trm_cop),
    d_colombia: parseFloat(apiPrecio.diferencial_col),
    d_huila: parseFloat(apiPrecio.diferencial_hui),
    d_trace: parseFloat(apiPrecio.diferencial_trace),
    updated_at: apiPrecio.recorded_at,
    trend: 'up' as const
  } : mockPrecio;

  const [copiedHash, setCopiedHash] = useState(false);
  const [incoterm, setIncoterm] = useState<'EXW' | 'FOB' | 'CIF'>('FOB');
  const [cifCountry, setCifCountry] = useState('Alemania');
  const [showSticky, setShowSticky] = useState(false);
  const { openOfferModal, openSampleModal } = useAppStore();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) setShowSticky(window.scrollY > heroRef.current.offsetHeight - 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-volcanic-gold mx-auto mb-4 animate-spin" />
          <p className="text-text-muted text-sm">Cargando lote...</p>
        </div>
      </div>
    );
  }

  if (!lote) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <Hexagon className="w-16 h-16 text-volcanic-gold mx-auto mb-4" />
          <h1 className="font-display text-2xl text-text-ink mb-2">Lote no encontrado</h1>
          <Link to="/catalogo" className="text-volcanic-gold hover:underline">Ver catálogo</Link>
        </div>
      </div>
    );
  }

  const copyHash = () => {
    if (lote.hash_registro) {
      navigator.clipboard.writeText(lote.hash_registro);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const desglose = calcularDesglosePrecio(lote.sca_score, precio);

  const getIncotermExtra = () => {
    if (incoterm === 'EXW') return 0;
    if (incoterm === 'FOB') return incotermRates.FOB;
    const cifRates = incotermRates.CIF as Record<string, number>;
    return cifRates[cifCountry] || cifRates['default'];
  };

  const precioFinal = desglose.totalEXW + getIncotermExtra();
  const TrendIcon = precio.trend === 'up' ? TrendingUp : TrendingDown;
  const activeNotes = (lote.notas_sensoriales || '').split(',').map((n: string) => n.trim());

  const valoresMap: Record<string, { icon: typeof Leaf; label: string }> = {
    organico: { icon: Leaf, label: 'Cultivo orgánico' },
    mujeres_caficultoras: { icon: Users, label: 'Mujeres caficultoras' },
    proceso_paz: { icon: Heart, label: 'Proceso de Paz' },
    apicultura: { icon: Flower2, label: 'Apicultura integrada' },
  };

  const timelineEvents = lote.timeline || [];

  return (
    <div className="min-h-screen bg-parchment">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={lote.foto_url} alt={lote.nombre} className="w-full h-full object-cover animate-ken-burns" />
          <div className="absolute inset-0 bg-gradient-to-b from-parchment/0 via-parchment/60 to-parchment" />
        </div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <button onClick={copyHash} className="inline-flex items-center gap-2 glass-pill px-4 py-2 mb-6 hover:border-volcanic-gold/50 transition-colors group">
              <Hexagon className="w-4 h-4 text-volcanic-gold" strokeWidth={1.5} />
              <span className="text-xs font-medium tracking-wider text-text-ink/80">VERIFIED</span>
              <span className="text-[10px] font-mono-data text-text-muted">· BATCH #{lote.id}</span>
              {lote.hash_registro && <span className="text-[10px] font-mono-data text-text-muted hidden sm:inline">· {lote.hash_registro.slice(0, 10)}...</span>}
              {copiedHash ? <Check className="w-3.5 h-3.5 text-huila-green" /> : <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-volcanic-gold transition-colors" />}
            </button>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text-ink leading-[1.05] mb-3">{lote.nombre}</h1>
            <p className="text-lg sm:text-xl text-text-ink/70 mb-8">
              {lote.variedad} {lote.proceso} · Finca {lote.caficultor?.finca}
            </p>
            <div className="flex items-center justify-center gap-6 sm:gap-8 text-sm text-text-ink/70 mb-10">
              <span className="flex items-center gap-1.5">
                <span className="text-volcanic-gold font-mono-data font-semibold text-lg">{lote.sca_score}</span> SCA
              </span>
              <span className="text-text-muted">·</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-text-muted" />{lote.caficultor?.municipio || lote.municipio}, Huila</span>
              <span className="text-text-muted hidden sm:inline">·</span>
              <span className="hidden sm:inline"><TrendingUp className="w-4 h-4 inline mr-1" />{lote.altitud_msnm?.toLocaleString()} msnm</span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-void/85 backdrop-blur-xl border border-gold-medium rounded-2xl p-6 max-w-md mx-auto mb-8"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-data text-3xl font-bold text-volcanic-gold">${precioFinal.toFixed(2)}</span>
                <span className="text-xs text-text-sand uppercase tracking-wider">USD/kg {incoterm}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <TrendIcon className={`w-3 h-3 ${precio.trend === 'up' ? 'text-huila-green' : 'text-warm-rust'}`} />
                <span>Precio en tiempo real</span>
              </div>
              <div className="flex gap-2 mt-4">
                {(['EXW', 'FOB', 'CIF'] as const).map((term) => (
                  <button key={term} onClick={() => setIncoterm(term)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      incoterm === term ? 'bg-volcanic-gold text-void' : 'bg-surface text-text-sand hover:text-text-warm border border-gold-subtle'
                    }`}>{term}</button>
                ))}
              </div>
              {incoterm === 'CIF' && (
                <select value={cifCountry} onChange={(e) => setCifCountry(e.target.value)}
                  className="w-full mt-2 bg-surface border border-gold-subtle rounded-lg px-3 py-2 text-xs text-text-warm">
                  <option>Alemania</option><option>Corea del Sur</option><option>Japón</option><option>Estados Unidos</option>
                </select>
              )}
            </motion.div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button onClick={() => openSampleModal(lote)}
                className="px-6 py-3 bg-void text-text-warm rounded-lg font-medium hover:bg-void/90 transition-colors flex items-center justify-center gap-2 border border-gold-subtle">
                <MessageCircle className="w-4 h-4" />Solicitar Muestra
              </button>
              <button onClick={() => openOfferModal(lote)}
                className="px-6 py-3 bg-volcanic-gold text-void rounded-lg font-medium hover:bg-volcanic-gold/90 transition-all hover:shadow-gold flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />Hacer Oferta
              </button>
            </div>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center gap-1 text-text-muted">
              <span className="text-xs">Ver ficha completa</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MAPA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gold-subtle h-[400px] relative bg-surface">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15949!2d${lote.coordenadas?.lng || -76.05}!3d${lote.coordenadas?.lat || 1.85}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1ses!2sco!4v1`}
                className="w-full h-full border-0 grayscale-[30%]" allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Ubicación de la finca"
              />
              <div className="absolute top-4 left-4 glass-pill px-3 py-1.5">
                <span className="text-xs font-medium text-text-warm flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-volcanic-gold" />{lote.caficultor?.municipio}, Huila
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-2xl text-text-ink mb-6">Terroir</h3>
              {[
                { icon: MapPin, label: 'Municipio', value: lote.caficultor?.municipio || lote.municipio },
                { icon: Hexagon, label: 'Suelo', value: lote.suelo },
                { icon: Sun, label: 'Brillo solar', value: lote.brillo_solar },
                { icon: CloudRain, label: 'Precipitación', value: lote.precipitacion },
                { icon: Wind, label: 'Microclima', value: lote.microclima },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur rounded-xl border border-gold-subtle/50">
                  <item.icon className="w-5 h-5 text-volcanic-gold shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted">{item.label}</p>
                    <p className="text-sm font-medium text-text-ink">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FLAVOR WHEEL */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-void">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl text-text-warm mb-3">Perfil Sensorial</h2>
            <p className="text-text-sand max-w-xl mx-auto">Análisis Q-Grader certificado.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <FlavorWheel activeNotes={activeNotes} scaScore={lote.sca_score} size={400} />
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {activeNotes.map((note: string, i: number) => (
                  <motion.span key={note} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="px-3 py-1.5 bg-volcanic-gold/10 border border-volcanic-gold/30 rounded-full text-sm text-volcanic-gold font-medium">
                    {note}
                  </motion.span>
                ))}
              </div>
              <div className="glass-panel rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-medium text-text-warm mb-3">Datos Técnicos</h4>
                {[
                  ['Proceso', `${lote.proceso} · ${lote.cosecha || lote.fecha_cosecha}`],
                  ['Humedad', `${lote.humedad}% · Rendimiento: ${lote.rendimiento}%`],
                  ['Altitud', `${lote.altitud_msnm?.toLocaleString()} msnm · Suelo volcánico`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-text-muted">{label}</span>
                    <span className="text-text-warm">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-huila-green/10 border border-huila-green/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-huila-green mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-huila-green mb-1">Organicode AI</p>
                    <p className="text-sm text-text-sand italic">"{lote.sugerencia_ia}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOR */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-parchment">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="relative">
                <img src={lote.caficultor?.foto} alt={lote.caficultor?.nombre}
                  className="w-full max-w-md mx-auto rounded-xl sepia-[0.2] contrast-110"
                  style={{ aspectRatio: '2/3', objectFit: 'cover' }} />
                <div className="absolute inset-0 rounded-xl border border-gold-subtle/50 pointer-events-none" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Historia del Productor</p>
                <h2 className="font-display text-3xl sm:text-4xl text-text-ink mb-4">{lote.caficultor?.nombre}</h2>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-ink/70">
                <span className="font-medium">Finca {lote.caficultor?.finca}</span>
                <span>·</span><span>Vda. {lote.caficultor?.vereda}, {lote.caficultor?.municipio}</span>
                {lote.caficultor?.desde && <><span>·</span><span>desde {lote.caficultor.desde}</span></>}
              </div>
              <p className="text-text-ink/80 leading-relaxed text-lg">{lote.storytelling_ia}</p>
              <div className="flex flex-wrap gap-3 pt-4">
                {(lote.caficultor?.valores || []).map((v: string) => {
                  const vm = valoresMap[v];
                  if (!vm) return null;
                  const Icon = vm.icon;
                  return (
                    <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-lg text-xs font-medium text-text-ink border border-gold-subtle/30">
                      <Icon className="w-3.5 h-3.5 text-volcanic-gold" />{vm.label}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-void">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-text-warm mb-3">La cadena de confianza de este lote</h2>
            <p className="text-text-sand">Cada etapa registrada para garantizar trazabilidad completa.</p>
          </div>
          <div className="relative">
            <div className="absolute left-[19px] sm:left-[23px] top-0 bottom-0 w-px bg-gold-subtle" />
            {timelineEvents.map((event: any, i: number) => (
              <motion.div key={event.fecha + event.evento} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex gap-4 sm:gap-6 mb-10 last:mb-0">
                <div className="relative z-10 shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 ${
                    event.hash ? 'bg-volcanic-gold/20 border-volcanic-gold' : 'bg-surface border-text-muted'
                  }`}>
                    <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${event.hash ? 'text-volcanic-gold' : 'text-text-muted'}`} />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono-data text-text-muted">{event.fecha}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      event.hash ? 'bg-volcanic-gold/10 text-volcanic-gold' : 'bg-text-muted/10 text-text-muted'
                    }`}>{event.evento}</span>
                  </div>
                  <p className="text-sm text-text-warm mb-2">{event.detalle}</p>
                  {event.hash && (
                    <a href={`https://polygonscan.com/tx/${event.hash}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono-data text-volcanic-gold hover:text-volcanic-gold/80 transition-colors">
                      <span className="truncate max-w-[200px]">{event.hash.slice(0, 20)}...</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE CALCULATOR */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-parchment">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl text-text-ink mb-2 text-center">Transparencia de Precios</h2>
          <p className="text-text-muted text-center text-sm mb-10">Cada componente del precio explicado al detalle</p>
          <div className="bg-white rounded-2xl border border-gold-subtle/50 p-6 sm:p-8 space-y-4">
            {[
              { label: 'Precio Bolsa NY ICE', value: desglose.base, isBase: true },
              { label: 'Diferencial Colombia', value: desglose.diferencialColombia },
              { label: 'Diferencial Huila', value: desglose.diferencialHuila },
              { label: 'Prima Trazabilidad', value: desglose.primaTrazabilidad },
              { label: `Prima SCA ${lote.sca_score} pts`, value: desglose.primaSCA, highlight: true },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className={`text-sm ${item.highlight ? 'text-text-ink font-medium' : 'text-text-muted'}`}>{item.label}</span>
                <span className={`font-mono-data text-sm ${item.highlight ? 'text-volcanic-gold font-semibold' : 'text-text-ink'}`}>
                  {item.isBase ? `$ ${item.value.toFixed(2)}` : `+$ ${item.value.toFixed(2)}`} USD/kg
                </span>
              </div>
            ))}
            <div className="border-t border-gold-subtle/50 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-text-ink">PRECIO BASE EXW</span>
                <span className="font-mono-data text-xl font-bold text-volcanic-gold">$ {desglose.totalEXW.toFixed(2)} USD/kg</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gold-subtle rounded-xl text-sm font-medium text-text-ink hover:border-volcanic-gold transition-colors">
              <FileText className="w-4 h-4" />Descargar Cotización PDF
            </button>
            <button onClick={() => openSampleModal(lote)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-volcanic-gold text-void rounded-xl text-sm font-medium hover:bg-volcanic-gold/90 transition-colors">
              <MessageCircle className="w-4 h-4" />Solicitar Muestra
            </button>
          </div>
        </div>
      </section>

      {/* STICKY BAR */}
      <AnimatePresence>
        {showSticky && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-gold-subtle shadow-float">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={lote.foto_url} alt={lote.nombre} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-warm truncate">{lote.nombre}</p>
                    <p className="text-xs text-text-sand">{lote.variedad} · ${precioFinal.toFixed(2)}/kg</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openSampleModal(lote)}
                    className="px-3 py-2 bg-void border border-gold-subtle rounded-lg text-xs font-medium text-text-warm hover:border-volcanic-gold transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 inline mr-1" />Muestra
                  </button>
                  <button onClick={() => openOfferModal(lote)}
                    className="px-3 py-2 bg-volcanic-gold text-void rounded-lg text-xs font-medium hover:bg-volcanic-gold/90 transition-colors">
                    <Send className="w-3.5 h-3.5 inline mr-1" />Oferta
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
