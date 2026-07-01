import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hexagon, TrendingUp, ArrowRight, Shield, Coins, Handshake,
  Search, BarChart3, FileCheck, Truck, DollarSign, MapPin,
  Award, Activity, Globe
} from 'lucide-react';
import { lotes, precioActual } from '@/data/mock';
import { useAppStore } from '@/store';
import { useLang } from '@/context/LangContext';

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = '', duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="font-display text-5xl sm:text-6xl lg:text-7xl text-volcanic-gold">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── How It Works Step ── */
function Step({ number, title, desc, icon: Icon, delay }: { number: number; title: string; desc: string; icon: typeof Search; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="relative flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-volcanic-gold/10 border border-volcanic-gold/30 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-volcanic-gold" />
      </div>
      <div className="w-8 h-8 rounded-full bg-volcanic-gold text-void font-mono-data font-bold text-sm flex items-center justify-center mb-3">
        {number}
      </div>
      <h3 className="font-display text-xl text-text-warm mb-2">{title}</h3>
      <p className="text-sm text-text-sand max-w-[200px]">{desc}</p>
    </motion.div>
  );
}

/* ── Lote Card ── */
function LoteCard({ lote, index }: { lote: typeof lotes[0]; index: number }) {
  const { openOfferModal, openSampleModal } = useAppStore();
  const { t } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-surface border border-gold-subtle rounded-xl overflow-hidden hover:border-volcanic-gold/50 hover:-translate-y-1 hover:shadow-gold transition-all duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={lote.foto_url}
          alt={lote.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display text-lg text-text-warm group-hover:text-volcanic-gold transition-colors">{lote.nombre}</h3>
            <p className="text-xs text-text-sand">{lote.variedad} · {lote.proceso}</p>
          </div>
          <span className="px-2 py-1 bg-huila-green/10 text-huila-green text-xs font-mono-data font-semibold rounded-md">
            {lote.sca_score} SCA
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {lote.notas_sensoriales.split(',').slice(0, 3).map((n) => (
            <span key={n} className="px-2 py-0.5 bg-volcanic-gold/5 border border-volcanic-gold/20 rounded-full text-[10px] text-volcanic-gold">
              {n.trim()}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono-data text-lg font-bold text-volcanic-gold">
            ${lote.precio_calculado.toFixed(2)}
            <span className="text-xs font-normal text-text-sand">/kg</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => openSampleModal(lote)}
              className="px-3 py-1.5 text-xs text-text-sand border border-gold-subtle rounded-lg hover:border-volcanic-gold hover:text-text-warm transition-colors"
            >
              {t('home.muestra')}
            </button>
            <button
              onClick={() => openOfferModal(lote)}
              className="px-3 py-1.5 text-xs bg-volcanic-gold text-void rounded-lg hover:bg-volcanic-gold/90 transition-colors"
            >
              {t('home.oferta')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Home Page ── */
export default function Home() {
  const { addToast } = useAppStore();
  const { t } = useLang();
  const [regForm, setRegForm] = useState({ nombre: '', empresa: '', email: '', pais: '' });
  const [regSubmitted, setRegSubmitted] = useState(false);

  const handleReg = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitted(true);
    addToast({ type: 'sistema', title: t('home.reg_ok_t'), message: t('home.reg_ok_d') });
  };

  const publicados = lotes.filter(l => l.estado === 'publicado');

  return (
    <div className="min-h-screen">
      {/* S1: HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-mountains.jpg" alt="Huila mountains" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-void/40 to-void" />
        </div>
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="glass-pill px-4 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-huila-green animate-dot-pulse" />
                <span className="font-mono-data text-xs text-text-warm">ICE ${precioActual.precio_ice.toFixed(2)} USD/lb</span>
                <TrendingUp className="w-3 h-3 text-huila-green" />
              </div>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-text-warm leading-[1.05] max-w-5xl mx-auto mb-6">
              {t('home.hero')}
            </h1>
            <p className="text-lg sm:text-xl text-text-sand max-w-2xl mx-auto mb-10">
              {t('home.sub')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalogo" className="px-8 py-4 bg-volcanic-gold text-void font-medium rounded-xl hover:bg-volcanic-gold/90 hover:shadow-gold transition-all flex items-center justify-center gap-2">
                {t('home.cta')}<ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://wa.me/573232421944" target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 border border-gold-medium text-volcanic-gold font-medium rounded-xl hover:bg-volcanic-gold/10 transition-all flex items-center justify-center gap-2">
                {t('home.cta2')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* S2: VALUE PROPOSITION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-void">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield,    tk: 'home.feat1', color: 'text-volcanic-gold' },
              { icon: Coins,     tk: 'home.feat2', color: 'text-huila-green' },
              { icon: Handshake, tk: 'home.feat3', color: 'text-volcanic-gold' },
            ].map((item, i) => (
              <motion.div key={item.tk} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-gold-subtle flex items-center justify-center mx-auto mb-5">
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="font-display text-xl text-text-warm mb-3">{t(`${item.tk}_t`)}</h3>
                <p className="text-sm text-text-sand leading-relaxed">{t(`${item.tk}_d`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* S3: FEATURED LOTES */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-parchment">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-3">{t('home.now')}</p>
            <h2 className="font-display text-4xl text-text-ink">{t('home.featured')}</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicados.map((lote, i) => (<LoteCard key={lote.id} lote={lote} index={i} />))}
          </div>
          <div className="text-center mt-10">
            <Link to="/catalogo" className="inline-flex items-center gap-2 px-6 py-3 border border-gold-medium text-volcanic-gold rounded-xl hover:bg-volcanic-gold/10 transition-colors">
              {t('home.see_all')}<ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* S4: HOW IT WORKS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-void">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-display text-4xl text-text-warm mb-3">{t('home.how')}</h2>
            <p className="text-text-sand">{t('home.how_sub')}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <Step number={1} title={t('home.step1_t')} desc={t('home.step1_d')} icon={FileCheck} delay={0} />
            <Step number={2} title={t('home.step2_t')} desc={t('home.step2_d')} icon={Search}    delay={0.1} />
            <Step number={3} title={t('home.step3_t')} desc={t('home.step3_d')} icon={BarChart3}  delay={0.2} />
            <Step number={4} title={t('home.step4_t')} desc={t('home.step4_d')} icon={DollarSign} delay={0.3} />
            <Step number={5} title={t('home.step5_t')} desc={t('home.step5_d')} icon={Truck}      delay={0.4} />
          </div>
        </div>
      </section>

      {/* S5: STATS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-void relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: 24,  suffix: '',  label: t('home.stat1') },
              { value: 4,   suffix: '',  label: t('home.stat2') },
              { value: 90,  suffix: '+', label: t('home.stat3') },
              { value: 100, suffix: '%', label: t('home.stat4') },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-sm text-text-sand mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* S6: TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-parchment">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-4xl text-text-ink mb-3">{t('home.voices')}</h2>
            <p className="text-text-muted">{t('home.voices_sub')}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: '"Organicode nos dio visibilidad internacional que nunca imaginamos. Ahora vendemos directamente a tostadores en Corea y Alemania."', name: 'Alexander Vásquez', farm: 'Finca El Encanto', location: 'Baraya, Huila', image: '/images/producer-portrait.jpg' },
              { quote: '"El precio justo cambió nuestra realidad. Dejamos de depender de los intermediarios y ahora recibimos el verdadero valor de nuestro trabajo."', name: 'María Elena Torres', farm: 'Finca La Montaña', location: 'Baraya, Huila', image: '/images/hands-cherries.jpg' },
              { quote: '"La trazabilidad blockchain le da confianza a nuestros compradores. Saben exactamente de dónde viene cada grano de café."', name: 'Carlos Mario Ríos', farm: 'Finca San Judas', location: 'Palestina, Huila', image: '/images/drying-beds.jpg' },
            ].map((t_item, i) => (
              <motion.div key={t_item.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="bg-white rounded-xl p-6 border border-gold-subtle/50">
                <p className="text-text-ink/80 text-sm leading-relaxed mb-6 italic">{t_item.quote}</p>
                <div className="flex items-center gap-3">
                  <img src={t_item.image} alt={t_item.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-text-ink">{t_item.name}</p>
                    <p className="text-xs text-text-muted">{t_item.farm} · {t_item.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* S7: CTA / REGISTRO */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-void">
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Hexagon className="w-12 h-12 text-volcanic-gold mx-auto mb-6" strokeWidth={1} />
            <h2 className="font-display text-4xl text-text-warm mb-4">{t('home.cta_title')}</h2>
            <p className="text-text-sand mb-10">{t('home.cta_sub')}</p>
            {regSubmitted ? (
              <div className="bg-huila-green/10 border border-huila-green/30 rounded-xl p-6">
                <Award className="w-10 h-10 text-huila-green mx-auto mb-3" />
                <h3 className="font-display text-xl text-text-warm mb-2">{t('home.reg_ok_t')}</h3>
                <p className="text-sm text-text-sand">{t('home.reg_ok_d')}</p>
              </div>
            ) : (
              <form onSubmit={handleReg} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input type="text" required placeholder={t('home.reg_name')} value={regForm.nombre} onChange={(e) => setRegForm({ ...regForm, nombre: e.target.value })} className="w-full bg-surface border border-gold-subtle rounded-lg px-4 py-3 text-sm text-text-warm placeholder:text-text-muted focus:border-volcanic-gold focus:outline-none transition-colors" />
                  <input type="text" required placeholder={t('home.reg_co')} value={regForm.empresa} onChange={(e) => setRegForm({ ...regForm, empresa: e.target.value })} className="w-full bg-surface border border-gold-subtle rounded-lg px-4 py-3 text-sm text-text-warm placeholder:text-text-muted focus:border-volcanic-gold focus:outline-none transition-colors" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input type="email" required placeholder={t('home.reg_email')} value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} className="w-full bg-surface border border-gold-subtle rounded-lg px-4 py-3 text-sm text-text-warm placeholder:text-text-muted focus:border-volcanic-gold focus:outline-none transition-colors" />
                  <input type="text" required placeholder={t('home.reg_country')} value={regForm.pais} onChange={(e) => setRegForm({ ...regForm, pais: e.target.value })} className="w-full bg-surface border border-gold-subtle rounded-lg px-4 py-3 text-sm text-text-warm placeholder:text-text-muted focus:border-volcanic-gold focus:outline-none transition-colors" />
                </div>
                <button type="submit" className="w-full py-4 bg-volcanic-gold text-void font-medium rounded-xl hover:bg-volcanic-gold/90 hover:shadow-gold transition-all flex items-center justify-center gap-2">
                  {t('home.reg_btn')}<ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-surface border-t border-gold-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Hexagon className="w-6 h-6 text-volcanic-gold" strokeWidth={1.5} />
              <span className="font-display text-lg text-text-warm">Organicode</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-text-sand">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{t('footer.loc')}</span>
              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" />{t('footer.prices')}</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{t('footer.export')}</span>
            </div>
            <p className="text-xs text-text-muted">{t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
