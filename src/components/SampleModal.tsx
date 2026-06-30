import { useState } from 'react';
import { X, ExternalLink, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { postOferta } from '@/hooks/useApi';

export function SampleModal() {
  const { sampleModalOpen, selectedLote, closeSampleModal, addToast } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    empresa: '',
    email: '',
    ciudad: '',
    pais: '',
  });

  if (!sampleModalOpen || !selectedLote) return null;

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
      });

      if (!res.ok) {
        setErrorMsg(res.error || 'Error al registrar tu solicitud. Intenta de nuevo.');
        return;
      }

      setSubmitted(true);
      addToast({
        type: 'muestra' as any,
        title: 'Muestra solicitada',
        message: `Tu solicitud para ${selectedLote.nombre} fue registrada. Recibirás la guía en 3 días hábiles.`,
      });
      setTimeout(() => handleClose(), 3500);

    } catch (_err) {
      setErrorMsg('Error de conexión. Verifica tu red e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const waMessage = encodeURIComponent(
    `Hola Organicode, me interesa el lote ${selectedLote.nombre} #${selectedLote.id}. Quisiera solicitar una muestra de 200g para evaluación.`
  );
  const waLink = `https://wa.me/573001234567?text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm bg-surface border border-gold-subtle rounded-xl shadow-float overflow-hidden">

        <div className="flex items-center justify-between p-5 border-b border-gold-subtle">
          <h3 className="font-display text-lg text-text-warm">Solicitar Muestra</h3>
          <button onClick={handleClose} className="text-text-muted hover:text-text-warm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-huila-green mx-auto mb-3" />
            <h4 className="font-display text-xl text-text-warm mb-2">¡Muestra registrada!</h4>
            <p className="text-sm text-text-sand">Recibirás el número de guía de envío en los próximos <strong className="text-text-warm">3 días hábiles</strong>.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">

            {/* Lote preview */}
            <div className="flex items-center gap-3 p-3 bg-void rounded-lg">
              <img
                src={selectedLote.foto_url}
                alt={selectedLote.nombre}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-medium text-text-warm">{selectedLote.nombre}</p>
                <p className="text-xs text-text-sand">{selectedLote.variedad} · {selectedLote.proceso} · 200g gratis</p>
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
                <label className="block text-xs text-text-sand mb-1.5">Empresa / Tostadora</label>
                <input
                  type="text"
                  required
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder="Tu empresa o nombre"
                />
              </div>
              <div>
                <label className="block text-xs text-text-sand mb-1.5">Email de contacto</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                  placeholder="buyer@company.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-sand mb-1.5">Ciudad destino</label>
                  <input
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                    placeholder="Berlín"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-sand mb-1.5">País</label>
                  <input
                    type="text"
                    required
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    className="w-full bg-void border border-gold-subtle rounded-lg px-3 py-2.5 text-sm text-text-warm focus:border-volcanic-gold focus:outline-none transition-colors"
                    placeholder="Alemania"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-volcanic-gold hover:bg-volcanic-gold/90 disabled:opacity-60 disabled:cursor-not-allowed text-void font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-gold"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Registrando solicitud...</>
                ) : (
                  <><Send className="w-4 h-4" />Solicitar Muestra Gratis</>
                )}
              </button>
            </form>

            {/* WA como canal alternativo */}
            <div className="border-t border-gold-subtle/40 pt-3">
              <p className="text-[10px] text-text-muted text-center mb-2">¿Prefieres continuar por WhatsApp?</p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-transparent border border-[#25D366]/40 hover:border-[#25D366] text-[#25D366] text-xs font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Continuar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
