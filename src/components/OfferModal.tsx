import { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { postOferta } from '@/hooks/useApi';

type Lang = 'es' | 'en' | 'de' | 'ko';

const T = {
  es: {
    title: 'Hacer Oferta Formal',
    langLabel: 'Idioma / Language',
    price: 'Precio ofrecido (USD/kg)',
    incoterm: 'Incoterm',
    volume: 'Volumen (sacos de 70 kg)',
    company: 'Empresa',
    country: 'País destino',
    email: 'Email',
    countryPh: 'Alemania',
    companyPh: 'Nombre de tu empresa',
    submit: 'Enviar Oferta',
    submitting: 'Enviando oferta…',
    successTitle: '¡Oferta registrada!',
    successBody: 'Nuestro equipo la revisará y te contactará en menos de 24 horas.',
    wa: (lote: string, precio: string, inc: string, vol: string, pais: string, empresa: string) =>
      `Hola Organicode 🌿 Soy comprador y quiero hacer una oferta formal por el lote *${lote}*.

💰 Precio: $${precio} USD/kg ${inc}
📦 Volumen: ${vol} sacos
🏢 Empresa: ${empresa}
🌍 Destino: ${pais}

¿Podemos avanzar?`,
  },
  en: {
    title: 'Make a Formal Offer',
    langLabel: 'Language / Idioma',
    price: 'Offered price (USD/kg)',
    incoterm: 'Incoterm',
    volume: 'Volume (70 kg bags)',
    company: 'Company',
    country: 'Destination country',
    email: 'Email',
    countryPh: 'Germany',
    companyPh: 'Your company name',
    submit: 'Send Offer',
    submitting: 'Sending offer…',
    successTitle: 'Offer received!',
    successBody: 'Our team will review it and contact you within 24 hours.',
    wa: (lote: string, precio: string, inc: string, vol: string, pais: string, empresa: string) =>
      `Hello Organicode ☕ I'm a buyer and I'd like to make a formal offer on lot *${lote}*.

💰 Price: $${precio} USD/kg ${inc}
📦 Volume: ${vol} bags
🏢 Company: ${empresa}
🌍 Destination: ${pais}

Can we move forward?`,
  },
  de: {
    title: 'Formelles Angebot abgeben',
    langLabel: 'Sprache / Language',
    price: 'Angebotspreis (USD/kg)',
    incoterm: 'Incoterm',
    volume: 'Menge (70-kg-Säcke)',
    company: 'Unternehmen',
    country: 'Zielland',
    email: 'E-Mail',
    countryPh: 'Deutschland',
    companyPh: 'Ihr Unternehmen',
    submit: 'Angebot senden',
    submitting: 'Wird gesendet…',
    successTitle: 'Angebot eingegangen!',
    successBody: 'Unser Team prüft es und meldet sich innerhalb von 24 Stunden.',
    wa: (lote: string, precio: string, inc: string, vol: string, pais: string, empresa: string) =>
      `Hallo Organicode 🌿 Ich bin Käufer und möchte ein formelles Angebot für Lot *${lote}* abgeben.

💰 Preis: $${precio} USD/kg ${inc}
📦 Menge: ${vol} Säcke
🏢 Unternehmen: ${empresa}
🌍 Zielland: ${pais}

Können wir fortfahren?`,
  },
  ko: {
    title: '공식 오퍼 제출',
    langLabel: '언어 / Language',
    price: '제안 가격 (USD/kg)',
    incoterm: '인코텀',
    volume: '수량 (70kg 자루)',
    company: '회사명',
    country: '목적지 국가',
    email: '이메일',
    countryPh: '독일',
    companyPh: '귀사 이름',
    submit: '오퍼 보내기',
    submitting: '전송 중…',
    successTitle: '오퍼가 접수되었습니다!',
    successBody: '24시간 이내에 팀이 검토 후 연락드리겠습니다.',
    wa: (lote: string, precio: string, inc: string, vol: string, pais: string, empresa: string) =>
      `안녕하세요 Organicode ☕ 저는 구매자로서 *${lote}* 로트에 대해 공식 오퍼를 제출하고 싶습니다.

💰 가격: $${precio} USD/kg ${inc}
📦 수량: ${vol} 자루
🏢 회사: ${empresa}
🌍 목적지: ${pais}

진행 가능한가요?`,
  },
} as const;

export function OfferModal() {
  const { offerModalOpen, selectedLote, closeOfferModal, addToast } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [formData, setFormData] = useState({
    precio: '',
    incoterm: 'FOB' as 'EXW' | 'FOB' | 'CIF',
    volumen: '',
    empresa: '',
    pais: '',
    email: '',
  });

  if (!offerModalOpen || !selectedLote) return null;

  const t = T[lang];

  const handleClose = () => {
    setSubmitted(false);
    setErrorMsg(null);
    setFormData({ precio: '', incoterm: 'FOB', volumen: '', empresa: '', pais: '', email: '' });
    closeOfferModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await postOferta({
        tipo: 'HACER_OFERTA',
        lote_id: selectedLote.id,
        lote_slug: selectedLote.slug,
        precio_oferta: parseFloat(formData.precio),
        incoterm: formData.incoterm,
        volumen_sacos: parseInt(formData.volumen) || null,
        empresa: formData.empresa,
        email_contacto: formData.email,
        pais_destino: formData.pais,
        idioma: lang,
      });

      if (!res.ok) {
        if (res.error === 'oferta_bajo_minimo' && res.data) {
          setErrorMsg(
            lang === 'es' ? `⚠️ Oferta por debajo del mínimo. Precio FOB mínimo: $${res.data.precio_min_aceptable} USD/kg.`
            : lang === 'en' ? `⚠️ Offer below minimum. Min FOB price: $${res.data.precio_min_aceptable} USD/kg.`
            : lang === 'de' ? `⚠️ Angebot unter Mindestpreis. Mindest-FOB: $${res.data.precio_min_aceptable} USD/kg.`
            : `⚠️ 최소 가격 미달. 최소 FOB 가격: $${res.data.precio_min_aceptable} USD/kg.`
          );
        } else {
          setErrorMsg(res.error || 'Error');
        }
        return;
      }

      setSubmitted(true);
      addToast({
        type: 'oferta',
        title: t.successTitle,
        message: `${selectedLote.nombre} · ID #${res.data?.oferta_id}`,
      });
      setTimeout(() => handleClose(), 3000);

    } catch (_err) {
      setErrorMsg('Error de conexión. Verifica tu red e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const waText = t.wa(
    selectedLote.nombre,
    formData.precio || '?',
    formData.incoterm,
    formData.volumen || '?',
    formData.pais || '?',
    formData.empresa || '?'
  );
  const waLink = `https://wa.me/573232421944?text=${encodeURIComponent(waText)}`;

  const LANG_FLAGS: Record<Lang, string> = { es: '🇨🇴 ES', en: '🇺🇸 EN', de: '🇩🇪 DE', ko: '🇰🇷 KO' };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-surface border border-gold-subtle rounded-xl shadow-float overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold-subtle">
          <div>
            <h3 className="font-display text-lg text-text-warm">{t.title}</h3>
            <p className="text-xs text-text-sand mt-0.5">{selectedLote.nombre} · {selectedLote.variedad}</p>
          </div>
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
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {/* Selector de idioma */}
            <div>
              <label className="block text-xs text-text-sand mb-1.5">{t.langLabel}</label>
              <div className="flex gap-2">
                {(['es','en','de','ko'] as Lang[]).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      lang === l
                        ? 'bg-volcanic-gold text-void border-volcanic-gold'
                        : 'bg-void text-text-muted border-gold-subtle hover:border-volcanic-gold/50'
                    }`}
                  >
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-sand mb-1.5">{t.price}</label>
                <input type="number" step="0.01" required value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm font-mono-data focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder="30.00" />
              </div>
              <div>
                <label className="block text-xs text-text-sand mb-1.5">{t.incoterm}</label>
                <select value={formData.incoterm}
                  onChange={(e) => setFormData({ ...formData, incoterm: e.target.value as 'EXW' | 'FOB' | 'CIF' })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors">
                  <option value="EXW">EXW</option>
                  <option value="FOB">FOB</option>
                  <option value="CIF">CIF</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-sand mb-1.5">{t.volume}</label>
              <input type="number" required value={formData.volumen}
                onChange={(e) => setFormData({ ...formData, volumen: e.target.value })}
                className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm font-mono-data focus:border-volcanic-gold focus:outline-none transition-colors"
                placeholder="10" />
            </div>

            <div>
              <label className="block text-xs text-text-sand mb-1.5">{t.company}</label>
              <input type="text" required value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                placeholder={t.companyPh} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-sand mb-1.5">{t.country}</label>
                <input type="text" required value={formData.pais}
                  onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder={t.countryPh} />
              </div>
              <div>
                <label className="block text-xs text-text-sand mb-1.5">{t.email}</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder="buyer@company.com" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-volcanic-gold hover:bg-volcanic-gold/90 disabled:opacity-60 disabled:cursor-not-allowed text-void font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-gold">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />{t.submitting}</>
                : <><Send className="w-4 h-4" />{t.submit}</>}
            </button>

            {/* WA alternativo con mensaje pre-cargado en idioma */}
            <div className="border-t border-gold-subtle/40 pt-3">
              <p className="text-[10px] text-text-muted text-center mb-2">
                {lang === 'es' ? '¿Prefieres WhatsApp?'
                : lang === 'en' ? 'Prefer WhatsApp?'
                : lang === 'de' ? 'Lieber WhatsApp?'
                : 'WhatsApp으로 계속하시겠습니까?'}
              </p>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="w-full bg-transparent border border-[#25D366]/40 hover:border-[#25D366] text-[#25D366] text-xs font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
