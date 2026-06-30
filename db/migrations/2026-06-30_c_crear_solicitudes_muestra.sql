-- ============================================================
-- ORGANICODE — Crear tabla solicitudes_muestra
-- No existía en producción (de ahí el error #1146). El panel admin
-- (api/admin/muestras.js) y el webhook (api/webhook.js) ya asumían
-- que existía con estas columnas.
-- ============================================================

CREATE TABLE solicitudes_muestra (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  lote_id               VARCHAR(36)   NOT NULL,
  comprador_id          VARCHAR(36)   NULL,
  telefono_solicitante  VARCHAR(20)   NULL,
  nombre_contacto       VARCHAR(150)  NULL,
  empresa               VARCHAR(150)  NULL,
  email_contacto        VARCHAR(150)  NULL,
  direccion_entrega     VARCHAR(255)  NULL,
  ciudad_destino        VARCHAR(100)  NULL,
  pais_destino          VARCHAR(100)  NULL,
  zip_code              VARCHAR(20)   NULL,
  gramos_solicitados    INT           NULL DEFAULT 200,
  estado                ENUM('pendiente','preparando','enviada','entregada') NOT NULL DEFAULT 'pendiente',
  numero_guia           VARCHAR(100)  NULL,
  courier               VARCHAR(100)  NULL,
  costo_envio_usd       DECIMAL(10,2) NULL,
  notas                 TEXT          NULL,
  created_at            DATETIME      DEFAULT NOW(),
  updated_at            DATETIME      ON UPDATE NOW() DEFAULT NOW(),
  INDEX idx_lote     (lote_id),
  INDEX idx_estado   (estado),
  INDEX idx_created  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
