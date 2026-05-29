import { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store';

export function OfferModal() {
  const { offerModalOpen, selectedLote, closeOfferModal, addToast } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    precio: '',
    incoterm: 'FOB' as 'EXW' | 'FOB' | 'CIF',
    volumen: '',
    empresa: '',
    pais: '',
    email: '',
  });

  if (!offerModalOpen || !selectedLote) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast({
      type: 'oferta',
      title: 'Oferta enviada',
      message: `Tu oferta por ${selectedLote.nombre} ha sido registrada. Te contactaremos en 24h.`,
    });
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ precio: '', incoterm: 'FOB', volumen: '', empresa: '', pais: '', email: '' });
      closeOfferModal();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={closeOfferModal} />
      <div className="relative w-full max-w-md bg-surface border border-gold-subtle rounded-xl shadow-float overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold-subtle">
          <div>
            <h3 className="font-display text-lg text-text-warm">Hacer Oferta Formal</h3>
            <p className="text-xs text-text-sand mt-0.5">{selectedLote.nombre} · {selectedLote.variedad}</p>
          </div>
          <button onClick={closeOfferModal} className="text-text-muted hover:text-text-warm transition-colors">
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
              className="w-full bg-volcanic-gold hover:bg-volcanic-gold/90 text-void font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-gold"
            >
              <Send className="w-4 h-4" />
              Enviar Oferta
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
