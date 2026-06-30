import { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { postOferta } from '@/hooks/useApi';

export function OfferModal() {
  const { offerModalOpen, selectedLote, closeOfferModal, addToast } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    precio: '',
    incoterm: 'FOB' as 'EXW' | 'FOB' | 'CIF',
    volumen: '',
    empresa: '',
    pais: '',
    email: '',
  });

  if (!offerModalOpen || !selectedLote) return null;

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
      });

      if (!res.ok) {
        if (res.error === 'oferta_bajo_minimo' && res.data) {
          setErrorMsg(
            `⚠️ Oferta por debajo del mínimo. El precio FOB mínimo aceptable es $${res.data.precio_min_aceptable} USD/kg.`
          );
        } else {
          setErrorMsg(res.error || 'Error al enviar la oferta. Intenta de nuevo.');
        }
        return;
      }

      setSubmitted(true);
      addToast({
        type: 'oferta',
        title: 'Oferta enviada',
        message: `Tu oferta por ${selectedLote.nombre} fue registrada. ID: #${res.data?.oferta_id}`,
      });
      setTimeout(() => handleClose(), 3000);

    } catch (_err) {
      setErrorMsg('Error de conexión. Verifica tu red e intenta de nuevo.');
      addToast({
        type: 'error' as any,
        title: 'Error de conexión',
        message: 'No pudimos enviar tu oferta. Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-surface border border-gold-subtle rounded-xl shadow-float overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold-subtle">
          <div>
            <h3 className="font-display text-lg text-text-warm">Hacer Oferta Formal</h3>
            <p className="text-xs text-text-sand mt-0.5">{selectedLote.nombre} · {selectedLote.variedad}</p>
          </div>
          <button onClick={handleClose} className="text-text-muted hover:text-text-warm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-huila-green mx-auto mb-3" />
            <h4 className="font-display text-xl text-text-warm mb-2">¡Oferta registrada!</h4>
            <p className="text-sm text-text-sand">Nuestro equipo la revisará y te contactará en menos de 24 horas.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-warm-rust/10 border border-warm-rust/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-warm-rust shrink-0 mt-0.5" />
                <p className="text-xs text-warm-rust">{errorMsg}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-sand mb-1.5">Precio ofrecido (USD/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm font-mono-data focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder="30.00"
                />
              </div>
              <div>
                <label className="block text-xs text-text-sand mb-1.5">Incoterm</label>
                <select
                  value={formData.incoterm}
                  onChange={(e) => setFormData({ ...formData, incoterm: e.target.value as 'EXW' | 'FOB' | 'CIF' })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                >
                  <option value="EXW">EXW</option>
                  <option value="FOB">FOB</option>
                  <option value="CIF">CIF</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-sand mb-1.5">Volumen (sacos de 70kg)</label>
              <input
                type="number"
                required
                value={formData.volumen}
                onChange={(e) => setFormData({ ...formData, volumen: e.target.value })}
                className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm font-mono-data focus:border-volcanic-gold focus:outline-none transition-colors"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-xs text-text-sand mb-1.5">Empresa</label>
              <input
                type="text"
                required
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                placeholder="Nombre de tu empresa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-sand mb-1.5">País destino</label>
                <input
                  type="text"
                  required
                  value={formData.pais}
                  onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder="Alemania"
                />
              </div>
              <div>
                <label className="block text-xs text-text-sand mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder="buyer@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-volcanic-gold hover:bg-volcanic-gold/90 disabled:opacity-60 disabled:cursor-not-allowed text-void font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-gold"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Enviando oferta...</>
              ) : (
                <><Send className="w-4 h-4" />Enviar Oferta</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
