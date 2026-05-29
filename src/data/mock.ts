import type { Lote, Oferta, PrecioActual, Comprador } from '@/types';

export const lotes: Lote[] = [
  {
    id: 4521,
    slug: "reserva-volcanica-geisha-2026-03",
    nombre: "Reserva Volcánica",
    variedad: "Geisha",
    proceso: "Natural",
    municipio: "Pitalito",
    departamento: "Huila",
    altitud_msnm: 1850,
    sca_score: 89.25,
    cantidad_kg: 840,
    humedad: 11.2,
    rendimiento: 88,
    notas_sensoriales: "Rosas, Limoncillo, Té blanco, Durazno",
    precio_calculado: 30.17,
    hash_registro: "0x3f4a7c9b2e1d5f8a3c6b9e2f4a7d1c8b5e3f6a9d",
    estado: "publicado",
    foto_url: "/images/farm-aerial.jpg",
    caficultor: {
      id: 1,
      nombre: "Alexander Vásquez",
      finca: "El Encanto",
      vereda: "Los Pinos",
      municipio: "Baraya",
      desde: 1987,
      foto: "/images/producer-portrait.jpg",
      valores: ["organico", "mujeres_caficultoras", "proceso_paz", "apicultura"],
      bio: "Tercera generación de caficultores, Don Alexander ha dedicado su vida a cultivar los mejores cafés de altura en las faldas del Nevado del Huila."
    },
    storytelling_ia: "Este lote nació en las tierras altas del sur del Huila, donde la niebla se cierne cada amanecer sobre plantaciones de Geisha que han estado décadas adaptándose al microclima único de la región. Alexander Vásquez, con manos que conocen cada planta por su nombre, seleccionó manualmente solo los granos en su punto óptimo de maduración. El proceso natural de 21 días en las camas africanas de su finca El Encanto permite que los azúcares naturales del fruto se integren profundamente en el grano, creando un perfil sensorial de complejidad rara vez encontrada fuera de Panamá. Cada taza cuenta la historia de una tierra volcánica generosa y un agricultor que ve el café como arte.",
    timeline: [
      { fecha: "2026-03-12", evento: "COSECHA", detalle: "840 kg de Geisha recolectados a mano", hash: "0x3f4a7c9b2e1d5f8a3c6b9e2f4a7d1c8b5e3f6a9d" },
      { fecha: "2026-03-22", evento: "PROCESAMIENTO", detalle: "Fermentación Natural · 21 días · Casa Elba", hash: "0x7b2c4e8f1a3d6b9c5e2f4a8d1b3c6e9f2a4d7b1c" },
      { fecha: "2026-04-08", evento: "ANÁLISIS SCA", detalle: "89.25 pts · Q-Grader certificado · Lab Organicode", hash: "0x9d4e1f3a7c2b5e8d4a1f6c3b9e2d5a8f1c4b7e3d" },
      { fecha: "2026-05-15", evento: "PUBLICADO", detalle: "Disponible en plataforma · Precio activo", hash: "0x9b2c5d8e1f4a7c3b6e9d2a5f8c1b4e7a3d6f9c2b" }
    ],
    coordenadas: { lat: 1.8539, lng: -76.0513 },
    suelo: "Volcánico-Andosol",
    brillo_solar: "2,200 hrs/año",
    precipitacion: "1,800 mm/año",
    microclima: "Cruce Andes-Amazonía",
    cosecha: "Marzo–Agosto 2026",
    sugerencia_ia: "Para resaltar las notas florales, recomendamos tueste claro a 197°C, desarrollo 20–22%. El perfil de acidez cítrica brillará con métodos de filtrado como V60 o Chemex."
  },
  {
    id: 4522,
    slug: "bourbon-rosado-baraya-2026-04",
    nombre: "Bourbon Rosado",
    variedad: "Bourbon Rosado",
    proceso: "Lavado",
    municipio: "Baraya",
    departamento: "Huila",
    altitud_msnm: 1720,
    sca_score: 86.50,
    cantidad_kg: 1200,
    humedad: 11.8,
    rendimiento: 85,
    notas_sensoriales: "Caramelo, Manzana verde, Avellana, Chocolate",
    precio_calculado: 19.67,
    hash_registro: "0x8e5f2c9d4b1a7e3f6c8d2a5b9e1f4c7a3d6b8e2f",
    estado: "publicado",
    foto_url: "/images/hands-cherries.jpg",
    caficultor: {
      id: 2,
      nombre: "María Elena Torres",
      finca: "La Montaña",
      vereda: "El Carmen",
      municipio: "Baraya",
      desde: 1995,
      foto: "/images/producer-portrait.jpg",
      valores: ["organico", "mujeres_caficultoras"],
      bio: "Pionera en el cultivo orgánico en el Huila, María Elena lidera una cooperativa de 15 mujeres caficultoras."
    },
    storytelling_ia: "En las laderas protegidas de Baraya, donde el sol juega escondite con las nubes, María Elena Torres cultiva su Bourbon Rosado con una dedicación que solo quien ama la tierra puede entender. Este lote es el resultado de una cosecha selectiva donde cada cereza fue examinada como si fuera una joya. El proceso lavado, realizado con agua de manantial, preserva la claridad y limpieza de una taza que sorprende por su dulzura natural y cuerpo sedoso.",
    timeline: [
      { fecha: "2026-04-05", evento: "COSECHA", detalle: "1,200 kg de Bourbon Rosado", hash: "0x8e5f2c9d4b1a7e3f6c8d2a5b9e1f4c7a3d6b8e2f" },
      { fecha: "2026-04-12", evento: "PROCESAMIENTO", detalle: "Lavado tradicional · Fermentación 36h", hash: "0x2a7d4f1c8e5b3a9d6f2c4e8b1a5d7f3c9e2b6a4d" },
      { fecha: "2026-04-28", evento: "ANÁLISIS SCA", detalle: "86.50 pts · Q-Grader", hash: "0x5c3e9f2a7d4b1e8f6c3a9d5b2e7f4c1a8d6b3e9f" },
      { fecha: "2026-05-10", evento: "PUBLICADO", detalle: "Disponible en plataforma", hash: null }
    ],
    coordenadas: { lat: 2.0000, lng: -75.9167 },
    suelo: "Volcánico-Andosol",
    brillo_solar: "2,100 hrs/año",
    precipitacion: "1,750 mm/año",
    microclima: "Valle protegido",
    cosecha: "Marzo–Julio 2026",
    sugerencia_ia: "Este Bourbon Rosado brilla en espresso con tueste medio. Notas de caramelo y avellana se intensifican con extracciones entre 25-30 segundos."
  },
  {
    id: 4523,
    slug: "honey-castillo-palestina-2026-03",
    nombre: "Miel de Palestina",
    variedad: "Castillo",
    proceso: "Honey",
    municipio: "Palestina",
    departamento: "Huila",
    altitud_msnm: 1650,
    sca_score: 84.00,
    cantidad_kg: 2000,
    humedad: 12.0,
    rendimiento: 82,
    notas_sensoriales: "Miel, Nuez, Ciruela, Vainilla",
    precio_calculado: 14.50,
    hash_registro: null,
    estado: "publicado",
    foto_url: "/images/drying-beds.jpg",
    caficultor: {
      id: 3,
      nombre: "Carlos Mario Ríos",
      finca: "San Judas",
      vereda: "El Progreso",
      municipio: "Palestina",
      desde: 2001,
      foto: "/images/producer-portrait.jpg",
      valores: ["apicultura", "proceso_paz"],
      bio: "Carlos combina la apicultura con el cultivo de café, creando un ecosistema único de polinización natural."
    },
    storytelling_ia: "Carlos Mario Ríos no solo cultiva café; cultiva un ecosistema. En su finca San Judas, las abejas y los cafetos viven en simbiosis perfecta. Este proceso Honey, donde parte del mucílago se preserva durante el secado, captura la esencia dulce de un entorno donde la naturaleza dicta el ritmo. El resultado es una taza reconfortante, con un cuerpo medio-alto y una dulzura que evoca la miel fresca de sus propias colmenas.",
    timeline: [
      { fecha: "2026-03-20", evento: "COSECHA", detalle: "2,000 kg de Castillo", hash: null },
      { fecha: "2026-03-28", evento: "PROCESAMIENTO", detalle: "Honey · Secado controlado 18 días", hash: null },
      { fecha: "2026-04-15", evento: "ANÁLISIS SCA", detalle: "84.00 pts", hash: null },
      { fecha: "2026-05-01", evento: "PUBLICADO", detalle: "Disponible en plataforma", hash: null }
    ],
    coordenadas: { lat: 1.7167, lng: -76.1333 },
    suelo: "Franco-arcilloso",
    brillo_solar: "2,000 hrs/año",
    precipitacion: "1,900 mm/año",
    microclima: "Cálido-húmedo",
    cosecha: "Marzo–Junio 2026",
    sugerencia_ia: "Ideal para método French Press o AeroPress. El cuerpo completo del Honey se expresa mejor con molienda gruesa y tiempos de infusión prolongados."
  },
  {
    id: 4524,
    slug: "anaerobico-tabla-2026-02",
    nombre: "Fermento Místico",
    variedad: "Pink Bourbon",
    proceso: "Anaeróbico",
    municipio: "La Plata",
    departamento: "Huila",
    altitud_msnm: 1900,
    sca_score: 90.50,
    cantidad_kg: 360,
    humedad: 10.8,
    rendimiento: 90,
    notas_sensoriales: "Frutas tropicales, Maracuyá, Vino tinto, Cacao",
    precio_calculado: 42.30,
    hash_registro: "0x4d7e1f9c3b8a5d2e6f1c9b4a7d3e8f5c2b6a9d4e",
    estado: "ofertado",
    foto_url: "/images/roasted-beans.jpg",
    caficultor: {
      id: 4,
      nombre: "Luis Fernando Prada",
      finca: "El Mirador",
      vereda: "La Linda",
      municipio: "La Plata",
      desde: 2010,
      foto: "/images/producer-portrait.jpg",
      valores: ["organico"],
      bio: "Joven innovador que ha llevado las técnicas de fermentación anaeróbica al siguiente nivel en el Huila."
    },
    storytelling_ia: "Luis Fernando es un alquimista del café. En su laboratorio natural a 1,900 metros de altitud, experimenta con fermentaciones anaeróbicas controladas que despiestan perfiles de sabor inéditos. Este Pink Bourbon pasó 168 horas en tanques herméticos con mosto de uva local, creando una sinfonia de sabores que desafía todo lo que creías saber sobre el café colombiano. Una taza que evoca un vino natural de Jura con la elegancia de un café de competición.",
    timeline: [
      { fecha: "2026-02-15", evento: "COSECHA", detalle: "360 kg de Pink Bourbon seleccionado", hash: "0x4d7e1f9c3b8a5d2e6f1c9b4a7d3e8f5c2b6a9d4e" },
      { fecha: "2026-02-18", evento: "PROCESAMIENTO", detalle: "Anaeróbico 168h + mosto de uva", hash: "0x1a8f4c2e7b5d9f3a6c1e8b4d7f2a5c9e3b6d8f1a" },
      { fecha: "2026-03-05", evento: "ANÁLISIS SCA", detalle: "90.50 pts · Q-Grader · Lab Organicode", hash: "0x7c3e9f5a2d8b1e4f7c3a9d6b2e5f8c1a4d7b3e9f" },
      { fecha: "2026-03-20", evento: "PUBLICADO", detalle: "Edición limitada · 6 sacos disponibles", hash: "0x2f6a9d4c1e8b3f7a5d2c9e6b1f4a8d3c7e5b2a9d" }
    ],
    coordenadas: { lat: 2.3833, lng: -75.9167 },
    suelo: "Volcánico-Andosol",
    brillo_solar: "2,150 hrs/año",
    precipitacion: "1,650 mm/año",
    microclima: "Altoandino frío",
    cosecha: "Febrero–Marzo 2026",
    sugerencia_ia: "Experiencia óptima con cold brew o inmersión larga. Las notas de frutas tropicales y vino requieren una extracción suave y prolongada a temperatura ambiente."
  }
];

export const precioActual: PrecioActual = {
  precio_ice: 1.85,
  trm: 3950,
  d_colombia: 0.40,
  d_huila: 0.10,
  d_trace: 0.50,
  updated_at: new Date().toISOString(),
  trend: 'up'
};

export const ofertas: Oferta[] = [
  {
    id: 1,
    lote_id: 4524,
    empresa: "Seoul Specialty Roasters",
    pais: "Corea del Sur",
    email: "buyer@seoulcoffee.kr",
    precio_ofrecido: 45.00,
    incoterm: "FOB",
    volumen_sacos: 6,
    estado: "pendiente",
    fecha: "2026-05-28"
  },
  {
    id: 2,
    lote_id: 4521,
    empresa: "Hamburg Coffee Traders GmbH",
    pais: "Alemania",
    email: "procurement@hct.de",
    precio_ofrecido: 31.00,
    incoterm: "CIF",
    volumen_sacos: 20,
    estado: "pendiente",
    fecha: "2026-05-27"
  },
  {
    id: 3,
    lote_id: 4522,
    empresa: "Tokyo Bean Brokers",
    pais: "Japón",
    email: "hello@tokyobeans.jp",
    precio_ofrecido: 21.50,
    incoterm: "FOB",
    volumen_sacos: 50,
    estado: "aceptada",
    fecha: "2026-05-25"
  },
  {
    id: 4,
    lote_id: 4523,
    empresa: "Blue Bottle Coffee USA",
    pais: "Estados Unidos",
    email: "green@bluebottlecoffee.com",
    precio_ofrecido: 13.00,
    incoterm: "EXW",
    volumen_sacos: 100,
    estado: "rechazada",
    fecha: "2026-05-24"
  }
];

export const compradores: Comprador[] = [
  { id: 1, nombre: "Kim Min-jae", empresa: "Seoul Specialty Roasters", email: "buyer@seoulcoffee.kr", pais: "Corea del Sur", registrado_en: "2026-01-15" },
  { id: 2, nombre: "Hans Müller", empresa: "Hamburg Coffee Traders", email: "procurement@hct.de", pais: "Alemania", registrado_en: "2026-02-20" },
  { id: 3, nombre: "Yuki Tanaka", empresa: "Tokyo Bean Brokers", email: "hello@tokyobeans.jp", pais: "Japón", registrado_en: "2026-03-10" },
  { id: 4, nombre: "Sarah Chen", empresa: "Blue Bottle Coffee", email: "green@bluebottlecoffee.com", pais: "Estados Unidos", registrado_en: "2026-04-05" }
];

// Helper to get lote by slug
export function getLoteBySlug(slug: string): Lote | undefined {
  return lotes.find(l => l.slug === slug);
}

// Helper to get lote by id
export function getLoteById(id: number): Lote | undefined {
  return lotes.find(l => l.id === id);
}

// Helper to get ofertas by lote
export function getOfertasByLote(loteId: number): Oferta[] {
  return ofertas.filter(o => o.lote_id === loteId);
}

// Helper to get publicados lotes
export function getLotesPublicados(): Lote[] {
  return lotes.filter(l => l.estado === 'publicado');
}

// Helper to calculate price breakdown
export function calcularDesglosePrecio(scaScore: number, precioActual: PrecioActual) {
  const base = precioActual.precio_ice;
  const dCol = precioActual.d_colombia;
  const dHuila = precioActual.d_huila;
  const dTrace = precioActual.d_trace;
  const scaPremium = scaScore >= 87 ? (scaScore - 85) * 8 : 0;
  
  return {
    base,
    diferencialColombia: dCol,
    diferencialHuila: dHuila,
    primaTrazabilidad: dTrace,
    primaSCA: scaPremium,
    totalEXW: base + dCol + dHuila + dTrace + scaPremium
  };
}

// Incoterm multipliers
export const incotermRates = {
  EXW: 0,
  FOB: 0.77,
  CIF: {
    'Alemania': 2.50,
    'Corea del Sur': 2.80,
    'Japón': 2.90,
    'Estados Unidos': 1.80,
    'default': 2.50
  }
};
