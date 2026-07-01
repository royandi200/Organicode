import { useState } from 'react';
import { X, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { postOferta } from '@/hooks/useApi';

type Lang = 'es' | 'en' | 'de' | 'ko';

const T = {
  es: {
    title: 'Solicitar Muestra',
    langLabel: 'Idioma / Language',
    company: 'Empresa / Tostadora',
    email: 'Email de contacto',
    city: 'Ciudad destino',
    country: 'País',
    cityPh: 'Madrid',
    countryPh: 'España',
    companyPh: 'Tu empresa o nombre',
    submit: 'Solicitar Muestra Gratis',
    submitting: 'Registrando solicitud…',
    successTitle: '¡Muestra registrada!',
    successBody: 'Recibirás el número de guía en los próximos 3 días hábiles.',
    waAlt: '¿Prefieres WhatsApp?',
    wa: (lote: string, empresa: string, ciudad: string, pais: string) =>
      `Hola Organicode 🌿 Soy comprador y quiero solicitar una muestra de 200g del lote *${lote}*.

🏢 Empresa: ${empresa}
📍 Ciudad: ${ciudad}, ${pais}

¿Pueden enviarme la muestra?`,
  },
  en: {
    title: 'Request a Sample',
    langLabel: 'Language / Idioma',
    company: 'Company / Roastery',
    email: 'Contact email',
    city: 'Destination city',
    country: 'Country',
    cityPh: 'Berlin',
    countryPh: 'Germany',
    companyPh: 'Your company or name',
    submit: 'Request Free Sample',
    submitting: 'Registering request…',
    successTitle: 'Sample requested!',
    successBody: 'You will receive the tracking number within 3 business days.',
    waAlt: 'Prefer WhatsApp?',
    wa: (lote: string, empresa: string, ciudad: string, pais: string) =>
      `Hello Organicode ☕ I'm a buyer and I'd like to request a 200g sample of lot *${lote}*.

🏢 Company: ${empresa}
📍 City: ${ciudad}, ${pais}

Could you send me the sample?`,
  },
  de: {
    title: 'Muster anfordern',
    langLabel: 'Sprache / Language',
    company: 'Unternehmen / Rösterei',
    email: 'Kontakt-E-Mail',
    city: 'Zielstadt',
    country: 'Land',
    cityPh: 'Hamburg',
    countryPh: 'Deutschland',
    companyPh: 'Ihr Unternehmen',
    submit: 'Kostenloses Muster anfordern',
    submitting: 'Anfrage wird registriert…',
    successTitle: 'Muster angefordert!',
    successBody: 'Die Tracking-Nummer erhalten Sie innerhalb von 3 Werktagen.',
    waAlt: 'Lieber WhatsApp?',
    wa: (lote: string, empresa: string, ciudad: string, pais: string) =>
      `Hallo Organicode 🌿 Ich bin Käufer und möchte ein 200g-Muster von Lot *${lote}* anfordern.

🏢 Unternehmen: ${empresa}
📍 Stadt: ${ciudad}, ${pais}

Könnten Sie mir das Muster zusenden?`,
  },
  ko: {
    title: '샘플 요청',
    langLabel: '언어 / Language',
    company: '회사 / 로스터리',
    email: '연락처 이메일',
    city: '목적지 도시',
    country: '국가',
    cityPh: '서울',
    countryPh: '대한민국',
    companyPh: '귀사 이름',
    submit: '무료 샘플 요청하기',
    submitting: '요청 등록 중…',
    successTitle: '샘플이 접수되었습니다!',
    successBody: '3 영업일 이내에 추적 번호를 받으실 수 있습니다.',
    waAlt: 'WhatsApp으로 계속하시겠습니까?',
    wa: (lote: string, empresa: string, ciudad: string, pais: string) =>
      `안녕하세요 Organicode ☕ 저는 구매자로서 *${lote}* 로트의 200g 샘플을 요청하고 싶습니다.

🏢 회사: ${empresa}
📍 도시: ${ciudad}, ${pais}

샘플을 보내주실 수 있나요?`,
  },
} as const;

export function SampleModal() {
  const { sampleModalOpen, selectedLote, closeSampleModal, addToast } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [formData, setFormData] = useState({
    empresa: '',
    email: '',
    ciudad: '',
    pais: '',
  });

  if (!sampleModalOpen || !selectedLote) return null;

  const t = T[lang];

  const handleClose = () => {
    setSubmitted(false);
    setErrorMsg(null);
    setFormData({ empresa: '', email: '', ciudad: '', pais: '' });
    closeSampleModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await postOferta({
        tipo: 'SOLICITAR_MUESTRA',
        lote_id: selectedLote.id,
        lote_slug: selectedLote.slug,
        empresa: formData.empresa,
        email_contacto: formData.email,
        ciudad_destino: formData.ciudad,
        pais_destino: formData.pais,
        idioma: lang,
      });

      if (!res.ok) {
        setErrorMsg(res.error || 'Error al registrar tu solicitud.');
        return;
      }

      setSubmitted(true);
      addToast({
        type: 'muestra' as any,
        title: t.successTitle,
        message: `${selectedLote.nombre} · ${t.successBody}`,
      });
      setTimeout(() => handleClose(), 3500);

    } catch (_err) {
      setErrorMsg('Error de conexión. Verifica tu red e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const waText = t.wa(
    selectedLote.nombre,
    formData.empresa || '?',
    formData.ciudad || '?',
    formData.pais || '?'
  );
  const waLink = `https://wa.me/573232421944?text=${encodeURIComponent(waText)}`;

  const LANG_FLAGS: Record<Lang, string> = { es: '🇨🇴 ES', en: '🇺🇸 EN', de: '🇩🇪 DE', ko: '🇰🇷 KO' };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm bg-surface border border-gold-subtle rounded-xl shadow-float overflow-hidden">

        <div className="flex items-center justify-between p-5 border-b border-gold-subtle">
          <h3 className="font-display text-lg text-text-warm">{t.title}</h3>
          <button onClick={handleClose} className="text-text-muted hover:text-text-warm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-huila-green mx-auto mb-3" />
            <h4 className="font-display text-xl text-text-warm mb-2">{t.successTitle}</h4>
            <p className="text-sm text-text-sand">{t.successBody}</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">

            {/* Lote preview */}
            <div className="flex items-center gap-3 p-3 bg-void rounded-lg">
              <img src={selectedLote.foto_url} alt={selectedLote.nombre}
                className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-medium text-text-warm">{selectedLote.nombre}</p>
                <p className="text-xs text-text-sand">{selectedLote.variedad} · {selectedLote.proceso} · 200g</p>
              </div>
            </div>

            {/* Selector de idioma */}
            <div>
              <label className="block text-xs text-text-sand mb-1.5">{t.langLabel}</label>
              <div className="flex gap-2">
                {(['es','en','de','ko'] as Lang[]).map(l => (
                  <button key={l} type="button" onClick={() => setLang(l)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      lang === l
                        ? 'bg-volcanic-gold text-void border-volcanic-gold'
                        : 'bg-void text-text-muted border-gold-subtle hover:border-volcanic-gold/50'
                    }`}>
                    {LANG_FLAGS[l]}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-warm-rust/10 border border-warm-rust/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-warm-rust shrink-0 mt-0.5" />
                <p className="text-xs text-warm-rust">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-text-sand mb-1.5">{t.company}</label>
                <input type="text" required value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder={t.companyPh} />
              </div>
              <div>
                <label className="block text-xs text-text-sand mb-1.5">{t.email}</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder="buyer@company.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-sand mb-1.5">{t.city}</label>
                  <input type="text" required value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                    placeholder={t.cityPh} />
                </div>
                <div>
                  <label className="block text-xs text-text-sand mb-1.5">{t.country}</label>
                  <input type="text" required value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                    placeholder={t.countryPh} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-volcanic-gold hover:bg-volcanic-gold/90 disabled:opacity-60 disabled:cursor-not-allowed text-void font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-gold">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{t.submitting}</>
                  : <><Send className="w-4 h-4" />{t.submit}</>}
              </button>
            </form>

            {/* WA con mensaje en idioma seleccionado */}
            <div className="border-t border-gold-subtle/40 pt-3">
              <p className="text-[10px] text-text-muted text-center mb-2">{t.waAlt}</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="w-full bg-transparent border border-[#25D366]/40 hover:border-[#25D366] text-[#25D366] text-xs font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
