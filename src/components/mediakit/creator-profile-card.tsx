'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'

type Network = 'instagram' | 'tiktok' | 'youtube'

const NETWORKS: { id: Network; label: string; handlePh: string; followersPh: string }[] = [
  { id: 'instagram', label: 'Instagram', handlePh: '@sofilopez', followersPh: '80K seguidores' },
  { id: 'tiktok', label: 'TikTok', handlePh: '@sofilopez', followersPh: '200K seguidores' },
  { id: 'youtube', label: 'YouTube', handlePh: '@sofilopez', followersPh: '25K suscriptores' },
]

interface Social {
  handle: string
  followers: string
}

const emptySocial = (): Social => ({ handle: '', followers: '' })

/** Ficha del creador: foto, nombre, bio, categorías y redes. Se llena una vez. */
export function CreatorProfileCard() {
  const [avatar, setAvatar] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [categoryDraft, setCategoryDraft] = useState('')
  const [socials, setSocials] = useState<Record<Network, Social>>({
    instagram: emptySocial(),
    tiktok: emptySocial(),
    youtube: emptySocial(),
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('full_name, bio, avatar_url, mk_categories, mk_socials')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? '')
          setBio(data.bio ?? '')
          setAvatar(data.avatar_url ?? null)
          setCategories(Array.isArray(data.mk_categories) ? data.mk_categories : [])
          const s = (data.mk_socials ?? {}) as Partial<Record<Network, Social>>
          setSocials({
            instagram: { ...emptySocial(), ...s.instagram },
            tiktok: { ...emptySocial(), ...s.tiktok },
            youtube: { ...emptySocial(), ...s.youtube },
          })
        }
        setLoading(false)
      })
  }, [])

  function handleAvatar(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('La foto debe ser una imagen.')
      return
    }
    // Se guarda embebida en la fila del perfil, así que conviene mantenerla chica.
    if (file.size > 700 * 1024) {
      setError('La foto debe pesar menos de 700 KB.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result))
    reader.readAsDataURL(file)
  }

  function commitCategory() {
    const value = categoryDraft.trim().replace(/,$/, '')
    if (!value) return
    if (!categories.includes(value)) setCategories((prev) => [...prev, value])
    setCategoryDraft('')
  }

  function onCategoryKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitCategory()
    } else if (e.key === 'Backspace' && categoryDraft === '' && categories.length > 0) {
      setCategories((prev) => prev.slice(0, -1))
    }
  }

  function setSocial(net: Network, key: keyof Social, value: string) {
    setSocials((prev) => ({ ...prev, [net]: { ...prev[net], [key]: value } }))
  }

  async function save() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatar,
        mk_categories: categories,
        mk_socials: socials,
      })
      .not('id', 'is', null)

    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return <p className="py-8 text-center text-sm text-zinc-400">Cargando perfil…</p>
  }

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Perfil del creador
      </h2>

      <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Foto */}
        <div className="flex items-center gap-5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleAvatar(f)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800"
            aria-label="Subir foto de perfil"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Foto de perfil" className="h-full w-full object-cover" />
            ) : (
              <Camera className="mx-auto h-6 w-6 text-zinc-400 transition-colors group-hover:text-indigo-500" />
            )}
          </button>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Foto de perfil</p>
            <p className="mt-0.5 text-sm text-zinc-500">
              Una imagen cuadrada queda mejor. Se muestra circular.
            </p>
            {avatar && (
              <button
                onClick={() => setAvatar(null)}
                className="mt-1 text-xs text-zinc-400 hover:text-red-500"
              >
                Quitar foto
              </button>
            )}
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="mb-2 block font-medium text-zinc-900 dark:text-zinc-100">
            Nombre completo
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Sofía López"
            className={INPUT}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="mb-2 block font-medium text-zinc-900 dark:text-zinc-100">
            Bio corta
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Creadora de contenido lifestyle y belleza desde Buenos Aires."
            className={cn(INPUT, 'resize-none')}
          />
        </div>

        {/* Categorías */}
        <div>
          <label className="mb-2 block font-medium text-zinc-900 dark:text-zinc-100">
            Categorías / nicho
          </label>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900">
            {categories.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
              >
                {c}
                <button
                  onClick={() => setCategories((prev) => prev.filter((x) => x !== c))}
                  aria-label={`Quitar ${c}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={categoryDraft}
              onChange={(e) => setCategoryDraft(e.target.value)}
              onKeyDown={onCategoryKeyDown}
              onBlur={commitCategory}
              placeholder={categories.length === 0 ? 'Lifestyle, beauty, fashion…' : ''}
              className="min-w-[140px] flex-1 border-0 bg-transparent p-0 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
            />
          </div>
          <p className="mt-1.5 text-xs text-zinc-400">Aprieta Enter o coma para agregar.</p>
        </div>

        {/* Redes */}
        <div className="grid gap-5 md:grid-cols-2">
          {NETWORKS.map((n) => (
            <div key={n.id}>
              <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">{n.label}</p>
              <div className="space-y-2">
                <input
                  value={socials[n.id].handle}
                  onChange={(e) => setSocial(n.id, 'handle', e.target.value)}
                  placeholder={n.handlePh}
                  className={INPUT}
                />
                <input
                  value={socials[n.id].followers}
                  onChange={(e) => setSocial(n.id, 'followers', e.target.value)}
                  placeholder={n.followersPh}
                  className={INPUT}
                />
              </div>
            </div>
          ))}
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
          {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar perfil'}
        </button>
      </div>
    </section>
  )
}
