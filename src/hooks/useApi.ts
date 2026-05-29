import { useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_BASE_URL || '';

export function useLotes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/lotes`)
      .then(r => r.json())
      .then(json => {
        if (json.ok) setData(json.data);
        else setError(json.error);
      })
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
      .then(json => {
        if (json.ok) setData(json.data);
        else setError(json.error);
      })
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
      .then(json => { if (json.ok) setData(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export async function postOferta(payload: object) {
  const r = await fetch(`${BASE}/api/webhook-buyer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return r.json();
}

export async function postComprador(payload: object) {
  const r = await fetch(`${BASE}/api/compradores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return r.json();
}
