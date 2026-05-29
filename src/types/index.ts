export interface Caficultor {
  id: number;
  nombre: string;
  finca: string;
  vereda: string;
  municipio: string;
  desde: number;
  foto: string;
  valores: string[];
  bio: string;
}

export interface TimelineEvent {
  fecha: string;
  evento: string;
  detalle: string;
  hash: string | null;
}

export interface Lote {
  id: number;
  slug: string;
  nombre: string;
  variedad: string;
  proceso: string;
  municipio: string;
  departamento: string;
  altitud_msnm: number;
  sca_score: number;
  cantidad_kg: number;
  humedad: number;
  rendimiento: number;
  notas_sensoriales: string;
  precio_calculado: number;
  hash_registro: string | null;
  estado: 'borrador' | 'publicado' | 'ofertado' | 'vendido' | 'archivado';
  foto_url: string;
  caficultor: Caficultor;
  storytelling_ia: string;
  timeline: TimelineEvent[];
  coordenadas: { lat: number; lng: number };
  suelo: string;
  brillo_solar: string;
  precipitacion: string;
  microclima: string;
  cosecha: string;
  sugerencia_ia: string;
}

export interface Oferta {
  id: number;
  lote_id: number;
  empresa: string;
  pais: string;
  email: string;
  precio_ofrecido: number;
  incoterm: 'EXW' | 'FOB' | 'CIF';
  volumen_sacos: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fecha: string;
  lote?: Lote;
}

export interface PrecioActual {
  precio_ice: number;
  trm: number;
  d_colombia: number;
  d_huila: number;
  d_trace: number;
  updated_at: string;
  trend: 'up' | 'down';
}

export interface Comprador {
  id: number;
  nombre: string;
  empresa: string;
  email: string;
  pais: string;
  registrado_en: string;
}

export interface Toast {
  id: string;
  type: 'oferta' | 'precio' | 'sistema';
  title: string;
  message: string;
  timestamp: number;
}
