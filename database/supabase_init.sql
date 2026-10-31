-- ============================================================================
-- MUNDO FELINO · SCRIPT DE INICIALIZACIÓN COMPLETO PARA SUPABASE
-- Ejecutar este script directamente en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

BEGIN;

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Creación de Tablas Principales
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_subject varchar(200) UNIQUE,
  email varchar(320) UNIQUE,
  display_name varchar(160),
  role varchar(40) NOT NULL DEFAULT 'User'
    CHECK (role IN ('User','Editor','ClinicalReviewer','Admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  birth_date date,
  sex varchar(20),
  breed varchar(100),
  weight_kg numeric(5,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  sterilized boolean,
  allergies text,
  medical_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_cats_owner_id ON cats(owner_id);

CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(180) NOT NULL,
  description text,
  address text NOT NULL,
  municipality varchar(100),
  parish varchar(100),
  latitude numeric(9,6),
  longitude numeric(9,6),
  phone varchar(50),
  whatsapp varchar(50),
  website_url text,
  email varchar(320),
  opening_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  emergency_available boolean NOT NULL DEFAULT false,
  emergency_hours_verified_at timestamptz,
  status varchar(30) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending','Verified','Rejected','Inactive')),
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);
CREATE INDEX IF NOT EXISTS ix_clinics_municipality_status ON clinics(municipality, status);

CREATE TABLE IF NOT EXISTS veterinarians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
  full_name varchar(180) NOT NULL,
  professional_registration varchar(100),
  specialties text[] NOT NULL DEFAULT ARRAY[]::text[],
  verification_status varchar(30) NOT NULL DEFAULT 'Pending'
    CHECK (verification_status IN ('Pending','Verified','Rejected')),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_veterinarians_clinic_id ON veterinarians(clinic_id);

CREATE TABLE IF NOT EXISTS clinic_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  service_type varchar(100) NOT NULL,
  notes text
);

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(240) NOT NULL,
  slug varchar(260) NOT NULL UNIQUE,
  summary text,
  content text NOT NULL,
  category varchar(100) NOT NULL,
  status varchar(30) NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft','InReview','Published','Retired')),
  reviewed_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_articles_status_category ON articles(status, category);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(300) NOT NULL,
  source_url text NOT NULL,
  organization varchar(200),
  license_notes text,
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  review_status varchar(30) NOT NULL DEFAULT 'Pending'
    CHECK (review_status IN ('Pending','Approved','Rejected','Retired')),
  reviewed_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  content_hash varchar(128)
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES knowledge_sources(id) ON DELETE SET NULL,
  title varchar(300) NOT NULL,
  category varchar(100) NOT NULL,
  language varchar(12) NOT NULL DEFAULT 'es',
  version integer NOT NULL DEFAULT 1,
  status varchar(30) NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft','Approved','Retired')),
  full_text text NOT NULL,
  content_hash varchar(128) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  UNIQUE(content_hash, version)
);
CREATE INDEX IF NOT EXISTS ix_knowledge_documents_status ON knowledge_documents(status, category);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  chunk_text text NOT NULL,
  embedding_model varchar(160),
  embedding_json jsonb,
  token_estimate integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);
CREATE INDEX IF NOT EXISTS ix_knowledge_chunks_document_id ON knowledge_chunks(document_id);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  anonymous_session_hash varchar(128),
  created_at timestamptz NOT NULL DEFAULT now(),
  retention_until timestamptz,
  CHECK (user_id IS NOT NULL OR anonymous_session_hash IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  provider varchar(100) NOT NULL,
  model varchar(160) NOT NULL,
  safety_outcome varchar(50) NOT NULL,
  latency_ms integer,
  feedback varchar(30),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  entity_type varchar(100) NOT NULL,
  entity_id varchar(100),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 3. HABILITACIÓN DE SEGURIDAD (Row Level Security para acceso público de lectura)
-- ============================================================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Public read articles') THEN
    CREATE POLICY "Public read articles" ON articles FOR SELECT USING (status = 'Published');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinics' AND policyname = 'Public read clinics') THEN
    CREATE POLICY "Public read clinics" ON clinics FOR SELECT USING (status = 'Verified');
  END IF;
END $$;

-- ============================================================================
-- 4. DATOS INICIALES (SEED DATA): ARTÍCULOS EDUCATIVOS
-- ============================================================================
INSERT INTO articles (title, slug, summary, content, category, status, published_at)
VALUES
(
  'Cuándo buscar atención veterinaria urgente',
  'cuando-buscar-atencion-veterinaria',
  'Señales y síntomas graves que requieren atención médica inmediata.',
  $body$Si un gato presenta dificultad para respirar, colapso, convulsiones, sospecha de intoxicación o intenta orinar repetidamente sin producir orina, busca atención veterinaria urgente. No administres medicamentos humanos ni retrases la atención para obtener una respuesta en línea. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
  'Salud', 'Published', now()
),
(
  'Alimentación segura: qué sí y qué evitar',
  'alimentacion-segura',
  'Qué alimentos conviene mantener lejos de su plato y cómo cambiar de comida sin sorpresas.',
  $body$Los gatos son carnívoros estrictos: necesitan proteína animal y toleran mal los cambios bruscos de dieta. Si vas a cambiar de alimento, hazlo de forma gradual, mezclando ambas comidas durante varios días.

Hay alimentos que conviene mantener lejos de su plato: cebolla, ajo, cebollín, chocolate, uvas y pasas, alcohol, cafeína y masas crudas con levadura. Tampoco conviene darle huesos cocidos, lácteos en cantidad ni comida condimentada de nuestra mesa.

La cantidad diaria depende de su edad, peso y actividad, y su veterinario es quien mejor puede ajustarla. Como referencia práctica, revisa que el alimento declare proteína animal entre los primeros ingredientes y que esté formulado para su etapa de vida.

Si sospechas que comió algo de esa lista, no esperes a que aparezcan síntomas: consulta a tu veterinario o acude a una clínica. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
  'Alimentación', 'Published', now() - interval '1 hour'
),
(
  'Señales de dolor que suelen pasar desapercibidas',
  'senales-de-dolor',
  'Los gatos esconden el dolor; estos cambios pequeños avisan antes de que sea evidente.',
  $body$Los gatos esconden el dolor: es parte de su instinto de supervivencia. Por eso conviene observar cambios pequeños pero sostenidos en el tiempo.

Señales frecuentes: esconderse más de lo habitual, dejar de saltar a sus alturas de siempre, postura encorvada, orejas hacia atrás, pelo descuidado, comer menos, maullar distinto o evitar que lo toquen en una zona concreta.

El dolor dental y articular es común y pasa desapercibido. Si notas que mastica de un lado, babea, se lame una pata de forma obsesiva o camina rígido, vale la pena una revisión.

No administres analgésicos humanos: muchos son tóxicos para los gatos. Consulta a su veterinario antes de dar cualquier medicamento. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
  'Salud', 'Published', now() - interval '2 hours'
),
(
  'Primeras semanas en un hogar nuevo',
  'primeras-semanas-en-casa',
  'Cómo acompañar la adaptación de un gato adoptado sin forzar el contacto.',
  $body$Un gato nuevo necesita tiempo, espacio y rutina. Lo que para nosotros es un hogar cómodo, para él es un territorio desconocido.

Empieza con una habitación tranquila que tenga comida, agua, arenero, un escondite y una manta con olor familiar. Deja que salga a explorar a su ritmo; no lo saques a la fuerza ni invites visitas los primeros días.

Acércate con voz suave, ofrece juego con una varita y deja que sea él quien inicie el contacto. Evita cargarlo en brazos si se tensa: la confianza se construye desde abajo y con paciencia.

La adaptación puede tomar días o semanas. Si deja de comer, se esconde todo el tiempo o muestra agresividad intensa, consulta con un veterinario o con un especialista en comportamiento.$body$,
  'Comportamiento', 'Published', now() - interval '3 hours'
),
(
  'Agua e hidratación: cómo lograr que beba más',
  'agua-e-hidratacion',
  'Ideas sencillas para que tu gato tome más agua, especialmente en climas cálidos.',
  $body$Los gatos descienden de animales de zonas secas y suelen beber poco. La deshidratación leve pasa desapercibida y afecta especialmente a gatos mayores o con problemas renales.

Para estimular el consumo de agua: coloca varios recipientes lejos de la comida y del arenero, prueba fuentes de agua con corriente continua (muchos prefieren el agua en movimiento) y cambia el agua a diario.

Incluir alimento húmedo de forma regular es la forma más directa de aumentar su hidratación. Si bebe repentinamente mucha más agua de lo habitual, consulta a su veterinario: puede ser señal de problemas renales o diabetes. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
  'Alimentación', 'Published', now() - interval '4 hours'
),
(
  'Vacunación y desparasitación básica',
  'vacunacion-y-desparasitacion',
  'Calendario orientativo para mantener al día la protección de tu gato.',
  $body$La prevención empieza temprano. Los gatitos suelen iniciar su esquema de vacunación entre las 6 y 8 semanas de edad, con refuerzos durante los primeros meses y revacunación periódica según criterio veterinario.

Las vacunas habituales cubren la panleucopenia, el calicivirus y la rinotraqueítis (triple felina), además de la rabia. Dependiendo de si el gato sale o convive con otros, el veterinario puede recomendar la vacuna contra la leucemia felina.

La desparasitación interna y externa debe ser regular, incluso si no sale de casa: las pulgas y parásitos pueden llegar en nuestros zapatos o ropa. No uses productos para perros en gatos: algunos son mortales. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
  'Salud', 'Published', now() - interval '5 hours'
),
(
  'El arenero: ubicación, tipo y limpieza',
  'el-arenero-guia-practica',
  'Cómo evitar problemas de eliminación inadecuada con pautas sencillas.',
  $body$Muchos problemas de "comportamiento" con el arenero son en realidad problemas de manejo. La regla básica es tener un arenero por gato más uno adicional, ubicados en lugares tranquilos y de fácil acceso.

A la mayoría de los gatos les gusta la arena fina, aglomerante y sin perfume. Evita bandejas cerradas si notas que duda en entrar, y mantén el arenero lejos de electrodomésticos ruidosos como lavadoras.

Limpia los sólidos a diario y cambia toda la arena con regularidad. Si un gato que siempre usaba el arenero empieza a orinar fuera de forma repentina, la primera parada debe ser el veterinario: las infecciones y los cálculos urinarios causan dolor que asocian con la bandeja.$body$,
  'Comportamiento', 'Published', now() - interval '6 hours'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at;

-- ============================================================================
-- 5. DATOS INICIALES (SEED DATA): CLÍNICAS VETERINARIAS VERIFICADAS EN CARACAS
-- ============================================================================
INSERT INTO clinics (name, address, municipality, parish, phone, whatsapp, emergency_available, status, last_verified_at)
VALUES
(
  'Hospital Veterinario Docente Chacao',
  'Av. Francisco de Miranda con Calle El Metro, Chacao',
  'Chacao',
  'Chacao',
  '+582129532011',
  '+584121234567',
  true,
  'Verified',
  now() - interval '2 days'
),
(
  'Centro Médico Veterinario Baruta 24 Horas',
  'Calle Sucre, Casco Central de Baruta',
  'Baruta',
  'Baruta',
  '+582129431522',
  '+584149876543',
  true,
  'Verified',
  now() - interval '3 days'
),
(
  'Clínica Veterinaria Los Palos Grandes',
  '3ra Avenida entre 1ra y 2da Transversal, Los Palos Grandes',
  'Chacao',
  'Chacao',
  '+582122854930',
  '+584241122334',
  false,
  'Verified',
  now() - interval '1 day'
),
(
  'Atención Felina Especializada El Hatillo',
  'Calle Comercio, Pueblo de El Hatillo',
  'El Hatillo',
  'El Hatillo',
  '+582129637744',
  '+584125566778',
  true,
  'Verified',
  now() - interval '5 days'
),
(
  'Servicio Veterinario Integral Las Mercedes',
  'Av. Principal de Las Mercedes, Edif. Centro Comercial',
  'Baruta',
  'Las Mercedes',
  '+582129910044',
  '+584142233445',
  true,
  'Verified',
  now() - interval '4 days'
),
(
  'Consultorio Veterinario Sucre Este',
  'Av. Rómulo Gallegos con Av. Sanz, El Marqués',
  'Sucre',
  'Petare',
  '+582122341908',
  '+584249988776',
  false,
  'Verified',
  now() - interval '6 days'
)
ON CONFLICT DO NOTHING;

COMMIT;

