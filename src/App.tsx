import { Routes, Route } from 'react-router-dom';
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
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lote/:slug" element={<LotePage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:tab" element={<AdminPage />} />
        <Route path="/productor/:id" element={<ProducerPage />} />
      </Routes>
      <ToastContainer />
      <OfferModal />
      <SampleModal />
    </>
  );
}
