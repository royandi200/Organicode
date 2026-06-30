-- ============================================================
-- ORGANICODE — Migración: solicitudes_muestra recibe ahora
-- también las solicitudes de WhatsApp (antes iban a la tabla
-- huérfana `muestras`, invisible para el panel admin).
--
-- Corre cada línea suelta en phpMyAdmin (tu MySQL no soporta
-- IF NOT EXISTS en ADD COLUMN). Si alguna columna ya existe,
-- esa línea marcará "Duplicate column name" y no pasa nada —
-- las demás se crean igual.
-- ============================================================

ALTER TABLE solicitudes_muestra ADD COLUMN telefono_solicitante VARCHAR(20) NULL;
ALTER TABLE solicitudes_muestra ADD COLUMN gramos_solicitados INT NULL DEFAULT 200;
ALTER TABLE solicitudes_muestra ADD COLUMN nombre_contacto VARCHAR(150) NULL;
ALTER TABLE solicitudes_muestra ADD COLUMN email_contacto VARCHAR(150) NULL;
ALTER TABLE solicitudes_muestra ADD COLUMN direccion_entrega VARCHAR(255) NULL;
ALTER TABLE solicitudes_muestra ADD COLUMN ciudad_destino VARCHAR(100) NULL;
ALTER TABLE solicitudes_muestra ADD COLUMN pais_destino VARCHAR(100) NULL;
ALTER TABLE solicitudes_muestra ADD COLUMN zip_code VARCHAR(20) NULL;

-- Si tu tabla ya tenía columnas viejas `telefono_wa` y/o `peso_gr` de
-- cuando este endpoint usaba esos nombres, puedes opcionalmente migrar
-- esos datos a las columnas nuevas (solo si telefono_wa/peso_gr existen):
-- UPDATE solicitudes_muestra SET telefono_solicitante = telefono_wa WHERE telefono_solicitante IS NULL AND telefono_wa IS NOT NULL;
-- UPDATE solicitudes_muestra SET gramos_solicitados = peso_gr WHERE gramos_solicitados IS NULL AND peso_gr IS NOT NULL;
