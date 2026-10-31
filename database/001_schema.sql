-- PostgreSQL. Ejecutar como propietario de la base.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Opcional para siguiente fase: instalar pgvector en el servidor y ejecutar
-- CREATE EXTENSION IF NOT EXISTS vector;

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
CREATE INDEX IF NOT EXISTS ix_clinics_municipality_status ON clinics(municipality,status);

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
CREATE INDEX IF NOT EXISTS ix_articles_status_category ON articles(status,category);

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
 UNIQUE(content_hash,version)
);
CREATE INDEX IF NOT EXISTS ix_knowledge_documents_status ON knowledge_documents(status,category);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 document_id uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
 chunk_index integer NOT NULL,
 chunk_text text NOT NULL,
 embedding_model varchar(160),
 embedding_json jsonb,
 token_estimate integer,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(document_id,chunk_index)
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

INSERT INTO articles(title,slug,summary,content,category,status,published_at)
VALUES (
 'Cuándo buscar atención veterinaria',
 'cuando-buscar-atencion-veterinaria',
 'Señales generales que pueden requerir atención veterinaria.',
 'Si un gato presenta dificultad para respirar, colapso, convulsiones, sospecha de intoxicación o intenta orinar repetidamente sin producir orina, busca atención veterinaria urgente. No administres medicamentos humanos ni retrases la atención para obtener una respuesta en línea. Este contenido es educativo y no sustituye una evaluación profesional.',
 'Prevención y urgencias','Published',now()
) ON CONFLICT(slug) DO NOTHING;
COMMIT;
