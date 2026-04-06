export type Plataforma = 'YouTube' | 'Instagram' | 'TikTok' | 'Twitter' | 'LinkedIn'
export type Formato = 'Video' | 'Reel' | 'Post' | 'Newsletter' | 'Podcast'
export type Categoria = 'Tecnología' | 'Lifestyle' | 'Educación' | 'Entretenimiento' | 'Negocios'
export type Estado = 'borrador' | 'en_produccion' | 'programado' | 'publicado'

export interface ContentItem {
  id: string
  titulo: string
  plataforma: Plataforma
  formato: Formato
  categoria: Categoria
  estado: Estado
  fecha: string
  vistas: number
  likes: number
  comentarios: number
  ingresos: number
  sponsor: boolean
}

export interface BrandDeal {
  id: string
  marca: string
  monto: number
  estado: 'activo' | 'pendiente' | 'completado'
  fechaEntrega: string
  plataforma: Plataforma
}

export interface Idea {
  id: string
  titulo: string
  descripcion: string
  plataforma: Plataforma
  prioridad: 'Alta' | 'Media' | 'Baja'
}

export interface IncomeData {
  mes: string
  organico: number
  sponsor: number
  afiliados: number
}

export const contenido: ContentItem[] = [
  {
    id: '1',
    titulo: 'Cómo aprendí TypeScript en 30 días',
    plataforma: 'YouTube',
    formato: 'Video',
    categoria: 'Tecnología',
    estado: 'publicado',
    fecha: '2024-01-15',
    vistas: 45200,
    likes: 2100,
    comentarios: 340,
    ingresos: 520,
    sponsor: false,
  },
  {
    id: '2',
    titulo: 'Mi rutina matutina de productividad',
    plataforma: 'Instagram',
    formato: 'Reel',
    categoria: 'Lifestyle',
    estado: 'publicado',
    fecha: '2024-01-18',
    vistas: 128000,
    likes: 9800,
    comentarios: 450,
    ingresos: 350,
    sponsor: true,
  },
  {
    id: '3',
    titulo: '5 herramientas de IA que uso cada día',
    plataforma: 'TikTok',
    formato: 'Reel',
    categoria: 'Tecnología',
    estado: 'publicado',
    fecha: '2024-01-20',
    vistas: 320000,
    likes: 28000,
    comentarios: 1200,
    ingresos: 0,
    sponsor: false,
  },
  {
    id: '4',
    titulo: 'Emprendimiento digital en 2024',
    plataforma: 'LinkedIn',
    formato: 'Post',
    categoria: 'Negocios',
    estado: 'publicado',
    fecha: '2024-01-22',
    vistas: 15600,
    likes: 890,
    comentarios: 120,
    ingresos: 0,
    sponsor: false,
  },
  {
    id: '5',
    titulo: 'Guía completa de Next.js 15',
    plataforma: 'YouTube',
    formato: 'Video',
    categoria: 'Tecnología',
    estado: 'programado',
    fecha: '2024-02-01',
    vistas: 0,
    likes: 0,
    comentarios: 0,
    ingresos: 1200,
    sponsor: true,
  },
  {
    id: '6',
    titulo: 'Newsletter: Tendencias Tech Enero',
    plataforma: 'Twitter',
    formato: 'Newsletter',
    categoria: 'Tecnología',
    estado: 'publicado',
    fecha: '2024-01-28',
    vistas: 8900,
    likes: 430,
    comentarios: 65,
    ingresos: 280,
    sponsor: false,
  },
  {
    id: '7',
    titulo: 'Podcast: El futuro del trabajo remoto',
    plataforma: 'YouTube',
    formato: 'Podcast',
    categoria: 'Negocios',
    estado: 'en_produccion',
    fecha: '2024-02-05',
    vistas: 0,
    likes: 0,
    comentarios: 0,
    ingresos: 0,
    sponsor: false,
  },
  {
    id: '8',
    titulo: 'Recetas saludables para creadores',
    plataforma: 'Instagram',
    formato: 'Reel',
    categoria: 'Lifestyle',
    estado: 'programado',
    fecha: '2024-02-03',
    vistas: 0,
    likes: 0,
    comentarios: 0,
    ingresos: 0,
    sponsor: false,
  },
  {
    id: '9',
    titulo: 'Cómo monetizar tu canal de YouTube',
    plataforma: 'YouTube',
    formato: 'Video',
    categoria: 'Educación',
    estado: 'borrador',
    fecha: '2024-02-10',
    vistas: 0,
    likes: 0,
    comentarios: 0,
    ingresos: 0,
    sponsor: false,
  },
  {
    id: '10',
    titulo: 'React vs Vue en 2024',
    plataforma: 'TikTok',
    formato: 'Reel',
    categoria: 'Tecnología',
    estado: 'borrador',
    fecha: '2024-02-08',
    vistas: 0,
    likes: 0,
    comentarios: 0,
    ingresos: 0,
    sponsor: false,
  },
  {
    id: '11',
    titulo: 'Mi setup de trabajo en casa',
    plataforma: 'Instagram',
    formato: 'Post',
    categoria: 'Lifestyle',
    estado: 'publicado',
    fecha: '2024-01-25',
    vistas: 54000,
    likes: 4200,
    comentarios: 280,
    ingresos: 800,
    sponsor: true,
  },
  {
    id: '12',
    titulo: 'Inversiones para jóvenes profesionales',
    plataforma: 'LinkedIn',
    formato: 'Post',
    categoria: 'Negocios',
    estado: 'programado',
    fecha: '2024-02-06',
    vistas: 0,
    likes: 0,
    comentarios: 0,
    ingresos: 0,
    sponsor: false,
  },
  {
    id: '13',
    titulo: 'Aprender inglés siendo adulto',
    plataforma: 'YouTube',
    formato: 'Video',
    categoria: 'Educación',
    estado: 'en_produccion',
    fecha: '2024-02-12',
    vistas: 0,
    likes: 0,
    comentarios: 0,
    ingresos: 600,
    sponsor: true,
  },
  {
    id: '14',
    titulo: 'Top 10 libros de finanzas personales',
    plataforma: 'TikTok',
    formato: 'Reel',
    categoria: 'Educación',
    estado: 'publicado',
    fecha: '2024-01-30',
    vistas: 215000,
    likes: 18500,
    comentarios: 920,
    ingresos: 0,
    sponsor: false,
  },
  {
    id: '15',
    titulo: 'El problema con las redes sociales',
    plataforma: 'Twitter',
    formato: 'Post',
    categoria: 'Entretenimiento',
    estado: 'borrador',
    fecha: '2024-02-15',
    vistas: 0,
    likes: 0,
    comentarios: 0,
    ingresos: 0,
    sponsor: false,
  },
]

export const metricasMensuales = {
  publicadosEsteMes: 7,
  ratioOrganico: 68,
  ratioSponsor: 32,
  proximaEntrega: {
    titulo: 'Guía completa de Next.js 15',
    fecha: '2024-02-01',
  },
}

export const ingresosData: IncomeData[] = [
  { mes: 'Ago', organico: 1200, sponsor: 800, afiliados: 340 },
  { mes: 'Sep', organico: 1450, sponsor: 1200, afiliados: 420 },
  { mes: 'Oct', organico: 1800, sponsor: 900, afiliados: 510 },
  { mes: 'Nov', organico: 2100, sponsor: 1500, afiliados: 680 },
  { mes: 'Dic', organico: 2800, sponsor: 2200, afiliados: 920 },
  { mes: 'Ene', organico: 2350, sponsor: 1800, afiliados: 750 },
]

export const brandDeals: BrandDeal[] = [
  {
    id: '1',
    marca: 'TechCorp Pro',
    monto: 1200,
    estado: 'activo',
    fechaEntrega: '2024-02-01',
    plataforma: 'YouTube',
  },
  {
    id: '2',
    marca: 'FitLife App',
    monto: 350,
    estado: 'completado',
    fechaEntrega: '2024-01-18',
    plataforma: 'Instagram',
  },
  {
    id: '3',
    marca: 'DevTools Suite',
    monto: 600,
    estado: 'activo',
    fechaEntrega: '2024-02-12',
    plataforma: 'YouTube',
  },
  {
    id: '4',
    marca: 'HomeOffice Co',
    monto: 800,
    estado: 'completado',
    fechaEntrega: '2024-01-25',
    plataforma: 'Instagram',
  },
  {
    id: '5',
    marca: 'FinanceApp',
    monto: 450,
    estado: 'pendiente',
    fechaEntrega: '2024-02-20',
    plataforma: 'TikTok',
  },
]

export const ideas: Idea[] = [
  {
    id: '1',
    titulo: 'Serie: Construyendo un SaaS desde cero',
    descripcion: 'Documentar el proceso completo de crear y lanzar un producto SaaS, desde la idea hasta los primeros 100 clientes.',
    plataforma: 'YouTube',
    prioridad: 'Alta',
  },
  {
    id: '2',
    titulo: 'Día en la vida de un creador de contenido',
    descripcion: 'Mostrar cómo es un día típico trabajando desde casa como creador full-time.',
    plataforma: 'Instagram',
    prioridad: 'Media',
  },
  {
    id: '3',
    titulo: 'Comparativa: Notion vs Obsidian vs Roam',
    descripcion: 'Análisis detallado de las mejores herramientas de gestión de conocimiento personal.',
    plataforma: 'YouTube',
    prioridad: 'Alta',
  },
  {
    id: '4',
    titulo: 'Cómo conseguir tu primer sponsor',
    descripcion: 'Guía práctica para creators con menos de 10K seguidores para conseguir patrocinios.',
    plataforma: 'TikTok',
    prioridad: 'Alta',
  },
  {
    id: '5',
    titulo: 'Mi stack tecnológico en 2024',
    descripcion: 'Las herramientas y tecnologías que uso para crear contenido y gestionar mi negocio digital.',
    plataforma: 'Twitter',
    prioridad: 'Baja',
  },
  {
    id: '6',
    titulo: 'Newsletter: Herramientas de productividad',
    descripcion: 'Curación de las mejores herramientas de productividad descubiertas el mes pasado.',
    plataforma: 'Twitter',
    prioridad: 'Media',
  },
]
