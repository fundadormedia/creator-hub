import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Platform = 'YouTube' | 'Instagram' | 'TikTok' | 'Twitter' | 'LinkedIn'
export type Status = 'borrador' | 'en_produccion' | 'programado' | 'publicado'
export type Priority = 'Alta' | 'Media' | 'Baja'

export interface Content {
  id: string
  title: string
  platform: Platform
  format: string
  category: string
  status: Status
  date: string
  views: number
  likes: number
  is_sponsor: boolean
}

export interface Idea {
  id: string
  title: string
  description: string
  platform: Platform
  priority: Priority
  created_at: string
}

export interface Income {
  id: string
  month: string
  year: number
  amount: number
  source: 'organic' | 'sponsor' | 'affiliate'
}

export interface Brand {
  id: string
  name: string
  platform: Platform
  amount: number
  status: 'activo' | 'pendiente' | 'completado'
  delivery_date: string
}

export interface Affiliate {
  id: string
  name: string
  status: 'activo' | 'pausado'
  clicks: number
  conversions: number
  commission: string
  total_earned: number
}

export interface IncomeChartData {
  mes: string
  organico: number
  sponsor: number
  afiliados: number
}

const MONTH_ORDER: Record<string, number> = {
  Ene: 1, Feb: 2, Mar: 3, Abr: 4, May: 5, Jun: 6,
  Jul: 7, Ago: 8, Sep: 9, Oct: 10, Nov: 11, Dic: 12,
}

export function transformIncomeToChart(incomes: Income[]): IncomeChartData[] {
  const map = new Map<string, { data: IncomeChartData; year: number; monthIdx: number }>()
  for (const row of incomes) {
    const key = `${row.year}-${row.month}`
    if (!map.has(key)) {
      map.set(key, {
        data: { mes: row.month, organico: 0, sponsor: 0, afiliados: 0 },
        year: row.year,
        monthIdx: MONTH_ORDER[row.month] ?? 0,
      })
    }
    const entry = map.get(key)!
    if (row.source === 'organic') entry.data.organico = row.amount
    else if (row.source === 'sponsor') entry.data.sponsor = row.amount
    else if (row.source === 'affiliate') entry.data.afiliados = row.amount
  }
  return Array.from(map.values())
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.monthIdx - b.monthIdx))
    .map((e) => e.data)
}
