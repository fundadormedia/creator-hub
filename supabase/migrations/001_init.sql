-- Create tables

CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform text NOT NULL,
  format text NOT NULL,
  category text NOT NULL,
  status text NOT NULL,
  date date NOT NULL,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  is_sponsor boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  platform text NOT NULL,
  priority text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  year smallint NOT NULL,
  amount integer NOT NULL,
  source text NOT NULL CHECK (source IN ('organic', 'sponsor', 'affiliate'))
);

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  platform text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL,
  delivery_date date NOT NULL
);

CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  commission text NOT NULL,
  total_earned integer NOT NULL DEFAULT 0
);

-- Seed content
INSERT INTO content (title, platform, format, category, status, date, views, likes, is_sponsor) VALUES
('Cómo aprendí TypeScript en 30 días', 'YouTube', 'Video', 'Tecnología', 'publicado', '2024-01-15', 45200, 2100, false),
('Mi rutina matutina de productividad', 'Instagram', 'Reel', 'Lifestyle', 'publicado', '2024-01-18', 128000, 9800, true),
('5 herramientas de IA que uso cada día', 'TikTok', 'Reel', 'Tecnología', 'publicado', '2024-01-20', 320000, 28000, false),
('Emprendimiento digital en 2024', 'LinkedIn', 'Post', 'Negocios', 'publicado', '2024-01-22', 15600, 890, false),
('Guía completa de Next.js 15', 'YouTube', 'Video', 'Tecnología', 'programado', '2024-02-01', 0, 0, true),
('Newsletter: Tendencias Tech Enero', 'Twitter', 'Newsletter', 'Tecnología', 'publicado', '2024-01-28', 8900, 430, false),
('Podcast: El futuro del trabajo remoto', 'YouTube', 'Podcast', 'Negocios', 'en_produccion', '2024-02-05', 0, 0, false),
('Recetas saludables para creadores', 'Instagram', 'Reel', 'Lifestyle', 'programado', '2024-02-03', 0, 0, false),
('Cómo monetizar tu canal de YouTube', 'YouTube', 'Video', 'Educación', 'borrador', '2024-02-10', 0, 0, false),
('React vs Vue en 2024', 'TikTok', 'Reel', 'Tecnología', 'borrador', '2024-02-08', 0, 0, false),
('Mi setup de trabajo en casa', 'Instagram', 'Post', 'Lifestyle', 'publicado', '2024-01-25', 54000, 4200, true),
('Inversiones para jóvenes profesionales', 'LinkedIn', 'Post', 'Negocios', 'programado', '2024-02-06', 0, 0, false),
('Aprender inglés siendo adulto', 'YouTube', 'Video', 'Educación', 'en_produccion', '2024-02-12', 0, 0, true),
('Top 10 libros de finanzas personales', 'TikTok', 'Reel', 'Educación', 'publicado', '2024-01-30', 215000, 18500, false),
('El problema con las redes sociales', 'Twitter', 'Post', 'Entretenimiento', 'borrador', '2024-02-15', 0, 0, false);

-- Seed ideas
INSERT INTO ideas (title, description, platform, priority) VALUES
('Serie: Construyendo un SaaS desde cero', 'Documentar el proceso completo de crear y lanzar un producto SaaS, desde la idea hasta los primeros 100 clientes.', 'YouTube', 'Alta'),
('Día en la vida de un creador de contenido', 'Mostrar cómo es un día típico trabajando desde casa como creador full-time.', 'Instagram', 'Media'),
('Comparativa: Notion vs Obsidian vs Roam', 'Análisis detallado de las mejores herramientas de gestión de conocimiento personal.', 'YouTube', 'Alta'),
('Cómo conseguir tu primer sponsor', 'Guía práctica para creators con menos de 10K seguidores para conseguir patrocinios.', 'TikTok', 'Alta'),
('Mi stack tecnológico en 2024', 'Las herramientas y tecnologías que uso para crear contenido y gestionar mi negocio digital.', 'Twitter', 'Baja'),
('Newsletter: Herramientas de productividad', 'Curación de las mejores herramientas de productividad descubiertas el mes pasado.', 'Twitter', 'Media');

-- Seed income (one row per source per month)
INSERT INTO income (month, year, amount, source) VALUES
('Ago', 2023, 1200, 'organic'),
('Ago', 2023, 800, 'sponsor'),
('Ago', 2023, 340, 'affiliate'),
('Sep', 2023, 1450, 'organic'),
('Sep', 2023, 1200, 'sponsor'),
('Sep', 2023, 420, 'affiliate'),
('Oct', 2023, 1800, 'organic'),
('Oct', 2023, 900, 'sponsor'),
('Oct', 2023, 510, 'affiliate'),
('Nov', 2023, 2100, 'organic'),
('Nov', 2023, 1500, 'sponsor'),
('Nov', 2023, 680, 'affiliate'),
('Dic', 2023, 2800, 'organic'),
('Dic', 2023, 2200, 'sponsor'),
('Dic', 2023, 920, 'affiliate'),
('Ene', 2024, 2350, 'organic'),
('Ene', 2024, 1800, 'sponsor'),
('Ene', 2024, 750, 'affiliate');

-- Seed brands
INSERT INTO brands (name, platform, amount, status, delivery_date) VALUES
('TechCorp Pro', 'YouTube', 1200, 'activo', '2024-02-01'),
('FitLife App', 'Instagram', 350, 'completado', '2024-01-18'),
('DevTools Suite', 'YouTube', 600, 'activo', '2024-02-12'),
('HomeOffice Co', 'Instagram', 800, 'completado', '2024-01-25'),
('FinanceApp', 'TikTok', 450, 'pendiente', '2024-02-20');

-- Seed affiliates
INSERT INTO affiliates (name, status, clicks, conversions, commission, total_earned) VALUES
('Amazon Associates', 'activo', 2840, 124, '4-10%', 420),
('Hostinger', 'activo', 1250, 38, '60%', 1140),
('Notion Pro', 'activo', 890, 67, '20%', 268),
('Coursera', 'activo', 560, 22, '45%', 495),
('NordVPN', 'pausado', 320, 11, '100%', 1210),
('Canva Pro', 'activo', 740, 49, '25%', 183);
