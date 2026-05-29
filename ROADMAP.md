# 🌿 Organicode — Hoja de Ruta del Proyecto

> **Plataforma global de gestión y comercialización de Café Huila con IA & Blockchain**
> Stack: Vercel (Front + API Serverless) · BuilderBot (WhatsApp) · MySQL · React + Vite · Pusher

---

## Cómo usar este documento

- Marca cada tarea con `[x]` cuando esté completada.
- Cada sprint tiene un **objetivo concreto y verificable**.
- Las secciones de arquitectura son referencia permanente — no se marcan, se actualizan.
- Al cerrar un sprint, crear un **GitHub Release** con el tag correspondiente (`v0.1`, `v0.2`, etc.).

---

## Índice

1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Los 8 Artefactos y su Implementación Técnica](#2-los-8-artefactos-y-su-implementación-técnica)
3. [Schema MySQL](#3-schema-mysql)
4. [Plan de Implementación por Sprints](#4-plan-de-implementación-por-sprints)
5. [Flujo de Datos Completo](#5-flujo-de-datos-completo)
6. [Variables de Entorno](#6-variables-de-entorno)
7. [Decisiones de Arquitectura](#7-decisiones-de-arquitectura)

---

## 1. Arquitectura del Sistema

### Modelo: Híbrido WhatsApp-First + WebApp

```
┌──────────────────────────────────────────────────────────────────┐
│                  MySQL (Railway / PlanetScale)                    │
│   productores · lotes · precios · compradores · ofertas · logs   │
└──────────────┬──────────────────┬──────────────┬────────────────┘
               │                  │              │
   ┌───────────▼──────────┐  ┌────▼──────┐  ┌──▼──────────────────┐
   │   WhatsApp Bot        │  │  WebApp   │  │  Link Mágico (QR)   │
   │   BuilderBot          │  │  Vercel   │  │  /lote/[slug]       │
   │   (VPS / Railway)     │  │           │  │  Público, sin login  │
   │                       │  │           │  │                      │
   │  → Caficultor         │  │ /admin    │  │  Ficha técnica       │
   │    registra lote      │  │ /catalogo │  │  Mapa, perfil SCA    │
   │  → Comprador B2B      │  │ /lote/[id]│  │  Precio en tiempo    │
   │    busca y oferta     │  │           │  │  real + CTA WhatsApp │
   └───────────────────────┘  └───────────┘  └──────────────────────┘
               │                  │
               └──────────────────┘
                  POST /api/webhook
               (Vercel Serverless Fn)
```

### Stack técnico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend** | React + Vite + Tailwind | SPA deployada en Vercel |
| **API Backend** | Vercel Serverless Functions (`/api/*.js`) | REST + Webhook handler |
| **Base de datos** | MySQL (Railway o PlanetScale) | Fuente única de verdad |
| **WhatsApp Agent** | BuilderBot (Node.js, servidor propio) | Co-Pilot caficultor + Buyer Concierge |
| **Real-time** | Pusher | Alertas en dashboard admin |
| **Cron jobs** | Vercel Cron (`vercel.json`) | Precio bolsa NY cada 15 min |
| **Pagos (Fase 2)** | Stripe + PayPal | Muestras y lotes |
| **Blockchain (Fase 2)** | Polygon / Arbitrum + Solidity | Trazabilidad inmutable |
| **Mapas** | Google Maps Embed / Mapbox | Localización de fincas |

### Patrón del webhook (basado en [bardj-ai](https://github.com/royandi200/bardj-ai))

BuilderBot llama `POST /api/webhook` con el siguiente contrato:

```json
// Request (BuilderBot → Vercel)
{
  "action": "REGISTRAR_LOTE",
  "from": "573001234567",
  "productor_id": "prod_abc123",
  "data": {
    "variedad": "Geisha",
    "proceso": "Natural",
    "cantidad_kg": 840,
    "humedad": 11.2,
    "rendimiento": 88
  }
}

// Response (Vercel → BuilderBot)
{
  "ok": true,
  "action": "REGISTRAR_LOTE",
  "mensaje": "✅ Lote registrado. Precio estimado: $28.50 USD/kg FOB. ¿Confirmas la publicación?",
  "data": { "lote_id": "lot_xyz789", "precio_calculado": 28.50 },
  "error": null
}
```

---

## 2. Los 8 Artefactos y su Implementación Técnica

### Alineación Artefacto → Código

| # | Artefacto | Nombre comercial | Canal | Archivos clave | Sprint |
|---|---|---|---|---|---|
| A1 | E-commerce Web & Mobile | **Organicode Digital Hub** | WebApp `/catalogo` + `/lote/[slug]` | `src/pages/Catalogo.jsx`, `src/pages/Lote.jsx` | S3–S4 |
| A2 | WhatsApp IA Caficultor | **Organicode Co-Pilot** | BuilderBot → `/api/webhook.js` | `api/webhook.js`, `bot/flows/caficultor.js` | S1–S2 |
| A3 | WhatsApp B2B Global | **Global Buyer Concierge** | BuilderBot → `/api/webhook-buyer.js` | `api/webhook-buyer.js`, `bot/flows/comprador.js` | S5–S6 |
| A4 | Algoritmo Precios Dinámico | **Organicode Pricing Engine** | Vercel Cron + lib | `api/cron/precio-bolsa.js`, `api/_lib/pricing.js` | S2 |
| A5 | Quality Matchmaking Engine | **Match Engine** | Función interna del webhook-buyer | `api/_lib/matchmaking.js` | S5 |
| A6 | Blockchain Trazabilidad | **Organicode Trust Network** | **Fase 2** — por ahora SHA-256 en MySQL | `api/_lib/hash.js` → luego `contracts/OrganicodeTracker.sol` | S7+ |
| A7 | Portal Transparencia B2B | **Experience Hub** | Link Mágico `/lote/[slug]` | `src/pages/Lote.jsx` (ficha pública) | S3–S4 |
| A8 | Business Intelligence | **Organicode Analytics** | WebApp `/admin/analytics` | `src/pages/admin/Analytics.jsx`, `api/analytics.js` | S7–S8 |

### Progresión de A6 (Blockchain) — no bloquea el MVP

```
MVP (Sprint 1)    →  hash_lote = SHA256(lote_id + timestamp + productor_id)
                     guardado en MySQL campo `hash_registro`
                     mostrado en /lote/[slug] como sello de autenticidad

Fase 2 (mes 4+)   →  mismo hash se ancla en Polygon/Arbitrum
                     URL del lote no cambia
                     se agrega badge "Verificado on-chain"
                     compatibilidad EUDR para exportación a Europa
```

---

## 3. Schema MySQL

```sql
-- ══════════════════════════════════════════════
-- PRODUCTORES (equivale a "bars" en bardj-ai)
-- ══════════════════════════════════════════════
CREATE TABLE productores (
  id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  nombre        VARCHAR(100) NOT NULL,
  finca         VARCHAR(100),
  vereda        VARCHAR(100),
  municipio     VARCHAR(100),
  departamento  VARCHAR(50)  DEFAULT 'Huila',
  gps_lat       DECIMAL(10,7),
  gps_lng       DECIMAL(10,7),
  altitud_msnm  INT,
  whatsapp      VARCHAR(20)  UNIQUE,
  email         VARCHAR(100),
  storytelling  TEXT,
  activo        BOOLEAN      DEFAULT TRUE,
  created_at    DATETIME     DEFAULT NOW(),
  updated_at    DATETIME     ON UPDATE NOW()
);

-- ══════════════════════════════════════════════
-- LOTES (core del negocio)
-- ══════════════════════════════════════════════
CREATE TABLE lotes (
  id                VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  slug              VARCHAR(120) UNIQUE,        -- para /lote/[slug]
  productor_id      VARCHAR(36)  NOT NULL REFERENCES productores(id),
  variedad          VARCHAR(80),                -- Geisha, Bourbon Rosado, Castillo…
  proceso           VARCHAR(50),                -- Lavado, Natural, Honey, Anaeróbico
  tipo_secado       VARCHAR(50),                -- Casa Elba, Silo, Natural
  cantidad_kg       DECIMAL(10,2),
  humedad           DECIMAL(4,2),               -- % humedad final
  rendimiento       DECIMAL(4,2),               -- factor rendimiento
  sca_score         DECIMAL(4,2),               -- puntaje SCA oficial
  notas_sensoriales TEXT,                       -- notas de taza
  foto_url          VARCHAR(500),
  hash_registro     VARCHAR(64),                -- SHA-256 para trazabilidad fase 1
  precio_calculado  DECIMAL(10,4),              -- USD/kg calculado por Pricing Engine
  estado            ENUM('borrador','publicado','ofertado','vendido','archivado') DEFAULT 'borrador',
  publicado_at      DATETIME,
  created_at        DATETIME     DEFAULT NOW(),
  updated_at        DATETIME     ON UPDATE NOW()
);

-- ══════════════════════════════════════════════
-- PRECIOS BOLSA (Pricing Engine - A4)
-- ══════════════════════════════════════════════
CREATE TABLE precios_bolsa (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  precio_ice_usd_lb     DECIMAL(8,4) NOT NULL,   -- Contrato C, ICE
  diferencial_colombia  DECIMAL(6,4) DEFAULT 0.30,
  diferencial_huila     DECIMAL(6,4) DEFAULT 0.10,
  tasa_trm              DECIMAL(10,2),            -- COP/USD
  timestamp             DATETIME     DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- COMPRADORES
-- ══════════════════════════════════════════════
CREATE TABLE compradores (
  id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  nombre     VARCHAR(100) NOT NULL,
  empresa    VARCHAR(150),
  sitio_web  VARCHAR(200),
  pais       VARCHAR(80),
  segmento   ENUM('importador','tostadora','cafeteria','retail','otro'),
  whatsapp   VARCHAR(20)  UNIQUE,
  email      VARCHAR(100),
  score_lead TINYINT      DEFAULT 0,   -- 0-100, calculado por Lead Scoring (A3)
  activo     BOOLEAN      DEFAULT TRUE,
  created_at DATETIME     DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- OFERTAS
-- ══════════════════════════════════════════════
CREATE TABLE ofertas (
  id                  VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  lote_id             VARCHAR(36) NOT NULL REFERENCES lotes(id),
  comprador_id        VARCHAR(36) NOT NULL REFERENCES compradores(id),
  precio_ofertado_usd DECIMAL(10,4),
  incoterm            ENUM('EXW','FOB','CIF') DEFAULT 'FOB',
  cantidad_kg         DECIMAL(10,2),
  estado              ENUM('pendiente','aceptada','rechazada','expirada') DEFAULT 'pendiente',
  notas               TEXT,
  created_at          DATETIME    DEFAULT NOW(),
  updated_at          DATETIME    ON UPDATE NOW()
);

-- ══════════════════════════════════════════════
-- MUESTRAS
-- ══════════════════════════════════════════════
CREATE TABLE muestras (
  id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  lote_id      VARCHAR(36) NOT NULL REFERENCES lotes(id),
  comprador_id VARCHAR(36) NOT NULL REFERENCES compradores(id),
  direccion    TEXT,
  tracking     VARCHAR(100),
  estado       ENUM('solicitada','preparando','enviada','entregada') DEFAULT 'solicitada',
  created_at   DATETIME    DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- WEBHOOK LOGS (igual que bardj-ai)
-- ══════════════════════════════════════════════
CREATE TABLE webhook_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  tipo         ENUM('caficultor','comprador','admin') DEFAULT 'caficultor',
  from_number  VARCHAR(20),
  action       VARCHAR(50),
  raw_body     TEXT,
  parsed_json  TEXT,
  response     TEXT,
  status_code  SMALLINT,
  error        VARCHAR(500),
  duration_ms  INT,
  created_at   DATETIME DEFAULT NOW()
);
```

---

## 4. Plan de Implementación por Sprints

> **Convención:** `[ ]` pendiente · `[x]` completado · `[~]` en progreso

---

### 🟢 Sprint 0 — Setup & Infraestructura

**Objetivo:** Entorno completamente funcional. Un mensaje de WhatsApp llega al webhook y se guarda en MySQL.
**Duración estimada:** 1 semana

#### Infraestructura
- [ ] Crear repositorio GitHub con estructura base (`/api`, `/src`, `/bot`, `vercel.json`)
- [ ] Configurar proyecto en Vercel — conectar repo, activar deployments automáticos
- [ ] Provisionar base de datos MySQL (Railway o PlanetScale)
- [ ] Ejecutar schema SQL completo (sección 3 de este documento)
- [ ] Configurar variables de entorno en Vercel (ver sección 6)
- [ ] Crear `api/_lib/db.js` — helper `query()` para MySQL (patrón bardj-ai)

#### BuilderBot
- [ ] Provisionar servidor para BuilderBot (VPS Ubuntu / Railway / Render)
- [ ] Instalar BuilderBot + provider WhatsApp Business Cloud API
- [ ] Verificar que el servidor recibe mensajes de WhatsApp
- [ ] Configurar la variable `WEBHOOK_URL` apuntando a `https://[proyecto].vercel.app/api/webhook`

#### Prueba de humo Sprint 0
- [ ] Enviar "hola" por WhatsApp → BuilderBot responde → llama al webhook → `webhook_logs` registra la entrada en MySQL ✅

---

### 🟡 Sprint 1 — Co-Pilot Caficultor (A2)

**Objetivo:** Un caficultor registra su finca y un lote completo por WhatsApp. El lote queda en MySQL.
**Duración estimada:** 2 semanas

#### Webhook (`api/webhook.js`)
- [ ] Acción `REGISTRAR_PRODUCTOR` — guarda en tabla `productores`
- [ ] Acción `REGISTRAR_LOTE` — guarda en tabla `lotes` con estado `borrador`
- [ ] Acción `SUBIR_FOTO_LOTE` — recibe URL de imagen, actualiza `lotes.foto_url`
- [ ] Acción `CONSULTAR_MIS_LOTES` — retorna lotes activos del productor
- [ ] Acción `CONFIRMAR_PUBLICACION` — cambia estado a `publicado`, genera `slug` y `hash_registro`
- [ ] Logging en `webhook_logs` para todas las acciones

#### BuilderBot — Flujo Caficultor (`bot/flows/caficultor.js`)
- [ ] Paso 1: Identificación — nombre, finca, municipio (con GPS automático si disponible)
- [ ] Paso 2: Datos del lote — variedad, proceso, tipo de secado (botones interactivos)
- [ ] Paso 3: Cantidades — kilos/sacos, humedad, rendimiento (por voz o texto)
- [ ] Paso 4: Foto del grano — solicitar imagen, validar que es una foto
- [ ] Paso 5: Confirmación — resumen completo → botón "Publicar" o "Guardar borrador"
- [ ] Soporte para audios: transcripción con Whisper API → datos estructurados

#### Prueba de humo Sprint 1
- [ ] Caficultor envía audio "Tengo 12 sacos de Geisha Natural" → bot extrae datos → lote guardado en MySQL con estado `publicado` ✅

---

### 🟠 Sprint 2 — Pricing Engine (A4)

**Objetivo:** Cada lote publicado tiene un precio calculado automáticamente. El cron actualiza el precio cada 15 min.
**Duración estimada:** 1.5 semanas

#### Pricing Engine (`api/_lib/pricing.js`)
- [ ] Función `calcularPrecio(lote, precioICE, trm)` con la fórmula:
  ```
  P_final = (PrecioICE × 2.2046) + D_Colombia + D_Huila + D_Proceso + D_SCA
  ```
- [ ] Tabla de diferenciales por variedad y proceso (Geisha, Bourbon Rosado, Castillo, etc.)
- [ ] Tabla de bonos SCA (85–87 pts, 87–89 pts, 89+ pts)
- [ ] Precio mínimo garantizado (`P_min`) por variedad para proteger al productor

#### Cron de Precio (`api/cron/precio-bolsa.js`)
- [ ] Llamada a Yahoo Finance API / Barchart para obtener precio ICE Contrato C
- [ ] Llamada a API Banco de la República para TRM actualizada
- [ ] Guardar en tabla `precios_bolsa`
- [ ] Recalcular y actualizar `precio_calculado` en todos los `lotes` con estado `publicado`
- [ ] Configurar cron en `vercel.json`: `"*/15 * * * *"` → `/api/cron/precio-bolsa`

#### Acción webhook
- [ ] Acción `CONSULTAR_PRECIO` — retorna precio actual del lote con desglose (bolsa + diferenciales)
- [ ] Notificación automática al caficultor por WhatsApp cuando el precio sube/baja >5%

#### Prueba de humo Sprint 2
- [ ] Cron se ejecuta → precio ICE se actualiza en DB → lote de Geisha muestra `precio_calculado = 28.50` → caficultor recibe WhatsApp con precio actualizado ✅

---

### 🔵 Sprint 3 — Experience Hub / Link Mágico (A1 + A7)

**Objetivo:** Cada lote tiene una URL pública compartible. La ficha técnica es la herramienta de cierre comercial.
**Duración estimada:** 2 semanas

#### API
- [ ] `api/lotes/index.js` — `GET /api/lotes` con filtros (variedad, sca_min, estado)
- [ ] `api/lotes/[slug].js` — `GET /api/lotes/[slug]` — ficha completa del lote
- [ ] `api/productores/index.js` — `GET /api/productores`
- [ ] `api/productores/[id].js` — detalle del productor con storytelling

#### Frontend — Ficha pública (`src/pages/Lote.jsx`)
- [ ] Diseño premium: paleta oscura, tipografía serif, espacio generoso
- [ ] Sección hero: nombre del lote, puntaje SCA, variedad, proceso
- [ ] Mapa interactivo: Google Maps embed con coordenadas de la finca
- [ ] Perfil sensorial: notas de taza con íconos visuales (rueda de sabores simplificada)
- [ ] Precio dinámico: precio actual USD/kg + desglose EXW / FOB / CIF
- [ ] Sello de autenticidad: `hash_registro` visible como "Registro #XXXXX"
- [ ] Historia del productor: foto, nombre, storytelling
- [ ] CTA principal: botón "Solicitar muestra" → abre WhatsApp con mensaje pre-cargado
- [ ] CTA secundario: botón "Hacer oferta" → formulario modal → acción `HACER_OFERTA`
- [ ] Botón compartir: copia URL al clipboard

#### Frontend — Catálogo (`src/pages/Catalogo.jsx`)
- [ ] Grid de cards de lotes disponibles
- [ ] Filtros: variedad, SCA mínimo, proceso, rango de precio
- [ ] Coffee Matcher Quiz (4 preguntas → lotes recomendados)
- [ ] Acceso completo requiere registro de comprador

#### Prueba de humo Sprint 3
- [ ] URL `organicode.vercel.app/lote/geisha-finca-esperanza` carga la ficha completa → botón WhatsApp abre chat con mensaje "Hola, me interesa el lote Geisha Finca Esperanza" ✅

---

### 🟣 Sprint 4 — Dashboard Admin (A8 parcial)

**Objetivo:** El equipo Organicode gestiona todo desde el dashboard sin tocar la base de datos directamente.
**Duración estimada:** 2 semanas

#### Frontend — Admin (`src/pages/admin/`)
- [ ] Login con JWT — autenticación para el equipo interno
- [ ] `/admin` — resumen: lotes activos, ofertas pendientes, precio bolsa actual
- [ ] `/admin/lotes` — tabla CRUD de lotes (editar, cambiar estado, subir foto)
- [ ] `/admin/productores` — tabla CRUD de productores del Huila
- [ ] `/admin/compradores` — leads B2B registrados con score
- [ ] `/admin/ofertas` — gestión de ofertas entrantes con botón Aceptar/Rechazar
- [ ] Notificación Pusher en tiempo real: cuando llega una oferta aparece alerta en el dashboard

#### API Admin
- [ ] `api/admin/lotes.js` — CRUD protegido con JWT
- [ ] `api/admin/productores.js` — CRUD protegido
- [ ] `api/admin/ofertas.js` — gestión de ofertas
- [ ] `api/auth/login.js` — autenticación

#### Prueba de humo Sprint 4
- [ ] Comprador hace oferta por WhatsApp → dashboard admin muestra alerta Pusher en tiempo real → admin acepta → caficultor recibe notificación en WhatsApp ✅

---

### 🔴 Sprint 5 — Buyer Concierge B2B (A3 + A5)

**Objetivo:** Comprador internacional interactúa con el bot en su idioma, busca lotes, hace ofertas y recibe fichas técnicas en PDF.
**Duración estimada:** 2.5 semanas

#### Webhook Comprador (`api/webhook-buyer.js`)
- [ ] Acción `REGISTRAR_COMPRADOR` — onboarding: nombre, empresa, país, segmento
- [ ] Acción `BUSCAR_LOTES` — usa Matchmaking Engine para retornar los mejores matches
- [ ] Acción `CONSULTAR_LOTE` — ficha técnica completa de un lote específico
- [ ] Acción `SOLICITAR_MUESTRA` — crea registro en tabla `muestras`
- [ ] Acción `HACER_OFERTA` — crea registro en tabla `ofertas` + alerta Pusher al admin
- [ ] Acción `VER_MIS_PEDIDOS` — historial de muestras y lotes cerrados
- [ ] Acción `TRACK_PEDIDO` — estado del envío (integración DHL/FedEx API — Fase 2)

#### Matchmaking Engine (`api/_lib/matchmaking.js`)
- [ ] Función `calcularMatchScore(requerimiento, lote)` — score 0-100
  ```
  MatchScore = (W_calidad × FitCalidad) + (W_volumen × FitVolumen) + (W_precio × FitPrecio)
  ```
- [ ] `FitCalidad`: comparar SCA solicitado vs SCA del lote + similitud de notas sensoriales
- [ ] `FitVolumen`: verificar stock disponible vs cantidad solicitada
- [ ] `FitPrecio`: comparar presupuesto del comprador vs precio calculado del lote
- [ ] Ordenar resultados por score descendente, retornar top 3

#### BuilderBot — Flujo Comprador (`bot/flows/comprador.js`)
- [ ] Detección de idioma automática (español, inglés, alemán, coreano)
- [ ] Paso 1: Calificación del lead — empresa, país, volumen mensual
- [ ] Paso 2: Preferencias — variedad, proceso, SCA mínimo, presupuesto
- [ ] Paso 3: Presentación de matches — 3 lotes con Match Score
- [ ] Paso 4: Deep-dive en lote seleccionado — envía link mágico + PDF ficha técnica
- [ ] Paso 5: CTA — Solicitar muestra / Hacer oferta / Hablar con humano
- [ ] Smart Handoff: si score de comprador > 80 o volumen > 100 sacos → alerta al equipo comercial en WhatsApp

#### Prueba de humo Sprint 5
- [ ] Comprador en Alemania escribe en inglés "I'm looking for 20 bags of Geisha 88+ SCA" → bot responde con 3 lotes que hacen match → comprador pide muestra → registro en DB → admin ve la solicitud ✅

---

### ⚪ Sprint 6 — Pagos + Muestras (A1 completo)

**Objetivo:** Comprador paga muestras directamente desde WhatsApp o el catálogo web.
**Duración estimada:** 1.5 semanas

- [ ] Integrar Stripe para pago de muestras (USD) y lotes
- [ ] Generador de links de pago desde WhatsApp (`GENERAR_LINK_PAGO`)
- [ ] Cotizador de envío internacional (DHL API — EXW / FOB / CIF automático)
- [ ] Flujo de confirmación de pago → notificación al admin y al caficultor
- [ ] Seguimiento de envío por WhatsApp (`TRACK_PEDIDO`)

---

### 🔲 Sprint 7 — Analytics BI + Trust Hash (A8 + A6 parcial)

**Objetivo:** El equipo Organicode tiene visibilidad de métricas clave. Los lotes tienen sello de autenticidad verificable.
**Duración estimada:** 2 semanas

- [ ] `/admin/analytics` — dashboard con:
  - [ ] Conversión de leads por país y segmento
  - [ ] Precio promedio por variedad (histórico)
  - [ ] Fincas más activas y con mejor SCA
  - [ ] Tiempo promedio de cierre de negocio
  - [ ] Volumen vendido por mes
- [ ] `api/_lib/hash.js` — función `generarHashLote()` con SHA-256
- [ ] Hash visible en la ficha pública del lote como sello de registro
- [ ] Preparar estructura para migración a blockchain (mismos campos, misma lógica)

---

### 🔲 Sprint 8 — Blockchain + EUDR (A6 completo)

**Objetivo:** Trazabilidad on-chain en Polygon. Cumplimiento EUDR para exportación a Europa.
**Duración estimada:** 3 semanas

- [ ] Desplegar `OrganicodeTracker.sol` en Polygon testnet
- [ ] Función para anclar hash de lote en blockchain al momento de `CONFIRMAR_PUBLICACION`
- [ ] Integración Ethers.js en el frontend — mostrar verificación on-chain en `/lote/[slug]`
- [ ] Capas satelitales básicas: embed Google Earth en ficha de finca
- [ ] Badge "Verificado on-chain" en fichas de lote
- [ ] Certificado de No-Deforestación (EUDR): documento PDF generado con datos de la finca
- [ ] Despliegue en Polygon mainnet

---

## 5. Flujo de Datos Completo

```
CAFICULTOR (WhatsApp)
│
├─► Bot saluda → pregunta datos → caficultor responde (voz o texto)
│
├─► BuilderBot extrae entidades → llama POST /api/webhook
│       { action: "REGISTRAR_LOTE", from: "573001234567", data: {...} }
│
├─► /api/webhook valida → INSERT en MySQL `lotes` → calcularPrecio()
│
├─► Responde al bot: { ok: true, mensaje: "Precio estimado $28.50/kg" }
│
├─► Bot muestra resumen al caficultor → caficultor confirma
│
├─► /api/webhook: UPDATE lotes SET estado='publicado', slug='geisha-finca-esperanza'
│       genera hash_registro = SHA256(lote_id + timestamp)
│
├─► Vercel genera página en /lote/geisha-finca-esperanza
│
└─► Bot envía al caficultor: "✅ Tu lote está publicado. Comparte este link:
        organicode.app/lote/geisha-finca-esperanza"

────────────────────────────────────────────────

COMPRADOR (WhatsApp / Web)
│
├─► Recibe link mágico → ve ficha técnica completa sin login
│
├─► Presiona "Hacer oferta" → WhatsApp se abre con mensaje pre-cargado
│       "Hola, quiero ofertar $30/kg FOB por el lote Geisha Finca Esperanza"
│
├─► BuilderBot captura → llama POST /api/webhook-buyer
│       { action: "HACER_OFERTA", data: { lote_slug: "...", precio: 30, incoterm: "FOB" } }
│
├─► /api/webhook-buyer: INSERT en `ofertas` + trigger Pusher
│
└─► Dashboard admin recibe alerta en tiempo real → equipo acepta/rechaza

────────────────────────────────────────────────

CRON (cada 15 min — Vercel)
│
├─► GET Yahoo Finance → precio ICE Contrato C
├─► GET Banco República → TRM
├─► INSERT precios_bolsa
└─► UPDATE lotes SET precio_calculado = calcularPrecio() WHERE estado='publicado'
```

---

## 6. Variables de Entorno

Configura estas variables en Vercel (Settings → Environment Variables) y en el servidor de BuilderBot:

```bash
# ── Base de Datos MySQL ──────────────────────────
DB_HOST=
DB_PORT=3306
DB_NAME=organicode
DB_USER=
DB_PASSWORD=

# ── Pusher (notificaciones real-time) ───────────
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=us2

# ── OpenAI (Whisper + LLM) ───────────────────────
OPENAI_API_KEY=

# ── WhatsApp Business Cloud API ─────────────────
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# ── Precios de Mercado ───────────────────────────
BARCHART_API_KEY=        # Precio ICE Contrato C
BANCO_REPUBLICA_API=     # TRM COP/USD

# ── Pagos (Sprint 6) ────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# ── Auth ─────────────────────────────────────────
JWT_SECRET=

# ── Cron (Vercel) ───────────────────────────────
CRON_SECRET=             # Header de autenticación para cron jobs
```

---

## 7. Decisiones de Arquitectura

### ¿Por qué Vercel Serverless en lugar de Express tradicional?

El patrón de `api/*.js` en Vercel (idéntico al de [bardj-ai](https://github.com/royandi200/bardj-ai)) elimina la necesidad de gestionar un servidor Node.js separado para la API. Cada endpoint es una función independiente, se escala automáticamente y el deploy es instantáneo con cada push a `main`.

**Limitación conocida:** Las funciones serverless tienen un timeout máximo de 30 segundos en el plan gratuito (configurable a 300s en Pro). Para operaciones largas como generación de PDFs o procesamiento de imágenes, usar la función con `maxDuration: 30` en `vercel.json` o delegar al servidor de BuilderBot.

### ¿Por qué BuilderBot NO corre en Vercel?

BuilderBot mantiene una conexión WebSocket persistente con WhatsApp. Las funciones serverless se ejecutan y terminan — no pueden mantener conexiones persistentes. BuilderBot debe correr en un servidor dedicado (VPS, Railway, Render con plan que soporte procesos long-running).

**Flujo correcto:**
```
WhatsApp ──► BuilderBot (servidor propio, conexión persistente)
                  │
                  │ POST /api/webhook  (llamada HTTP puntual)
                  ▼
            Vercel Serverless Function (procesa y responde)
                  │
                  ▼
               MySQL
```

### ¿Por qué MySQL en lugar de PostgreSQL?

MySQL fue elegido por compatibilidad directa con el patrón de `api/_lib/db.js` del proyecto de referencia bardj-ai, y por la disponibilidad en Railway con plan gratuito. La librería `mysql2` es compatible con el helper `query()` usado en el repo de referencia. El schema es 100% portable a PostgreSQL si se necesita migrar.

### ¿Por qué SHA-256 antes de Blockchain?

El objetivo de negocio (trazabilidad creíble para compradores en Europa) se logra en el 80% con un hash SHA-256 guardado en MySQL y mostrado en la ficha pública. La blockchain agrega el 20% restante (inmutabilidad absoluta, EUDR compliance on-chain) pero requiere 3x más tiempo de desarrollo. El diseño del schema permite agregar blockchain en Sprint 8 **sin modificar ningún endpoint ni vista existente**.

---

## Estado General del Proyecto

| Sprint | Descripción | Estado | Release |
|---|---|---|---|
| S0 | Setup & Infraestructura | `[ ] Pendiente` | v0.1 |
| S1 | Co-Pilot Caficultor (A2) | `[ ] Pendiente` | v0.2 |
| S2 | Pricing Engine (A4) | `[ ] Pendiente` | v0.3 |
| S3 | Experience Hub / Link Mágico (A1+A7) | `[ ] Pendiente` | v0.4 |
| S4 | Dashboard Admin (A8 parcial) | `[ ] Pendiente` | v0.5 |
| S5 | Buyer Concierge B2B (A3+A5) | `[ ] Pendiente` | v0.6 |
| S6 | Pagos + Muestras (A1 completo) | `[ ] Pendiente` | v0.7 |
| S7 | Analytics BI + Trust Hash (A8+A6 parcial) | `[ ] Pendiente` | v0.8 |
| S8 | Blockchain + EUDR (A6 completo) | `[ ] Pendiente` | v1.0 |

---

*Documento vivo — actualizar con cada sprint. Versión inicial: Mayo 2026.*
