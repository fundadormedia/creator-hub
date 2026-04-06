// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaKitProfile {
  nombre: string
  bio: string
  nicho: string
  email: string
  fotoUrl: string
  ubicacion: string
}

export interface YoutubeMetrics {
  enabled: boolean
  suscriptores: number
  viewsTotales: number
  viewsPromedio: number
  engagementRate: number
  paisPrincipal: string
}

export interface InstagramMetrics {
  enabled: boolean
  seguidores: number
  alcanceMensual: number
  impresiones: number
  engagementRate: number
  edadPrincipal: string
}

export interface TiktokMetrics {
  enabled: boolean
  seguidores: number
  viewsPromedio: number
  likesTotales: number
  engagementRate: number
}

export interface TwitterMetrics {
  enabled: boolean
  seguidores: number
  impresionesMensuales: number
}

export interface MediaKit {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  profile: MediaKitProfile
  platforms: {
    youtube: YoutubeMetrics
    instagram: InstagramMetrics
    tiktok: TiktokMetrics
    twitter: TwitterMetrics
  }
}

// ─── Default values ───────────────────────────────────────────────────────────

function buildDefaultKit(id: string, name: string, description: string): MediaKit {
  return {
    id,
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      nombre: 'Carlos Rodríguez',
      bio: 'Creador de contenido sobre tecnología, productividad y emprendimiento digital. Ayudo a profesionales a construir su marca personal en internet.',
      nicho: 'Tecnología & Productividad',
      email: 'hola@carlosrodriguez.dev',
      fotoUrl: '',
      ubicacion: 'Madrid, España',
    },
    platforms: {
      youtube: {
        enabled: true,
        suscriptores: 210000,
        viewsTotales: 4500000,
        viewsPromedio: 21500,
        engagementRate: 4.2,
        paisPrincipal: 'España',
      },
      instagram: {
        enabled: true,
        seguidores: 185000,
        alcanceMensual: 420000,
        impresiones: 1200000,
        engagementRate: 7.1,
        edadPrincipal: '25-34',
      },
      tiktok: {
        enabled: true,
        seguidores: 198000,
        viewsPromedio: 45000,
        likesTotales: 2800000,
        engagementRate: 8.4,
      },
      twitter: {
        enabled: false,
        seguidores: 41000,
        impresionesMensuales: 380000,
      },
    },
  }
}

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'creator-hub-media-kits'

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export function getMediaKits(): MediaKit[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MediaKit[]) : []
  } catch {
    return []
  }
}

export function getMediaKit(id: string): MediaKit | null {
  return getMediaKits().find((k) => k.id === id) ?? null
}

function persist(kits: MediaKit[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kits))
}

export function createMediaKit(name: string, description: string): MediaKit {
  const kit = buildDefaultKit(`kit-${Date.now()}`, name, description)
  persist([...getMediaKits(), kit])
  return kit
}

export function duplicateMediaKit(id: string): MediaKit | null {
  const original = getMediaKit(id)
  if (!original) return null
  const copy: MediaKit = {
    ...original,
    id: `kit-${Date.now()}`,
    name: `${original.name} (copia)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  persist([...getMediaKits(), copy])
  return copy
}

export function updateMediaKit(id: string, updates: Partial<Omit<MediaKit, 'id' | 'createdAt'>>): MediaKit | null {
  const kits = getMediaKits()
  const idx = kits.findIndex((k) => k.id === id)
  if (idx === -1) return null
  kits[idx] = { ...kits[idx], ...updates, updatedAt: new Date().toISOString() }
  persist(kits)
  return kits[idx]
}

export function deleteMediaKit(id: string): void {
  persist(getMediaKits().filter((k) => k.id !== id))
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function totalFollowers(kit: MediaKit): number {
  const p = kit.platforms
  return (
    (p.youtube.enabled ? p.youtube.suscriptores : 0) +
    (p.instagram.enabled ? p.instagram.seguidores : 0) +
    (p.tiktok.enabled ? p.tiktok.seguidores : 0) +
    (p.twitter.enabled ? p.twitter.seguidores : 0)
  )
}

export function avgEngagement(kit: MediaKit): string {
  const rates: number[] = []
  const p = kit.platforms
  if (p.youtube.enabled) rates.push(p.youtube.engagementRate)
  if (p.instagram.enabled) rates.push(p.instagram.engagementRate)
  if (p.tiktok.enabled) rates.push(p.tiktok.engagementRate)
  if (!rates.length) return '0%'
  return `${(rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1)}%`
}

export function enabledPlatformCount(kit: MediaKit): number {
  return Object.values(kit.platforms).filter((p) => p.enabled).length
}

export function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}
