'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, MapPin, BarChart3, Plus, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'

interface Country {
  name: string
  flag: string
  pct: number | null
}
interface AgeRow {
  range: string
  male: number | null
  female: number | null
}
interface Audience {
  engagement_rate: number | null
  gender: { male: number | null; female: number | null }
  countries: Country[]
  ages: AgeRow[]
}

const emptyAudience = (): Audience => ({
  engagement_rate: null,
  gender: { male: null, female: null },
  countries: [{ name: '', flag: '', pct: null }],
  ages: [
    { range: '13-17', male: null, female: null },
    { range: '18-24', male: null, female: null },
    { range: '25-34', male: null, female: null },
    { range: '35-44', male: null, female: null },
    { range: '45-64', male: null, female: null },
  ],
})

const num = (v: string): number | null => (v === '' ? null : Number(v))

export function AudienceCard() {
  const [userId, setUserId] = useState<string | null>(null)
  const [aud, setAud] = useState<Audience>(emptyAudience())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (!uid) {
        setLoading(false)
        return
      }
      const { data: row } = await supabase
        .from('profiles')
        .select('mk_audience')
        .eq('user_id', uid)
        .maybeSingle()
      if (row?.mk_audience) {
        const a = row.mk_audience as Partial<Audience>
        setAud({ ...emptyAudience(), ...a, gender: { ...emptyAudience().gender, ...a.gender } })
      }
      setLoading(false)
    })
  }, [])

  async function save() {
    if (!userId) {
      setError('Recarga la página e intenta de nuevo.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    const { error: err } = await supabase.from('profiles').upsert(
      { user_id: userId, mk_audience: aud },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return null

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Audiencia
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Lo que más miran las marcas: quién te sigue. Sácalo de las analíticas de tu red principal.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Engagement + género */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <BarChart3 className="h-4 w-4 text-indigo-500" /> Tasa de engagement (%)
            </p>
            <input
              type="number"
              step="0.01"
              value={aud.engagement_rate ?? ''}
              onChange={(e) => setAud((p) => ({ ...p, engagement_rate: num(e.target.value) }))}
              placeholder="6.54"
              className={INPUT}
            />
          </div>
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <Users className="h-4 w-4 text-indigo-500" /> Género (%)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                value={aud.gender.male ?? ''}
                onChange={(e) =>
                  setAud((p) => ({ ...p, gender: { ...p.gender, male: num(e.target.value) } }))
                }
                placeholder="Hombre 62.5"
                className={INPUT}
              />
              <input
                type="number"
                step="0.1"
                value={aud.gender.female ?? ''}
                onChange={(e) =>
                  setAud((p) => ({ ...p, gender: { ...p.gender, female: num(e.target.value) } }))
                }
                placeholder="Mujer 37.5"
                className={INPUT}
              />
            </div>
          </div>
        </div>

        {/* Países */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <MapPin className="h-4 w-4 text-indigo-500" /> Top países
          </p>
          <div className="space-y-2">
            {aud.countries.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={c.flag}
                  onChange={(e) =>
                    setAud((p) => ({
                      ...p,
                      countries: p.countries.map((x, j) =>
                        j === i ? { ...x, flag: e.target.value } : x
                      ),
                    }))
                  }
                  placeholder="🇺🇸"
                  className={cn(INPUT, 'w-14 text-center')}
                />
                <input
                  value={c.name}
                  onChange={(e) =>
                    setAud((p) => ({
                      ...p,
                      countries: p.countries.map((x, j) =>
                        j === i ? { ...x, name: e.target.value } : x
                      ),
                    }))
                  }
                  placeholder="United States"
                  className={cn(INPUT, 'flex-1')}
                />
                <input
                  type="number"
                  step="0.1"
                  value={c.pct ?? ''}
                  onChange={(e) =>
                    setAud((p) => ({
                      ...p,
                      countries: p.countries.map((x, j) =>
                        j === i ? { ...x, pct: num(e.target.value) } : x
                      ),
                    }))
                  }
                  placeholder="%"
                  className={cn(INPUT, 'w-20')}
                />
                <button
                  onClick={() =>
                    setAud((p) => ({ ...p, countries: p.countries.filter((_, j) => j !== i) }))
                  }
                  className="shrink-0 text-zinc-400 hover:text-red-500"
                  aria-label="Quitar país"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setAud((p) => ({ ...p, countries: [...p.countries, { name: '', flag: '', pct: null }] }))
            }
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <Plus className="h-4 w-4" /> Agregar país
          </button>
        </div>

        {/* Edades */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <BarChart3 className="h-4 w-4 text-indigo-500" /> Edad por género (%)
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-[80px_1fr_1fr] gap-2 px-1 text-xs text-zinc-400">
              <span>Rango</span>
              <span>Hombre</span>
              <span>Mujer</span>
            </div>
            {aud.ages.map((a, i) => (
              <div key={a.range} className="grid grid-cols-[80px_1fr_1fr] gap-2">
                <span className="flex items-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {a.range}
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={a.male ?? ''}
                  onChange={(e) =>
                    setAud((p) => ({
                      ...p,
                      ages: p.ages.map((x, j) => (j === i ? { ...x, male: num(e.target.value) } : x)),
                    }))
                  }
                  placeholder="0"
                  className={INPUT}
                />
                <input
                  type="number"
                  step="0.1"
                  value={a.female ?? ''}
                  onChange={(e) =>
                    setAud((p) => ({
                      ...p,
                      ages: p.ages.map((x, j) => (j === i ? { ...x, female: num(e.target.value) } : x)),
                    }))
                  }
                  placeholder="0"
                  className={INPUT}
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          {saved && <Check className="h-4 w-4" />}
          {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar audiencia'}
        </button>
      </div>
    </section>
  )
}
