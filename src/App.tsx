import { Routes, Route } from 'react-router-dom';
import { LangProvider } from '@/context/LangContext';
import { MarketTicker } from '@/components/MarketTicker';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/Toast';
import { OfferModal } from '@/components/OfferModal';
import { SampleModal } from '@/components/SampleModal';
import Home from '@/pages/Home';
import { LotePage } from '@/pages/LotePage';
import { CatalogoPage } from '@/pages/CatalogoPage';
import { AdminPage } from '@/pages/AdminPage';
import { ProducerPage } from '@/pages/ProducerPage';

export default function App() {
  return (
    <LangProvider>
      {/* Ticker Bloomberg — siempre arriba de todo, fixed */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <MarketTicker />
      </div>
      {/* Navbar desplazada 32px (h-8) para no tapar el ticker */}
      <Navbar />
      {/* Contenido empuja 32px extra para el ticker + 64px navbar */}
      <div className="pt-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lote/:slug" element={<LotePage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/:tab" element={<AdminPage />} />
          <Route path="/productor/:id" element={<ProducerPage />} />
        </Routes>
      </div>
      <ToastContainer />
      <OfferModal />
      <SampleModal />
    </LangProvider>
  );
}
