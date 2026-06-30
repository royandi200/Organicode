import { useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_BASE_URL || '';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'organicode-admin-2026';

function adminUrl(path: string) {
  return `${BASE}${path}?token=${ADMIN_TOKEN}`;
}

function adminPostHeaders() {
  return { 'Content-Type': 'application/json' };
}

// ─── PÚBLICO ───────────────────────────────────────────────────────────────

export function useLotes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`${BASE}/api/lotes`)
      .then(r => r.json())
      .then(j => { if (j.ok) setData(j.data); else setError(j.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return { data, loading, error };
}

export function useLote(slug: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!slug) return;
    fetch(`${BASE}/api/lotes/${slug}`)
      .then(r => r.json())
      .then(j => { if (j.ok) setData(j.data); else setError(j.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);
  return { data, loading, error };
}

export function usePrecioActual() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${BASE}/api/precios/actual`)
      .then(r => r.json())
      .then(j => { if (j.ok) setData(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

export function useProductor(id: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    fetch(`${BASE}/api/productor/${id}`)
      .then(r => r.json())
      .then(j => { if (j.ok) setData(j.data); else setError(j.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);
  return { data, loading, error };
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────

function makeAdminHook(path: string) {
  return function useAdminResource() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kpis, setKpis] = useState<any>(null);
    const refetch = () => {
      setLoading(true);
      fetch(adminUrl(path))
        .then(r => r.json())
        .then(j => {
          if (j.ok) { setData(j.data); if (j.kpis) setKpis(j.kpis); }
          else setError(j.error);
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    };
    useEffect(() => { refetch(); }, []);
    return { data, loading, error, kpis, refetch };
  };
}

export const useAdminLotes       = makeAdminHook('/api/admin/lotes');
export const useAdminOfertas     = makeAdminHook('/api/admin/ofertas');
export const useAdminCompradores = makeAdminHook('/api/admin/compradores');
export const useAdminMuestras    = makeAdminHook('/api/admin/muestras');

// ─── MUTATIONS ─────────────────────────────────────────────────────────────

export async function postOferta(payload: object) {
  const r = await fetch(`${BASE}/api/webhook-buyer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function postComprador(payload: object) {
  const r = await fetch(`${BASE}/api/compradores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function patchOferta(
  id: number,
  estado: 'aceptada' | 'rechazada' | 'negociando',
  motivo?: string
) {
  const r = await fetch(adminUrl(`/api/admin/ofertas/${id}`), {
    method: 'POST',
    headers: adminPostHeaders(),
    body: JSON.stringify({ estado, motivo_rechazo: motivo || null }),
  });
  return r.json();
}

export async function patchMuestra(
  id: number,
  estado: 'pendiente' | 'preparando' | 'enviada' | 'entregada',
  guia?: string,
  courier?: string
) {
  const r = await fetch(adminUrl('/api/admin/muestras'), {
    method: 'POST',
    headers: adminPostHeaders(),
    body: JSON.stringify({ id, estado, numero_guia: guia, courier }),
  });
  return r.json();
}
