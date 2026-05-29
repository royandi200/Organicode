import { create } from 'zustand';
import type { Lote, Toast, PrecioActual } from '@/types';
import { precioActual as precioMock } from '@/data/mock';

interface AppState {
  // Price state
  precioActual: PrecioActual;
  setPrecioActual: (p: PrecioActual) => void;
  
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  
  // Navigation
  scrolled: boolean;
  setScrolled: (s: boolean) => void;
  
  // Offer modal
  offerModalOpen: boolean;
  selectedLote: Lote | null;
  openOfferModal: (lote: Lote) => void;
  closeOfferModal: () => void;
  
  // Sample request modal
  sampleModalOpen: boolean;
  openSampleModal: (lote: Lote) => void;
  closeSampleModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Price
  precioActual: precioMock,
  setPrecioActual: (p) => set({ precioActual: p }),
  
  // Toasts
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [
      ...state.toasts.slice(-2),
      { ...toast, id: Math.random().toString(36).substring(7), timestamp: Date.now() }
    ]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
  
  // Navigation
  scrolled: false,
  setScrolled: (s) => set({ scrolled: s }),
  
  // Offer modal
  offerModalOpen: false,
  selectedLote: null,
  openOfferModal: (lote) => set({ offerModalOpen: true, selectedLote: lote }),
  closeOfferModal: () => set({ offerModalOpen: false, selectedLote: null }),
  
  // Sample modal
  sampleModalOpen: false,
  openSampleModal: (lote) => set({ sampleModalOpen: true, selectedLote: lote }),
  closeSampleModal: () => set({ sampleModalOpen: false, selectedLote: null }),
}));
