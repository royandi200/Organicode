import { X, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store';

export function SampleModal() {
  const { sampleModalOpen, selectedLote, closeSampleModal } = useAppStore();

  if (!sampleModalOpen || !selectedLote) return null;

  const waMessage = encodeURIComponent(
    `Hola Organicode, me interesa el lote ${selectedLote.nombre} #${selectedLote.id}. Quisiera solicitar una muestra de 200g para evaluación.`
  );
  const waLink = `https://wa.me/573001234567?text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={closeSampleModal} />
      <div className="relative w-full max-w-sm bg-surface border border-gold-subtle rounded-xl shadow-float overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gold-subtle">
          <h3 className="font-display text-lg text-text-warm">Solicitar Muestra</h3>
          <button onClick={closeSampleModal} className="text-text-muted hover:text-text-warm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-void rounded-lg">
            <img
              src={selectedLote.foto_url}
              alt={selectedLote.nombre}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm font-medium text-text-warm">{selectedLote.nombre}</p>
              <p className="text-xs text-text-sand">{selectedLote.variedad} · {selectedLote.proceso}</p>
            </div>
          </div>

          <p className="text-sm text-text-sand">
            Te enviaremos una muestra de <strong className="text-text-warm">200g</strong> vía courier internacional. 
            El tiempo estimado de entrega es de <strong className="text-text-warm">5-7 días hábiles</strong>.
          </p>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeSampleModal}
            className="w-full bg-[#25D366] hover:bg-[#1ea855] text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Continuar por WhatsApp
          </a>

          <p className="text-[10px] text-text-muted text-center">
            Serás redirigido a WhatsApp para completar tu solicitud
          </p>
        </div>
      </div>
    </div>
  );
}
