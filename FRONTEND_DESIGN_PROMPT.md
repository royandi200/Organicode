# 🎨 Organicode — Prompt de Diseño Frontend
## Especificación Completa UI/UX para todas las vistas

> **Uso:** Este documento es el brief de diseño definitivo para construir el frontend de Organicode.
> Entrégalo al agente de diseño, a Lovable, a Cursor o a tu equipo de desarrollo como el source of truth visual.
> Cada sección cubre una vista específica con sus componentes, comportamiento y criterios de aceptación.

---

## Índice

1. [Sistema de Diseño — Tokens Globales](#1-sistema-de-diseño--tokens-globales)
2. [Vista A · /lote/[slug] — Link Mágico / Experience Hub](#2-vista-a--loteslug--link-mágico--experience-hub)
3. [Vista B · /catalogo — Catálogo B2B con Coffee Matcher](#3-vista-b--catalogo--catálogo-b2b-con-coffee-matcher)
4. [Vista C · /admin — Dashboard Equipo Organicode](#4-vista-c--admin--dashboard-equipo-organicode)
5. [Vista D · /productor/[id] — Portal del Caficultor](#5-vista-d--productorid--portal-del-caficultor)
6. [Vista E · / — Landing Page Pública](#6-vista-e----landing-page-pública)
7. [Componentes Compartidos](#7-componentes-compartidos)
8. [Animaciones y Micro-interacciones](#8-animaciones-y-micro-interacciones)
9. [Checklist de Implementación](#9-checklist-de-implementación)

---

## 1. Sistema de Diseño — Tokens Globales

### Filosofía Visual

> **"La intersección del volcán y el pixel."**
> Organicode no es una plataforma de commodities — es un instrumento financiero de precisión
> con alma artesanal. El diseño debe sentirse como una tostadora de especialidad de Seúl
> que tiene las manos llenas de tierra del Huila.

**Inspiración:** Apple (precisión técnica) × Kinfolk Magazine (calidez editorial) × Bloomberg Terminal (densidad de datos sin ruido)

---

### Paleta de Colores

```css
/* ── FONDOS ───────────────────────────────────── */
--bg-void:        #0A0A08;   /* Negro cálido — fondo principal dark mode */
--bg-surface:     #121210;   /* Superficie de cards */
--bg-elevated:    #1C1C18;   /* Cards elevadas, modales */
--bg-light:       #F5F0E8;   /* Fondo crema para vistas públicas (Link Mágico) */
--bg-light-alt:   #EDE8DC;   /* Alternancia de secciones en modo claro */

/* ── MARCA ────────────────────────────────────── */
--brand-gold:     #C9A84C;   /* Dorado volcánico — CTAs principales, badges */
--brand-gold-dim: #8A6E2F;   /* Dorado apagado — hover states */
--brand-green:    #2D5A27;   /* Verde Huila profundo — acentos naturales */
--brand-green-lit:#4A8C42;   /* Verde claro — estados activos, éxito */
--brand-rust:     #8B3A2A;   /* Óxido terroso — alertas cálidas, etiquetas */

/* ── TEXTO ────────────────────────────────────── */
--text-primary:   #F0EBE0;   /* Casi blanco cálido — texto principal dark */
--text-secondary: #A09880;   /* Gris arena — texto secundario dark */
--text-muted:     #5C5646;   /* Muted — placeholders, metadata */
--text-dark:      #1A1814;   /* Texto principal light mode */
--text-dark-sec:  #4A4438;   /* Texto secundario light mode */

/* ── BORDES Y SEPARADORES ────────────────────── */
--border-subtle:  rgba(201, 168, 76, 0.12);   /* Borde dorado sutil */
--border-medium:  rgba(201, 168, 76, 0.25);   /* Borde dorado medio */
--border-strong:  rgba(201, 168, 76, 0.50);   /* Borde dorado prominente */

/* ── ESTADOS FUNCIONALES ─────────────────────── */
--state-success:  #3D7A35;
--state-warning:  #C9A84C;
--state-error:    #8B3A2A;
--state-info:     #2A5C7A;
```

### Tipografía

```css
/* Fuentes — importar desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── ESCALA TIPOGRÁFICA ──────────────────────── */
--font-display:   'Playfair Display', Georgia, serif;    /* Títulos hero, nombres de lotes */
--font-body:      'Inter', -apple-system, sans-serif;    /* Todo el texto funcional */
--font-mono:      'JetBrains Mono', 'Courier New', mono; /* Hashes, precios, códigos */

/* Tamaños */
--text-hero:      clamp(2.5rem, 6vw, 5rem);     /* H1 hero */
--text-heading:   clamp(1.75rem, 3vw, 2.5rem);  /* H2 secciones */
--text-title:     clamp(1.25rem, 2vw, 1.75rem); /* H3 cards */
--text-body:      1rem;                          /* Párrafos */
--text-small:     0.875rem;                      /* Labels, metadata */
--text-micro:     0.75rem;                       /* Timestamps, hashtags */
```

### Espaciado y Grid

```css
/* Sistema 8pt */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 24px;  --space-6: 32px;
--space-7: 48px;  --space-8: 64px;  --space-9: 96px;
--space-10: 128px;

/* Grid principal */
--max-width: 1280px;
--content-width: 960px;
--narrow-width: 680px;
--gutter: clamp(16px, 4vw, 48px);

/* Border radius */
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-xl: 32px;
--radius-pill: 9999px;
```

### Sombras y Efectos

```css
--shadow-card:    0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3);
--shadow-elevated:0 4px 6px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.4);
--shadow-gold:    0 0 0 1px var(--border-medium), 0 8px 32px rgba(201,168,76,0.15);
--glass-blur:     backdrop-filter: blur(20px) saturate(180%);
--glass-bg:       background: rgba(18,18,16,0.85);
```

---

## 2. Vista A · /lote/[slug] — Link Mágico / Experience Hub

> **El diferencial de innovación. Funciona sin login. Es la herramienta de cierre comercial.**
> Cuando un comprador en Hamburgo recibe este link, debe sentir que está comprando una obra de arte comestible, no un saco de granos.

### Modo: Claro (crema) — contrasta con el oscuro del admin

```
┌─────────────────────────────────────────────────────────────────┐
│ SECCIÓN 1 · HERO — full viewport height                         │
│                                                                 │
│  [Video/foto finca en loop, parallax]  overlay gradiente crema  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Badge: ⬡ VERIFIED · BATCH #4521 · BLOCKCHAIN HASH ✓   │  │
│  │                                                          │  │
│  │  RESERVA VOLCÁNICA                                       │  │
│  │  Geisha Natural · Finca La Esperanza                     │  │
│  │                                                          │  │
│  │  ❋ 89.25 SCA    📍 Pitalito, Huila    ▲ 1,850 msnm     │  │
│  │                                                          │  │
│  │  ╔═══════════════════════════════════╗                  │  │
│  │  ║  $ 30.17 USD/kg FOB              ║  ← precio vivo    │  │
│  │  ║  Actualizado hace 8 min · NYSE ↗  ║                  │  │
│  │  ╚═══════════════════════════════════╝                  │  │
│  │                                                          │  │
│  │  [Solicitar Muestra]  [Hacer Oferta]  [↓ Ver ficha]     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Especificación del Hero

**Imagen/Video de fondo:**
- Si el lote tiene `foto_url`: mostrar como imagen estática con Ken Burns effect (zoom lento 120s)
- Si hay video disponible: autoplay muted loop, máx 10MB
- Si no hay foto: gradiente orgánico animado con partículas de café (CSS/Canvas)
- Overlay: `linear-gradient(to bottom, rgba(245,240,232,0) 0%, rgba(245,240,232,0.6) 60%, rgba(245,240,232,1) 100%)`

**Badge de verificación:**
```jsx
// Componente BadgeVerificado
<div className="badge-verified">
  <HexagonIcon className="text-brand-green" />
  <span>VERIFIED · BATCH #{lote.hash_registro.slice(0,6).toUpperCase()}</span>
  <span className="hash" onClick={() => copyHash(lote.hash_registro)}>
    #{lote.hash_registro.slice(0,12)}...
    <CopyIcon />
  </span>
</div>
```

**Precio en tiempo real:**
- Fondo: `rgba(10,10,8,0.85)` con borde dorado `var(--border-strong)`
- Pulso verde sutil (animation) cuando el precio cambia
- Flecha direccional (↗/↘) según variación vs hace 15 min
- Mostrar tres incoterms: EXW / FOB / CIF con toggle
- Font: `JetBrains Mono` weight 500

---

```
┌─────────────────────────────────────────────────────────────────┐
│ SECCIÓN 2 · MAPA INTERACTIVO                                    │
│                                                                 │
│  [Google Maps Embed — satélite] zoom en parcela específica      │
│   ├── Pin finca con foto del caficultor                         │
│   ├── Marcador altitud: ▲ 1,850 msnm                           │
│   └── Chip: Volcán Nevado del Huila — 52km                     │
│                                                                 │
│  Sidebar:                                                       │
│  ┌────────────────────┐                                        │
│  │ 📍 Municipio        │ Pitalito                              │
│  │ 🌋 Suelo            │ Volcánico-Andosol                     │
│  │ ☀️ Brillo solar      │ 2,200 hrs/año                        │
│  │ 🌧️ Precipitación    │ 1,800 mm/año                         │
│  │ 🌬️ Microlima         │ Cruce Andes-Amazonía                  │
│  └────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│ SECCIÓN 3 · PERFIL SENSORIAL — Rueda de Sabores Interactiva     │
│                                                                 │
│  [SVG Flavor Wheel — rueda concéntrica animada]                 │
│   Centro: puntaje SCA grande en Playfair Display                │
│   Anillo 1: categorías base (Floral, Frutas, Dulce…)            │
│   Anillo 2: notas específicas del lote activas/highlighted      │
│                                                                 │
│  Notas destacadas del lote (chips interactivos):                │
│  [🌹 Rosas]  [🍋 Limoncillo]  [🍵 Té blanco]  [🍑 Durazno]     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Proceso:  Natural · Secado Casa Elba · 21 días          │  │
│  │ Humedad:  11.2%  ·  Rendimiento: 88%                    │  │
│  │ Cosecha:  Marzo–Agosto 2026                              │  │
│  │ Altitude: 1,850 msnm  ·  Suelo volcánico                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [💡 Sugerencia de Tueste IA]                                   │
│  "Para resaltar las notas florales, recomendamos tueste claro   │
│  a 197°C desarrollo 20-22%." — Organicode AI                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Especificación del Flavor Wheel

```jsx
// FlavorWheel.jsx — SVG interactivo
// Datos: array de notas del lote desde la DB
// Notas activas se iluminan en --brand-gold con glow effect
// Hover en cualquier nota muestra tooltip con descripción
// Animación: mount con staggered fade-in de 0 → opacity 1 (0.8s)

const notes = lote.notas_sensoriales.split(',').map(n => n.trim());
// Mapear contra el SCA flavor wheel estándar
// Usar D3.js o SVG estático con clases dinámicas
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│ SECCIÓN 4 · HISTORIA DEL PRODUCTOR                              │
│                                                                 │
│  [Foto 2:3 del caficultor] ← alta calidad, b/n con tono cálido │
│                                                                 │
│  "Este lote nació en las tierras altas del sur del Huila,       │
│  cultivado a 1,850 metros por la familia García-Vásquez.        │
│  Tres generaciones dedicadas al café bajo la sombra del         │
│  Macizo Colombiano..."                                          │
│                                  — Generado por IA con datos   │
│                                    reales del caficultor        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 👨‍🌾 Don Alexander Vásquez  ·  Finca El Encanto            │  │
│  │ 📍 Vda. Los Pinos, Baraya, Huila  ·  desde 1987         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Íconos de valores]                                            │
│  🌿 Cultivo orgánico   👩 Mujeres caficultoras                 │
│  ☮️ Proceso de Paz     🐝 Apicultura integrada                  │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│ SECCIÓN 5 · SELLO DE TRAZABILIDAD + LÍNEA DE TIEMPO            │
│                                                                 │
│  Título: "La cadena de confianza de este lote"                  │
│                                                                 │
│  Timeline vertical con iconos:                                  │
│  ●── 📅 12 Mar 2026  COSECHA                                    │
│  │   Don Alexander recolectó 840 kg de Geisha                   │
│  │   Hash: 0x3f4a...  [Ver en Polygonscan ↗]                   │
│  │                                                              │
│  ●── 📅 22 Mar 2026  PROCESAMIENTO                              │
│  │   Fermentación Natural · 21 días · Casa Elba                 │
│  │   Humedad final: 11.2%  ·  Rendimiento: 88%                 │
│  │                                                              │
│  ●── 📅 08 Abr 2026  ANÁLISIS SCA                               │
│  │   Q-Grader: 89.25 pts  ·  Laboratorio Organicode            │
│  │   [Descargar certificado PDF ↓]                              │
│  │                                                              │
│  ●── 📅 15 May 2026  PUBLICADO                                  │
│      Disponible en plataforma · Precio activo                   │
│      Hash de registro: 0x9b2c...  ✓ Verificado                 │
│                                                                 │
│  [⬡ Ver en Blockchain]  badge con link a Polygonscan            │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│ SECCIÓN 6 · PRECIO DETALLADO + CALCULADORA INCOTERMS           │
│                                                                 │
│  Desglose visual de cómo se construye el precio:               │
│                                                                 │
│  Precio Bolsa NY ICE     $ 2.18 USD/lb  → $ 4.80 USD/kg        │
│  + Diferencial Colombia  $ 0.40 USD/lb  → $ 0.88 USD/kg        │
│  + Diferencial Huila     $ 0.10 USD/lb  → $ 0.22 USD/kg        │
│  + Prima Trazabilidad    ─────────────  → $ 0.50 USD/kg        │
│  + Prima SCA 89.25 pts   ─────────────  → $ 23.77 USD/kg ★    │
│  ─────────────────────────────────────────────────────────     │
│  PRECIO BASE EXW         ─────────────  → $ 30.17 USD/kg       │
│                                                                 │
│  [Toggle Incoterm]  ○ EXW  ● FOB  ○ CIF                        │
│                                                                 │
│  FOB Cartagena:  +$ 0.77/kg  →  TOTAL $ 30.94 USD/kg          │
│  Para: [🇩🇪 Hamburg  ▼]                                         │
│  CIF Hamburg:   +$ 1.20/kg  →  TOTAL $ 32.14 USD/kg           │
│                                                                 │
│  [📋 Descargar Cotización PDF]  [💬 Solicitar Muestra]          │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│ SECCIÓN 7 · CTA FINAL — Sticky Bottom Bar                       │
│                                                                 │
│  [Foto lote]  Reserva Volcánica · Geisha  ·  $ 30.17 USD/kg   │
│                                                                 │
│  [💬 Solicitar Muestra (200g gratis)]  [✉️ Hacer Oferta Formal] │
│                                                                 │
│  Al hacer clic en Solicitar Muestra:                            │
│  → Abre WhatsApp con mensaje pre-cargado:                      │
│    "Hola Organicode, me interesa el lote Reserva Volcánica     │
│     Geisha Natural #4521. Quisiera solicitar una muestra."     │
│                                                                 │
│  Al hacer clic en Hacer Oferta Formal:                          │
│  → Modal con formulario: precio (USD/kg), incoterm, volumen,   │
│    nombre empresa, país → POST /api/webhook-buyer HACER_OFERTA │
└─────────────────────────────────────────────────────────────────┘
```

#### Criterios de Aceptación — /lote/[slug]

- [ ] Carga sin login en < 2s (Lighthouse Performance > 90)
- [ ] Precio se actualiza automáticamente cada 15 min sin reload (polling o SSE)
- [ ] Flavor Wheel muestra las notas del lote desde la DB
- [ ] Google Maps embed carga en < 3s con fallback a imagen estática
- [ ] Botón WhatsApp abre chat con mensaje pre-cargado correcto
- [ ] Modal oferta envía a `/api/webhook-buyer` y muestra confirmación
- [ ] Hash de registro es copiable al clipboard con toast de confirmación
- [ ] Responsive perfecto en móvil (375px+) — es la vista más usada por compradores
- [ ] Compartir URL → genera og:image con foto del lote, nombre y precio (og:tags)
- [ ] PDF de cotización genera datos dinámicos del lote con precios actualizados

---

## 3. Vista B · /catalogo — Catálogo B2B con Coffee Matcher

> **Audiencia:** Compradores registrados. Acceso completo post-registro.
> **Modo:** Dark — contrasta con el mundo premium del lote.

### Layout General

```
┌───────────────────────────────────────────────────────────┐
│  NAV: [Organicode Logo]  Catálogo  Mis pedidos  [Mi perfil]│
│       ───────────────────────────────────── precio ICE live│
├───────────────────────────────────────────────────────────┤
│  COFFEE MATCHER — Hero interactivo (colapsable)             │
│  "Encuentra tu lote ideal en 4 preguntas"                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [Paso 1: Volumen]  [Paso 2: Perfil]  [Paso 3: SCA] │ │
│  │  [Paso 4: Presupuesto]  →  [Ver Resultados →]       │ │
│  └──────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────┤
│  FILTROS (sidebar izq, colapsable en móvil)                │
│  ├── Variedad (multi-select con chips)                     │
│  ├── Proceso (Lavado / Natural / Honey / Anaeróbico)       │
│  ├── SCA mínimo (slider 82–95)                             │
│  ├── Volumen disponible (sacos)                            │
│  ├── Precio máx USD/kg                                     │
│  └── Origen (municipio del Huila)                          │
│                                                            │
│  GRID LOTES (2 cols desktop, 1 col móvil)                  │
│  ┌────────────┐  ┌────────────┐                           │
│  │ LoteCard   │  │ LoteCard   │                           │
│  │ [foto]     │  │ [foto]     │                           │
│  │ Geisha     │  │ Bourbon R. │                           │
│  │ 89.25 pts  │  │ 86.50 pts  │                           │
│  │ $30.17/kg  │  │ $19.67/kg  │                           │
│  │ [Ver →]    │  │ [Ver →]    │                           │
│  └────────────┘  └────────────┘                           │
└───────────────────────────────────────────────────────────┘
```

### Componente LoteCard

```jsx
// LoteCard.jsx — dark mode
// Hover: border dorado aparece + ligero scale(1.02) + shadow gold
// Badge SCA: verde si >= 87, dorado si >= 85, gris si < 85
// Precio: JetBrains Mono, actualizado en tiempo real
// Estado badge: DISPONIBLE (verde) | OFERTADO (dorado) | VENDIDO (rojo)

<div className="lote-card" style={{
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.25s ease',
}}>
  <div className="card-image">
    {/* Aspect ratio 4:3 */}
    {/* Badge SCA en esquina superior derecha */}
    {/* Badge estado en esquina superior izquierda */}
  </div>
  <div className="card-body" style={{ padding: 'var(--space-5)' }}>
    <p className="variedad">{lote.variedad}</p>
    <h3 className="nombre">{lote.slug.replace(/-/g, ' ')}</h3>
    <div className="meta">
      <span>{lote.proceso}</span>
      <span>·</span>
      <span>{lote.municipio}</span>
    </div>
    <div className="precio">
      <span className="amount">${lote.precio_calculado.toFixed(2)}</span>
      <span className="unit"> USD/kg FOB</span>
    </div>
    <button className="btn-ver">Ver ficha completa →</button>
  </div>
</div>
```

### Coffee Matcher — Flujo de 4 pasos

```
Paso 1 — Volumen
  ○ Muestra (200g)           ← gratis
  ○ Microlote (1–10 sacos)
  ○ Lote completo (10–50 sacos)
  ○ Contenedor (300+ sacos)

Paso 2 — Perfil sensorial
  [Cards visuales con iconos grandes]
  ○ 🍫 Clásico achocolatado
  ○ 🍋 Cítrico y brillante
  ○ 🌸 Floral y delicado
  ○ 🍷 Exótico fermentado
  ○ 🍯 Dulce y miel
  (selección múltiple)

Paso 3 — Estándar de calidad
  Slider visual con descripción:
  82─────●──────────95
  Comercial Premium Specialty Ultra

Paso 4 — Presupuesto
  $5 ─────●──────── $50+ USD/kg
  [Input directo opcional]

Resultado:
  3 cards de lotes con Match Score (barra de progreso dorada)
  [Match 96%] [Match 89%] [Match 82%]
  Botón "Desbloquear resultados" → registro si no está logueado
```

#### Criterios de Aceptación — /catalogo

- [ ] Coffee Matcher persiste en sessionStorage si el usuario navega y vuelve
- [ ] Filtros actualizan el grid sin recargar la página (React state)
- [ ] Precio en las cards se actualiza automáticamente cada 15 min
- [ ] Grid maneja estado vacío con mensaje + CTA de contacto
- [ ] Registro requerido para ver precio completo y contactar (email + empresa)
- [ ] Lotes VENDIDOS aparecen al final con opacity 0.4
- [ ] Match Score se calcula en frontend (sin llamada API extra) con datos ya cargados

---

## 4. Vista C · /admin — Dashboard Equipo Organicode

> **Audiencia:** Equipo interno exclusivamente. Autenticado con JWT.
> **Modo:** Dark oscuro con densidad de datos. Inspiración Bloomberg + Linear.

### Layout

```
┌──────────┬────────────────────────────────────────────────────┐
│ SIDEBAR  │  CONTENT AREA                                      │
│ (240px)  │                                                    │
│          │  ╔════════════════════════════════════════════╗   │
│ Logo     │  ║  PRECIO BOLSA ICE NY: $ 2.18 USD/lb  ↗    ║   │
│          │  ║  TRM: $ 4,180 COP/USD  ·  Hace 4 min      ║   │
│ ● Dashboard  ╚════════════════════════════════════════════╝   │
│ ○ Lotes  │                                                    │
│ ○ Productores  [KPI Cards — 4 columnas]                      │
│ ○ Compradores  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│ ○ Ofertas  │  │ 24   │ │  8   │ │  3   │ │ 5    │         │
│ ○ Analytics│  │Lotes │ │Activos│ │Ofertas│ │Ventas│         │
│ ○ Precios │  └──────┘ └──────┘ └──────┘ └──────┘         │
│          │                                                    │
│ [Cerrar] │  [Alertas Pusher en tiempo real]                   │
│          │  🔔 Nueva oferta: Geisha #4521 — $31.00/kg FOB    │
└──────────┴────────────────────────────────────────────────────┘
```

### Subvista · /admin/lotes

```
Tabla de lotes con columnas:
│ # │ Foto │ Nombre/Slug │ Variedad │ SCA │ Estado │ Precio │ Acciones │

Badges de estado con colores:
  BORRADOR   → gris oscuro
  PUBLICADO  → verde
  OFERTADO   → dorado pulsante (animation: pulse 2s infinite)
  VENDIDO    → azul
  ARCHIVADO  → gris claro opacity 50%

Acciones inline:
  [✏️ Editar]  [🔗 Copiar Link]  [👁 Ver ficha pública]  [⬛ Archivar]

Modal editar lote:
  Campos: variedad, proceso, cantidad_kg, humedad, sca_score,
  notas_sensoriales, foto_url, estado
  Subida de imagen: drag & drop → Preview antes de guardar
```

### Subvista · /admin/ofertas

```
Vista Kanban: 3 columnas
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  PENDIENTES │  │  ACEPTADAS  │  │  RECHAZADAS │
│  (3)        │  │  (2)        │  │  (1)        │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ OfertaCard  │  │ OfertaCard  │  │ OfertaCard  │
│             │  │             │  │             │
│ Empresa XYZ │  │ Tostadora A │  │ Importador Z│
│ Geisha #4521│  │ Bourbon     │  │ Castillo    │
│ $31.00/kg   │  │ $20.50/kg   │  │ $8.00/kg ✗  │
│ FOB · 20 sac│  │ CIF · 50sac │  │ (bajo mínimo│
│             │  │             │  │  aceptable) │
│ [✓ Aceptar] │  │ [Notificar] │  │             │
│ [✗ Rechazar]│  │ [Cerrar tx] │  │             │
└─────────────┘  └─────────────┘  └─────────────┘

Al Aceptar → modal:
  "¿Confirmar aceptación? Esto notificará al comprador y al caficultor
  por WhatsApp automáticamente."  [Cancelar] [Confirmar]
→ POST /api/admin/ofertas/:id  {estado: 'aceptada'}
→ BuilderBot envía WhatsApp al comprador y al caficultor
```

### Subvista · /admin/precios

```
Chart: Precio ICE Bolsa NY — últimas 48 horas (line chart)
Chart: Precio calculado Geisha vs Bourbon vs Castillo (comparativo)
Tabla: Últimas 20 actualizaciones de precio con timestamp
Sliders manuales:
  D_Colombia: [slider 0–1.00 USD/lb]  actual: 0.40
  D_Huila:    [slider 0–0.50 USD/lb]  actual: 0.10
  D_Trace:    [slider 0–1.00 USD/kg]  actual: 0.50
[Aplicar cambios] → actualiza precios de todos los lotes publicados
```

#### Criterios de Aceptación — /admin

- [ ] Notificación Pusher aparece como toast en < 2s cuando llega oferta
- [ ] KPIs se actualizan en tiempo real con Pusher
- [ ] Tabla de lotes soporta búsqueda, ordenamiento y filtro por estado
- [ ] Kanban de ofertas permite drag & drop entre columnas
- [ ] Cambio de diferenciales recalcula y actualiza todos los precios en < 5s
- [ ] Export CSV de lotes, compradores y ofertas
- [ ] Protegida con JWT — redirect a /admin/login si no hay sesión

---

## 5. Vista D · /productor/[id] — Portal del Caficultor

> **Audiencia:** Caficultores que acceden via link que el bot les envía por WhatsApp.
> **Modo:** Claro y accesible. Diseño ultra-simple, texto grande.
> **Auth:** Magic link enviado por WhatsApp — sin contraseña.

### Layout Móvil-First (esto se usa en celular en la finca)

```
┌─────────────────────────────────────────────┐
│  [Foto de perfil] Don Alexander Vásquez     │
│  Finca El Encanto · Baraya, Huila            │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 💰 Tus ingresos este mes             │   │
│  │                                      │   │
│  │  $ 4.2M COP   vs cooperativa local   │   │
│  │  Tu ganancia extra: + $ 1.8M COP ✅  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Tus lotes activos:                          │
│  ┌──────────────────────────────────────┐   │
│  │ Geisha Natural · Lote #4521          │   │
│  │ 840 kg · 89.25 SCA · PUBLICADO 🟢   │   │
│  │ Precio actual: $30.17 USD/kg         │   │
│  │ [Ver ficha completa →]               │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Tu evolución de calidad:                    │
│  [Mini chart SCA por cosecha]                │
│  ▁▃▄▆▇█  87.0 → 87.5 → 88.0 → 89.25 ↗     │
│                                              │
│  [📱 Registrar nuevo lote — ir a WhatsApp]  │
└─────────────────────────────────────────────┘
```

#### Criterios de Aceptación — /productor/[id]

- [ ] Auth por magic link (token en URL, válido 48h)
- [ ] Vista es 100% funcional en móvil de gama media (2GB RAM, 4G)
- [ ] Texto mínimo 16px — accesibilidad para adultos mayores en campo
- [ ] CTA "Registrar nuevo lote" abre WhatsApp directamente
- [ ] Gráfico de evolución SCA muestra al menos 3 cosechas pasadas
- [ ] Ingreso "vs cooperativa local" usa precio promedio de FNC como benchmark

---

## 6. Vista E · / — Landing Page Pública

> **Objetivo:** Convertir al visitante en comprador registrado o caficultor activo.
> **Modo:** Dark con secciones alternadas dark/crema.

### Estructura de Secciones

```
SECCIÓN 1 — HERO FULL SCREEN
  Video background: volcán del Huila + café siendo recolectado
  Headline en Playfair Display (72px):
  "El café más traqueado del mundo
   nace aquí."
  CTA principal: [Explorar el Catálogo →]
  CTA secundario: [¿Eres caficultor? Únete]
  Scroll indicator: flecha animada hacia abajo

SECCIÓN 2 — PROPUESTA DE VALOR (3 columnas)
  🌋 Origen verificado en blockchain
  💰 Precio justo en tiempo real
  🤝 Del caficultor al tostador

SECCIÓN 3 — LOTES DESTACADOS (carrusel)
  3–4 cards de lotes publicados recientemente
  con precio en vivo y CTA al catálogo

SECCIÓN 4 — CÓMO FUNCIONA
  Timeline animado: Registro → Lote → Precio → Comprador → Venta

SECCIÓN 5 — CIFRAS
  [Fondo oscuro con números grandes en Playfair]
  24 caficultores activos
  3 países compradores
  89.25 pts SCA máximo
  100% trazable desde la finca

SECCIÓN 6 — TESTIMONIOS CAFICULTORES
  Cards con foto real + cita corta + nombre + municipio

SECCIÓN 7 — REGISTRO CTA FINAL
  [Form inline: nombre, empresa, email]
  → POST /api/compradores  (registro rápido)
  → Redirect al /catalogo completo

FOOTER
  Logo · Links · WhatsApp · Newsletter · EUDR badge
```

---

## 7. Componentes Compartidos

### Navbar

```jsx
// Comportamiento:
// - Transparente sobre hero, se vuelve --bg-void/95 con blur al hacer scroll
// - Logo: wordmark "Organicode" en Playfair Display + ícono hexágono
// - Precio ICE live en navbar (solo desktop): pequeño badge con el precio actual
// - CTA botón: dorado, outline hover → filled

<nav style={{
  position: 'fixed',
  top: 0, width: '100%', zIndex: 100,
  backdropFilter: 'blur(20px)',
  background: scrolled ? 'rgba(10,10,8,0.92)' : 'transparent',
  borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
  transition: 'all 0.3s ease',
}}>
```

### PrecioLive Badge

```jsx
// Componente reutilizable — aparece en navbar, hero y cards
// Hace polling a /api/precios/actual cada 15 min
// Animación: cuando cambia, hace un flash dorado suave
<div className="precio-live">
  <span className="dot" /> {/* dot verde pulsante */}
  <span>${precio} USD/lb ICE</span>
  <span className="trend">{trend === 'up' ? '↗' : '↘'}</span>
  <span className="timestamp">hace {minutes}m</span>
</div>
```

### VerificadoBadge

```jsx
// Badge de trazabilidad — dos variantes: mini y completo
// Mini: solo el hexágono + texto corto (para cards)
// Completo: con hash y link a blockchain (para ficha de lote)
<div className="badge-verified mini">
  <HexIcon />
  <span>VERIFIED</span>
</div>
```

### Toast / Notification System

```jsx
// Pusher → toast en esquina inferior derecha
// Tipos: oferta (dorado), precio (azul), sistema (gris)
// Auto-dismiss en 6s, hover congela el timer
// Stack de hasta 3 toasts simultáneos
```

---

## 8. Animaciones y Micro-interacciones

### Principios
- **Duración:** 200–400ms para UI feedback, 600–1200ms para transiciones de página
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — entra rápido, sale suave (Apple-style)
- **Nunca animar:** cambios de datos en tiempo real sin una razón clara
- **Reducir movimiento:** respetar `prefers-reduced-motion`

### Catálogo de Animaciones

```css
/* Mount de elementos (usando framer-motion o CSS) */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Cards en grid — stagger de 50ms entre cards */
.lote-card:nth-child(n) { animation-delay: calc(n * 50ms); }

/* Precio actualizado — flash dorado */
@keyframes priceFlash {
  0%, 100% { color: var(--text-primary); }
  50%       { color: var(--brand-gold); text-shadow: 0 0 12px var(--brand-gold); }
}

/* Flavor Wheel — mount stagger por pétalo */
.flavor-petal { animation: fadeInScale 0.6s ease forwards; }

/* Hover en botón CTA */
.btn-primary {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201,168,76,0.35);
}

/* Badge OFERTADO — pulso */
@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
}
```

### Transición entre páginas

```jsx
// Usar React Router + framer-motion AnimatePresence
// Page exit: fade out 200ms
// Page enter: fade in + translateY(8px → 0) 400ms
// Entre /catalogo y /lote/[slug]: shared element transition si es posible
//   (la card del catálogo hace zoom in hacia el hero de la ficha)
```

---

## 9. Checklist de Implementación

> Marcar con `[x]` al completar

### Sistema de Diseño Base
- [ ] Crear `src/styles/tokens.css` con todas las variables CSS
- [ ] Crear `src/styles/typography.css` con la escala tipográfica
- [ ] Crear `src/styles/animations.css` con el catálogo de animaciones
- [ ] Instalar y configurar Tailwind con los tokens como custom values
- [ ] Instalar Framer Motion para animaciones de página
- [ ] Instalar Lucide React para iconografía

### Componentes Globales
- [ ] `Navbar.jsx` — transparente → sólido on scroll + precio live
- [ ] `PrecioLive.jsx` — badge con polling cada 15 min
- [ ] `VerificadoBadge.jsx` — mini y completo
- [ ] `ToastSystem.jsx` — integrado con Pusher
- [ ] `LoteCard.jsx` — card oscura con hover effects
- [ ] `Button.jsx` — variants: primary (dorado), secondary (outline), ghost

### Vista A · /lote/[slug]
- [ ] Hero con parallax y overlay crema
- [ ] PrecioLive con desglose incoterms (EXW/FOB/CIF)
- [ ] FlavorWheel.jsx — SVG interactivo con notas de la DB
- [ ] MapaFinca.jsx — Google Maps Embed
- [ ] TimelineTrazabilidad.jsx — con hashes y links a Polygonscan
- [ ] HistoriaProductor.jsx — foto + storytelling + valores
- [ ] CalculadoraPrecio.jsx — desglose de primas
- [ ] ModalOferta.jsx — formulario → POST webhook-buyer
- [ ] StickyBar.jsx — siempre visible en la parte inferior
- [ ] OG tags dinámicos por lote (og:image, og:title, og:description)

### Vista B · /catalogo
- [ ] CoffeeMatcher.jsx — wizard 4 pasos con animaciones
- [ ] FiltrosPanel.jsx — sidebar colapsable
- [ ] LotesGrid.jsx — grid responsivo con stagger animation
- [ ] MatchScore.jsx — barra de progreso dorada
- [ ] RegisterGate.jsx — bloqueo con CTA de registro

### Vista C · /admin
- [ ] AdminLayout.jsx — sidebar + content area
- [ ] KPICard.jsx — número grande + tendencia
- [ ] LotesTable.jsx — tabla con sorting, filtro, acciones inline
- [ ] OfertasKanban.jsx — drag & drop entre estados
- [ ] PreciosChart.jsx — línea temporal ICE + sliders diferenciales
- [ ] PusherProvider.jsx — context para notificaciones en tiempo real
- [ ] AuthGuard.jsx — HOC que verifica JWT

### Vista D · /productor/[id]
- [ ] ProductorProfile.jsx — foto + datos básicos
- [ ] IngresoComparativo.jsx — vs cooperativa local
- [ ] MisLotes.jsx — cards simplificadas de lotes activos
- [ ] SCAEvolution.jsx — mini chart de calidad histórica
- [ ] WhatsAppCTA.jsx — botón grande → abre bot

### Vista E · / (Landing)
- [ ] HeroVideo.jsx — video + headline + CTAs
- [ ] PropuestaValor.jsx — 3 columnas iconos
- [ ] LotesDestacados.jsx — carrusel de lotes live
- [ ] ComoCFunciona.jsx — timeline animado
- [ ] Cifras.jsx — números grandes con counter animation
- [ ] RegisterForm.jsx — form inline → /api/compradores

---

## Stack Técnico Frontend Recomendado

```json
{
  "framework": "React 18 + Vite",
  "routing": "React Router v6",
  "styling": "Tailwind CSS v3 + CSS custom properties",
  "animations": "Framer Motion",
  "icons": "Lucide React",
  "charts": "Recharts",
  "maps": "Google Maps Embed API (free tier)",
  "flavor-wheel": "D3.js (solo para el wheel) o SVG estático",
  "real-time": "Pusher JS client",
  "state": "Zustand (simple, sin Redux)",
  "forms": "React Hook Form",
  "http": "native fetch / SWR para data fetching con cache",
  "pdf": "@react-pdf/renderer para cotizaciones",
  "deploy": "Vercel (conectado al repo, auto-deploy en push a main)"
}
```

---

*Documento vivo — actualizar con cada sprint. Versión inicial: Mayo 2026.*
