-- ============================================================
-- ORGANICODE — SQL SEED desde Matriz Insumo Café Huila (CSV)
-- Ejecutar en PlanetScale / Railway MySQL
-- ============================================================

-- ── 1. CAFICULTORES ────────────────────────────────────────
-- (Alexander Vásquez ya existe con id=1, se actualiza)
UPDATE caficultores SET
  vereda = 'Los Pinos',
  altitud_msnm = 1450,
  storytelling = 'El ecosistema natural de la Finca El Encanto tiene alta diversidad de cultivos como cítricos, cacao y caña de azúcar. En paralelo cuenta con cultivos de apicultura. La finca está privilegiada por fuentes de agua natural para el riego. Todo el proceso de siembra y cosecha es realizado por madres cabeza de familia y mujeres caficultoras. El café se cultiva con abonos y fertilizantes orgánicos. Los lotes mantienen la fauna y flora endémica sin tumbar bosque. La recolección la realizan hombres y mujeres provenientes de los procesos de paz, excombatientes reinsertados en el campo.',
  valores = '["organico","mujeres_caficultoras","proceso_paz","apicultura"]'
WHERE id = 1;

INSERT INTO caficultores (nombre, finca, vereda, municipio, departamento, altitud_msnm, storytelling, valores) VALUES
('Casas Montilla', 'Finca El Paisaje', 'Jordán', 'Palermo', 'Huila', 1650,
  'Finca El Paisaje es un referente de la caficultura de especialidad en Palermo. Sus cafés Castillo orgánico, Bourbon Rosado y Geisha alcanzan perfiles sensoriales de 85 a 87 puntos SCA con notas a eucalipto, vainilla y frutos rojos. La familia Montilla lleva tres generaciones produciendo café de altura en la vereda Jordán.',
  '["organico"]'),
('Café Arú', 'Finca Sinaí', 'El Moral', 'Palermo', 'Huila', 1720,
  'Café Arú nació del sueño de producir cafés honey que expresen el terroir volcánico del Huila. Su Bourbon Rosado con proceso honey es la joya de la finca: notas intensas a chocolate, miel y frutos rojos que enamoran a tostadores de Europa y Corea.',
  '["organico"]'),
('Marán Café', 'Finca La Esmeralda', 'Las Juntas', 'Palermo', 'Huila', 1580,
  'La Finca La Esmeralda de Marán Café combina tres procesos — honey, lavado y natural — para exprimir lo mejor de sus Castilla y Colombia. Sus notas a miel, frutos rojos, limoncillo y vainilla han conquistado tostadores de especialidad en América del Norte.',
  '[]'),
('Grupo Asociativo San Isidro', 'Finca Asociativa Bruselas', 'Correg. Bruselas', 'Pitalito', 'Huila', 1750,
  'El Grupo Asociativo San Isidro reúne a 40 familias caficultoras de Pitalito bajo un modelo de economía solidaria. Su Caturra lavado de alta altitude produce perfiles elegantes con notas a miel, frutos rojos y caramelo, vendidos bajo las marcas San Isidreño y Deleiza.',
  '["mujeres_caficultoras"]'),
('DYD Coffee', 'Finca Villa Diana', 'San Pedro Alto', 'Palermo', 'Huila', 1800,
  'Finca Villa Diana es hogar de cinco variedades que conviven en sus laderas: Geisha, Bourbon Rosado, Castillo, Colombia y Caturra. Bajo la marca Klamy Coffee, DYD ha logrado colocar sus lotes en ferias de especialidad en Tokio y Berlín.',
  '[]'),
('Finca La Primavera', 'La Primavera', 'Betania', 'Pitalito', 'Huila', 1900,
  'En los altos de Betania, La Primavera produce dos tesoros: Bourbon Rosado con 85.5 puntos SCA y Castillo con 85 puntos, ambos con factores de rendimiento excepcionales entre 89 y 92. Cada saco es un testimonio del cuidado artesanal que la familia dedica a sus plantas.',
  '["organico"]'),
('Enigma Café Especial', 'Finca El Porvenir', 'El Mortiño', 'Isnos', 'Huila', 1950,
  'Ubicada en el corazón del macizo colombiano, Finca El Porvenir cultiva Colombia y Castillo en suelos volcánicos únicos. Con meta de 80 cargas anuales y un proceso cuidadoso post-cosecha, sus lotes son buscados por los mejores tostadores de especialidad del mundo.',
  '["organico"]');

-- ── 2. LOTES REALES (basados en el CSV) ────────────────────
-- Lotes adicionales de Alexander Vásquez (caficultor_id = 1)
INSERT INTO lotes (caficultor_id, slug, nombre, variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, estado, fecha_cosecha, precio_calculado) VALUES
(1, 'caturra-finca-encanto-2026-01', 'Caturra El Encanto', 'Caturra', 'Lavado', 'Silo', 500, 11.50, 87.00, 84.50,
  'Panela, cítrico, chocolate amargo', 'publicado', '2026-01-15', 6.20),
(1, 'castilla-finca-encanto-2026-02', 'Castilla El Encanto', 'Castillo', 'Natural', 'Casa Elba', 400, 11.00, 88.00, 85.00,
  'Miel, frutas tropicales, nuez', 'publicado', '2026-02-10', 7.50);

-- Lotes Casas Montilla (caficultor_id = 2)
INSERT INTO lotes (caficultor_id, slug, nombre, variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, estado, fecha_cosecha, precio_calculado) VALUES
(2, 'castillo-organico-el-paisaje-2026-01', 'Castillo Orgánico El Paisaje', 'Castillo', 'Lavado', 'Silo', 450, 11.20, 89.00, 85.50,
  'Limón, nuez, chocolate', 'publicado', '2026-01-20', 8.80),
(2, 'bourbon-rosado-el-paisaje-2026-02', 'Bourbon Rosado El Paisaje', 'Bourbon Rosado', 'Natural', 'Silo', 280, 10.80, 88.50, 86.50,
  'Eucalipto, vainilla, frutos rojos, vinoso', 'publicado', '2026-02-05', 12.40);

-- Lotes Café Arú (caficultor_id = 3)
INSERT INTO lotes (caficultor_id, slug, nombre, variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, estado, fecha_cosecha, precio_calculado) VALUES
(3, 'bourbon-rosado-sinai-honey-2026-01', 'Bourbon Rosado Sinaí Honey', 'Bourbon Rosado', 'Honey', 'Silo', 360, 11.00, 90.00, 86.00,
  'Chocolate, miel, frutos rojos, limoncillo', 'publicado', '2026-02-18', 11.20),
(3, 'colombia-sinai-lavado-2026-01', 'Colombia Sinaí Lavado', 'Colombia', 'Lavado', 'Silo', 420, 11.50, 87.50, 85.00,
  'Limón, limoncillo, miel, caramelo', 'publicado', '2026-01-28', 7.90);

-- Lotes Marán Café (caficultor_id = 4)
INSERT INTO lotes (caficultor_id, slug, nombre, variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, estado, fecha_cosecha, precio_calculado) VALUES
(4, 'castilla-maran-honey-2026-01', 'Castilla Marán Honey', 'Castillo', 'Honey', 'Silo', 380, 11.30, 88.00, 84.50,
  'Miel, vainilla, limoncillo, frutos rojos', 'publicado', '2026-02-25', 7.20);

-- Lotes Grupo San Isidro (caficultor_id = 5)
INSERT INTO lotes (caficultor_id, slug, nombre, variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, estado, fecha_cosecha, precio_calculado) VALUES
(5, 'caturra-san-isidro-lavado-2026-01', 'Caturra San Isidro Lavado', 'Caturra', 'Lavado', 'Silo', 600, 11.20, 87.00, 85.00,
  'Miel, frutos rojos, limoncillo, caramelo', 'publicado', '2026-03-05', 7.50);

-- Lotes Finca La Primavera (caficultor_id = 7)
INSERT INTO lotes (caficultor_id, slug, nombre, variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, estado, fecha_cosecha, precio_calculado) VALUES
(7, 'bourbon-rosado-primavera-2026-01', 'Bourbon Rosado La Primavera', 'Bourbon Rosado', 'Natural', 'Silo', 240, 10.90, 91.00, 85.50,
  'Durazno, panela, flores, frutos rojos', 'publicado', '2026-03-10', 11.80),
(7, 'castillo-primavera-2026-01', 'Castillo La Primavera', 'Castillo', 'Lavado', 'Silo', 300, 11.40, 89.00, 85.00,
  'Caramelo, nuez, chocolate suave', 'publicado', '2026-02-20', 8.10);

-- ── 3. VERIFICACIÓN ─────────────────────────────────────────
SELECT COUNT(*) AS total_caficultores FROM caficultores;
SELECT COUNT(*) AS total_lotes FROM lotes;
SELECT l.nombre, l.variedad, l.sca_score, c.nombre AS caficultor
FROM lotes l JOIN caficultores c ON c.id = l.caficultor_id
ORDER BY l.sca_score DESC;
