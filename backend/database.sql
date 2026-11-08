-- Script inicial para base de datos Mundo Felino
-- Tablas y datos para veterinarios y artículos

-- Crear tabla clinics (veterinarios)
CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    municipality VARCHAR(100),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    emergency_available BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'Verified',
    last_verified_at TIMESTAMP
);

-- Insertar veterinarios de prueba (Caracas)
INSERT INTO clinics (name, address, municipality, phone, whatsapp, latitude, longitude, emergency_available, status, last_verified_at) VALUES
('Clínica Veterinaria Caracas Centro', 'Av. Francisco de Miranda 123, Capuchinas', 'Baruta', '+58 212-555-0101', '+58 414-123-4567', 10.450000, -66.883333, true, 'Verified', NOW()),
('Centro Veterinario Los Palos', 'Calle Venezuela 456, Chacao', 'Chacao', '+58 212-555-0102', '+58 414-234-5678', 10.470000, -66.870000, true, 'Verified', NOW()),
('Veterinaria Simón Bolívar', 'Av. Diego de Losada 789, Chacao', 'Chacao', '+58 212-555-0103', '+58 414-345-6789', 10.465000, -66.875000, false, 'Verified', NOW()),
('Clínica Felina Altamira', 'Av. Venezuela 321, Baruta', 'Baruta', '+58 212-555-0104', '+58 414-456-7890', 10.455000, -66.880000, true, 'Verified', NOW()),
('Centro Médico Veterinario San Bernardino', 'Calle Bolívar 654, El Hatillo', 'El Hatillo', '+58 212-555-0105', '+58 414-567-8901', 10.390000, -66.960000, false, 'Verified', NOW()),
('Clínica Veterinaria Petare', 'Av. Rangel 987, Petare', 'Los Salides', '+58 212-555-0106', '+58 414-678-9012', 10.350000, -66.800000, false, 'Verified', NOW());

-- Crear tabla articles (artículos de cuidado felino)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    summary TEXT,
    content TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Published',
    published_at TIMESTAMP
);

-- Insertar artículos de cuidado felino
INSERT INTO articles (title, slug, summary, content, category, status, published_at) VALUES
('Guía completa sobre alimentación segura para gatos', 'alimentacion-segura', 'Qué alimentos son seguros y cuáles deben evitarse totalmente.', '''Los gatos son carnívoros estrictos que requieren una dieta alta en proteína animal. Alimentos TÓXICOS para gatos: cebolla, ajo, chocolate, uvas, pasas, cafeína, alcohol y plantas como lirios. Siempre alimente con comida formulada para felinos (granos comerciales) complementada con alimento húmedo para hidratación.''', 'Alimentación', 'Published', NOW()),
('Importancia del agua e hidratación en gatos', 'agua-e-hidratacion', 'Cómo incentivar a tu gato a beber más agua.', '''Los gatos tienen poca sensación de sed por naturaleza. Para mejorar la hidratación: coloca varias fuentes de agua (filtros silenciosos), cambia el agua diariamente, ofrece alimento húmedo y considera un sistema con agua en circulación.''', 'Alimentación', 'Published', NOW()),
('Señales de dolor en gatos domésticos', 'senales-de-dolor', 'Cómo identificar cuando tu gato está enfermo o con dolor.', '''Los gatos enmascaran el malestar por instinto de supervivencia. Señales de alerta: aislarse, dejar de saltar a lugares habituales, postura encorvada, evitar contacto al tacto, micción fuera del arenero, jadeo o lamido excesivo.''', 'Salud', 'Published', NOW()),
('El arenero perfecto para gatos', 'el-arenero-guia-practica', 'Ubicación, cantidad y limpieza de bandejas de arena.', '''Regla: número de gatos + 1 bandeja adicional. Coloque en sitio tranquilo lejos de comida y ruidos fuertes. Use arena aglomerante sin perfume. Limpie diariamente y cambie completamente cada 2-3 semanas.''', 'Comportamiento', 'Published', NOW()),
('Vacunación y desparasitación básica para gatos', 'vacunacion-y-desparasitacion', 'Esquemas esenciales de prevención veterinaria.', '''Triple Felina (panleucopenia, calicivirus, rinotraqueítis) + Rabia. Desparasitar cada 3 meses incluso si no sale de casa (parásitos entran por zapatos). Reparo parasitario externo mensualmente en temporada de lluvias.''', 'Salud', 'Published', NOW()),
('Primeras semanas con un gato nuevo en casa', 'primeras-semanas-en-casa', 'Cómo integrar a un gato recién adoptado.', '''Cada felino tiene sus propios tiempos. Provea refugios seguros, rascadores verticales y rutinas de juego de 10-15 min diarios. Introduzca gradualmente alimentos nuevos. Permita que se adapte al espacio antes del contacto cercano.''', 'Comportamiento', 'Published', NOW());

-- Crear tabla libraries (bibliotecas)
CREATE TABLE IF NOT EXISTS libraries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    municipality VARCHAR(100),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'Verified'
);

-- Insertar bibliotecas de prueba (Caracas)
INSERT INTO libraries (name, address, municipality, phone, whatsapp, latitude, longitude) VALUES
('Biblioteca Nacional Antonio José de Sucre', 'Av. Francisco de Miranda 123, Caracas', 'Chacao', '+58 212-555-1001', '+58 414-100-1001', 10.546726, -66.922021),
('Biblioteca Central de la Universidad Central de Venezuela', 'Av. Francisco de Miranda, Sector El Ávila', 'Chacao', '+58 212-555-1002', '+58 414-100-1002', 10.536944, -66.867778),
('Biblioteca Nacional "Rafael Urdaneta"', 'Av. Francisco de Miranda, Capuchinas', 'Chacao', '+58 212-555-1003', '+58 414-100-1003', 10.546726, -66.922021);

-- Actualizar columnas para evitar nulls (PostgreSQL permite nulls pero frontend puede fallar)
ALTER TABLE clinics ALTER COLUMN name SET NOT NULL;
ALTER TABLE articles ALTER COLUMN title SET NOT NULL;
ALTER TABLE articles ALTER COLUMN slug SET NOT NULL;
