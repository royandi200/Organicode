-- ============================================================
-- ORGANICODE — SEED COMPLETO v2
-- Fuente: Matriz Insumo Café Huila (CSV) + Documento General IA
-- Ejecutar en PlanetScale / Railway MySQL
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. LIMPIAR DATOS ANTERIORES (orden correcto por FK)
-- ──────────────────────────────────────────────────────────────
DELETE FROM lotes     WHERE caficultor_id >= 1;
DELETE FROM caficultores WHERE id >= 1;

-- ──────────────────────────────────────────────────────────────
-- 2. RESET AUTO_INCREMENT
-- ──────────────────────────────────────────────────────────────
ALTER TABLE caficultores AUTO_INCREMENT = 1;
ALTER TABLE lotes        AUTO_INCREMENT = 1;

-- ──────────────────────────────────────────────────────────────
-- 3. CAFICULTORES (8 productores reales del CSV)
-- GPS: coordenadas reales de cada municipio Huila
-- ──────────────────────────────────────────────────────────────
INSERT INTO caficultores
  (nombre, finca, vereda, municipio, departamento,
   gps_lat, gps_lng, altitud_msnm, whatsapp, email, storytelling, activo)
VALUES

-- #1 Alexander Vásquez — Baraya, Huila
(
  'Alexander Vásquez',
  'El Encanto',
  'Los Pinos',
  'Baraya',
  'Huila',
  2.9928, -75.0614,
  1420,
  '+573001111101',
  'alexander@fincaelencanto.co',
  'El ecosistema natural de la Finca El Encanto tiene alta diversidad de cultivos como cítricos, cacao y caña de azúcar. En paralelo cuenta con colmenas de apicultura que polinizan naturalmente cada planta. La finca está privilegiada por fuentes de agua natural que nacen a metros de los cafetos. Todo el proceso de siembra y cosecha es realizado por madres cabeza de familia y mujeres caficultoras pertenecientes a la asociación local. El café se cultiva con abonos 100 % orgánicos y los lotes mantienen la fauna y flora endémica sin talar un solo árbol. La recolección la realizan hombres y mujeres provenientes de procesos de paz, excombatientes reinsertados con orgullo en el campo del Huila.',
  1
),

-- #2 Casas Montilla — Palermo, Huila
(
  'Casas Montilla',
  'El Paisaje',
  'Jordán',
  'Palermo',
  'Huila',
  2.8953, -75.4317,
  1660,
  '+573002222202',
  'info@casasmontilla.co',
  'Tres generaciones de la familia Montilla han cultivado café en las laderas de Palermo. Finca El Paisaje es referente de especialidad en el Huila: su Castillo orgánico, Bourbon Rosado y Geisha alcanzan perfiles de 85 a 87 puntos SCA con notas a eucalipto, vainilla y frutos rojos vinosos. El suelo volcánico de la vereda Jordán, a 1.660 msnm, regala una acidez y cuerpo imposibles de replicar en cualquier otra región del planeta.',
  1
),

-- #3 Café Arú — Palermo, Huila
(
  'Café Arú',
  'Sinaí',
  'El Moral',
  'Palermo',
  'Huila',
  2.8720, -75.4198,
  1720,
  '+573003333303',
  'contacto@cafearú.co',
  'Café Arú nació del sueño de producir honeys que expresen el terroir volcánico del Huila. Su Bourbon Rosado con proceso honey es la joya de la finca: notas intensas de chocolate, miel de caña y frutos rojos maduros que enamoran a tostadores de Europa y Corea. La finca Sinaí, en la vereda El Moral, opera con secado en silo de temperatura controlada para lograr la consistencia que exige el mercado de especialidad.',
  1
),

-- #4 Marán Café — Palermo, Huila
(
  'Marán Café',
  'La Esmeralda',
  'Las Juntas',
  'Palermo',
  'Huila',
  2.8604, -75.4450,
  1580,
  '+573004444404',
  'maran@cafemaran.co',
  'La Finca La Esmeralda combina tres procesos —honey, lavado y natural— para exprimir lo mejor de Castilla y Colombia. Sus notas a miel, frutos rojos, limoncillo y vainilla han conquistado a tostadores boutique de América del Norte. La familia Marán cree que la trazabilidad no es un diferencial sino una obligación moral con el comprador y con la tierra.',
  1
),

-- #5 Grupo Asociativo San Isidro — Pitalito, Huila
(
  'Grupo Asociativo San Isidro',
  'Asociativa Bruselas',
  'Correg. Bruselas',
  'Pitalito',
  'Huila',
  1.8482, -76.0514,
  1750,
  '+573005555505',
  'sanisidro@gruposanisidro.co',
  '40 familias caficultoras de Pitalito unidas bajo economía solidaria. Su Caturra lavado de alta altitud produce perfiles elegantes con notas a miel, frutos rojos y caramelo, vendidos bajo las marcas San Isidreño y Deleiza. Cada cosecha es una celebración comunitaria donde la calidad se mide en taza y el éxito se distribuye de forma equitativa entre todos los socios.',
  1
),

-- #6 DYD Coffee — Palermo, Huila
(
  'DYD Coffee',
  'Villa Diana',
  'San Pedro Alto',
  'Palermo',
  'Huila',
  2.9105, -75.4380,
  1800,
  '+573006666606',
  'dyd@klamy.co',
  'Finca Villa Diana es hogar de cinco variedades que conviven en sus laderas volcánicas: Geisha, Bourbon Rosado, Castillo, Colombia y Caturra. Bajo la marca Klamy Coffee, DYD ha colocado sus lotes en ferias de especialidad en Tokio y Berlín. La altitud de 1.800 msnm y el cruce de vientos amazónicos concentran los azúcares del grano generando una dulzura que los catadores internacionales describen como única.',
  1
),

-- #7 Finca La Primavera — Pitalito, Huila
(
  'Finca La Primavera',
  'La Primavera',
  'Betania',
  'Pitalito',
  'Huila',
  1.8320, -76.0289,
  1905,
  '+573007777707',
  'laprimavera@cafe.co',
  'En los altos de Betania, a casi 1.900 msnm, La Primavera produce dos tesoros: Bourbon Rosado con 85,5 puntos SCA y Castillo con 85 puntos, ambos con factores de rendimiento excepcionales entre 89 y 92. Las noches frías del sur del Huila alargan la maduración de la cereza concentrando azúcares que se traducen en una taza de dulzura y equilibrio únicos. Cada saco es testimonio del cuidado artesanal de la familia.',
  1
),

-- #8 Enigma Café Especial — Isnos, Huila
(
  'Enigma Café Especial',
  'El Porvenir',
  'El Mortiño',
  'Isnos',
  'Huila',
  1.9431, -76.1625,
  1950,
  '+573008888808',
  'enigma@enigmacafe.co',
  'Ubicada en el corazón del macizo colombiano, Finca El Porvenir cultiva Colombia y Castillo en suelos volcánicos únicos formados por sedimentos del Volcán Nevado del Huila. Con meta de 80 cargas anuales y proceso post-cosecha artesanal de control milimétrico, sus lotes son buscados por los mejores tostadores de especialidad del mundo. La altitud de 1.950 msnm garantiza una acidez brillante que define el perfil volcánico del Huila.',
  1
);

-- ──────────────────────────────────────────────────────────────
-- 4. LOTES (13 lotes con todos los campos)
-- Precio USD/kg calculado con fórmula Pricing Engine:
--   Base ICE (~$3.50/lb × 2.2046) + D_Huila + D_SCA + D_Proceso
-- ──────────────────────────────────────────────────────────────
INSERT INTO lotes
  (caficultor_id, slug, nombre, variedad, proceso, tipo_secado,
   cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales,
   foto_url, estado, fecha_cosecha, precio_calculado)
VALUES

-- ── Alexander Vásquez (id=1) ──────────────────────────────────
(1, 'reserva-volcanica-geisha-2026-03',
 'Reserva Volcánica',
 'Geisha', 'Natural', 'Casa Elba',
 840, 11.20, 88.00, 89.25,
 'Rosas, Limoncillo, Té blanco, Durazno',
 NULL, 'publicado', '2026-03-12', 30.17),

(1, 'caturra-el-encanto-2026-01',
 'Caturra El Encanto',
 'Caturra', 'Lavado', 'Silo',
 500, 11.50, 87.00, 84.50,
 'Panela, Cítrico, Chocolate amargo',
 NULL, 'publicado', '2026-01-15', 6.20),

(1, 'castilla-el-encanto-2026-02',
 'Castilla El Encanto',
 'Castillo', 'Natural', 'Casa Elba',
 400, 11.00, 88.00, 85.00,
 'Miel, Frutas tropicales, Nuez',
 NULL, 'publicado', '2026-02-10', 7.50),

-- ── Casas Montilla (id=2) ─────────────────────────────────────
(2, 'castillo-organico-el-paisaje-2026-01',
 'Castillo Orgánico El Paisaje',
 'Castillo', 'Lavado', 'Silo',
 450, 11.20, 89.00, 85.50,
 'Limón, Nuez, Chocolate oscuro',
 NULL, 'publicado', '2026-01-20', 8.80),

(2, 'bourbon-rosado-el-paisaje-2026-02',
 'Bourbon Rosado El Paisaje',
 'Bourbon Rosado', 'Natural', 'Silo',
 280, 10.80, 88.50, 86.50,
 'Eucalipto, Vainilla, Frutos rojos, Vinoso',
 NULL, 'publicado', '2026-02-05', 12.40),

-- ── Café Arú (id=3) ───────────────────────────────────────────
(3, 'bourbon-rosado-sinai-honey-2026-01',
 'Bourbon Rosado Sinaí Honey',
 'Bourbon Rosado', 'Honey', 'Silo',
 360, 11.00, 90.00, 86.00,
 'Chocolate, Miel de caña, Frutos rojos, Limoncillo',
 NULL, 'publicado', '2026-02-18', 11.20),

(3, 'colombia-sinai-lavado-2026-01',
 'Colombia Sinaí Lavado',
 'Colombia', 'Lavado', 'Silo',
 420, 11.50, 87.50, 85.00,
 'Limón, Limoncillo, Miel, Caramelo',
 NULL, 'publicado', '2026-01-28', 7.90),

-- ── Marán Café (id=4) ─────────────────────────────────────────
(4, 'castilla-maran-honey-2026-01',
 'Castilla Marán Honey',
 'Castillo', 'Honey', 'Silo',
 380, 11.30, 88.00, 84.50,
 'Miel, Vainilla, Limoncillo, Frutos rojos',
 NULL, 'publicado', '2026-02-25', 7.20),

-- ── Grupo San Isidro (id=5) ───────────────────────────────────
(5, 'caturra-san-isidro-lavado-2026-01',
 'Caturra San Isidro Lavado',
 'Caturra', 'Lavado', 'Silo',
 600, 11.20, 87.00, 85.00,
 'Miel, Frutos rojos, Limoncillo, Caramelo',
 NULL, 'publicado', '2026-03-05', 7.50),

-- ── DYD Coffee (id=6) ─────────────────────────────────────────
(6, 'geisha-villa-diana-2026-01',
 'Geisha Villa Diana',
 'Geisha', 'Natural', 'Casa Elba',
 180, 10.90, 91.00, 88.50,
 'Jazmín, Frutas tropicales, Bergamota, Miel',
 NULL, 'publicado', '2026-03-01', 27.40),

(6, 'bourbon-rosado-villa-diana-2026-01',
 'Bourbon Rosado Klamy',
 'Bourbon Rosado', 'Honey', 'Silo',
 260, 11.10, 89.00, 86.00,
 'Chocolate con leche, Cereza, Panela',
 NULL, 'publicado', '2026-02-15', 10.80),

-- ── Finca La Primavera (id=7) ─────────────────────────────────
(7, 'bourbon-rosado-primavera-2026-01',
 'Bourbon Rosado La Primavera',
 'Bourbon Rosado', 'Natural', 'Silo',
 240, 10.90, 91.00, 85.50,
 'Durazno, Panela, Flores blancas, Frutos rojos',
 NULL, 'publicado', '2026-03-10', 11.80),

-- ── Enigma Café (id=8) ────────────────────────────────────────
(8, 'colombia-el-porvenir-2026-01',
 'Colombia El Porvenir',
 'Colombia', 'Lavado', 'Silo',
 520, 11.30, 88.50, 86.00,
 'Mandarina, Caramelo, Avellana, Té negro',
 NULL, 'publicado', '2026-03-08', 9.20);

-- ──────────────────────────────────────────────────────────────
-- 5. PRECIO BOLSA ACTUAL (referencia ICE NY Mayo 2026)
-- ──────────────────────────────────────────────────────────────
INSERT INTO precios_bolsa
  (precio_ice_usd_lb, diferencial_colombia, diferencial_huila, tasa_trm)
VALUES
  (3.4850, 0.30, 0.10, 4185.50);

-- ──────────────────────────────────────────────────────────────
-- 6. VERIFICACIÓN FINAL
-- ──────────────────────────────────────────────────────────────
SELECT COUNT(*) AS total_caficultores FROM caficultores;
SELECT COUNT(*) AS total_lotes        FROM lotes;
SELECT
  l.nombre        AS lote,
  l.variedad,
  l.proceso,
  l.sca_score     AS sca,
  l.precio_calculado AS usd_kg,
  c.nombre        AS caficultor,
  c.municipio,
  c.altitud_msnm  AS msnm
FROM lotes l
JOIN caficultores c ON c.id = l.caficultor_id
ORDER BY l.sca_score DESC;
