'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { User, Shield, Camera } from 'lucide-react'

const NICHES = ['Tecnología', 'Lifestyle', 'Educación', 'Entretenimiento', 'Negocios', 'Salud', 'Moda', 'Viajes', 'Gaming', 'Otro']

const INPUT =
  'w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
    </div>
  )
}

// ─── Tab 1: Mi Perfil ────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, displayName, initials } = useUser()
  const [fullName, setFullName] = useState('')
  const [niche, setNiche] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? '')
          setNiche(data.niche ?? '')
          setBio(data.bio ?? '')
          setCountry(data.country ?? '')
          setAvatarUrl(data.avatar_url ?? '')
        } else {
          // Pre-fill name from auth metadata
          setFullName((user.user_metadata?.full_name as string) ?? '')
        }
        setLoading(false)
      })
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaved(false)
    await supabase.from('profiles').upsert(
      { user_id: user.id, full_name: fullName, niche, bio, country, avatar_url: avatarUrl },
      { onConflict: 'user_id' }
    )
    // Keep auth metadata in sync
    await supabase.auth.updateUser({ data: { full_name: fullName } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const avatarInitials = fullName
    ? fullName.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
    : initials

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-700">
              <span className="text-2xl font-bold text-white">{avatarInitials}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
            <Camera className="w-3 h-3 text-zinc-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{fullName || displayName}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
          <div className="mt-2">
            <Field label="">
              <input
                className={INPUT}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="URL de foto de perfil (opcional)"
              />
            </Field>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400">Cargando perfil...</div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nombre completo">
              <input
                className={INPUT}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </Field>
            <Field label="Email" hint="Para cambiar el email ve a la pestaña Seguridad">
              <input className={INPUT} value={user?.email ?? ''} disabled />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nicho / Categoría">
              <select
                className={INPUT}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              >
                <option value="">Selecciona un nicho</option>
                {NICHES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </Field>
            <Field label="País / Ubicación">
              <input
                className={INPUT}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ej: México, España..."
              />
            </Field>
          </div>

          <Field label="Bio corta">
            <textarea
              className={INPUT + ' resize-none h-24'}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre ti y tu contenido..."
              maxLength={300}
            />
            <p className="mt-1 text-xs text-zinc-400 text-right">{bio.length}/300</p>
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                ¡Cambios guardados!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 2: Seguridad ────────────────────────────────────────────────────────

function SecurityTab() {
  const { user } = useUser()
  const router = useRouter()

  // Change password
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)

  // Change email
  const [newEmail, setNewEmail] = useState('')
  const [emailPwd, setEmailPwd] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess(false)

    if (newPwd.length < 8) {
      setPwdError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdError('Las contraseñas no coinciden')
      return
    }

    setPwdLoading(true)

    // Re-authenticate with current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: currentPwd,
    })
    if (signInError) {
      setPwdError('Contraseña actual incorrecta')
      setPwdLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) {
      setPwdError('No pudimos actualizar la contraseña. Intenta de nuevo.')
      setPwdLoading(false)
      return
    }

    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    setPwdSuccess(true)
    setPwdLoading(false)
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    setEmailSuccess(false)

    if (!newEmail.includes('@')) {
      setEmailError('Ingresa un email válido')
      return
    }

    setEmailLoading(true)

    // Re-authenticate first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: emailPwd,
    })
    if (signInError) {
      setEmailError('Contraseña incorrecta')
      setEmailLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) {
      setEmailError('No pudimos cambiar el email. Intenta de nuevo.')
      setEmailLoading(false)
      return
    }

    setNewEmail('')
    setEmailPwd('')
    setEmailSuccess(true)
    setEmailLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sectionCls = 'bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl p-6 space-y-5'

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className={sectionCls}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cambiar contraseña</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Field label="Contraseña actual">
            <input
              type="password"
              className={INPUT}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nueva contraseña">
              <input
                type="password"
                className={INPUT}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirmar nueva contraseña">
              <input
                type="password"
                className={INPUT}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </Field>
          </div>
          {pwdError && <p className="text-sm text-red-500 dark:text-red-400">{pwdError}</p>}
          {pwdSuccess && <p className="text-sm text-emerald-600 dark:text-emerald-400">¡Contraseña actualizada!</p>}
          <button
            type="submit"
            disabled={pwdLoading}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {pwdLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>

      {/* Change email */}
      <div className={sectionCls}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cambiar email</h3>
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nuevo email">
              <input
                type="email"
                className={INPUT}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nuevo@email.com"
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Confirmar con contraseña">
              <input
                type="password"
                className={INPUT}
                value={emailPwd}
                onChange={(e) => setEmailPwd(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </Field>
          </div>
          {emailError && <p className="text-sm text-red-500 dark:text-red-400">{emailError}</p>}
          {emailSuccess && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Te enviamos un email de confirmación a <strong>{newEmail}</strong>. Revisa tu bandeja.
            </p>
          )}
          <button
            type="submit"
            disabled={emailLoading}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {emailLoading ? 'Enviando...' : 'Cambiar email'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 dark:border-red-900/40 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Zona de peligro</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Al cerrar sesión tendrás que volver a iniciar sesión para acceder a tu cuenta.
        </p>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'perfil' | 'seguridad'

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'perfil',     label: 'Mi Perfil',  icon: User   },
  { id: 'seguridad',  label: 'Seguridad',  icon: Shield },
]

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil')

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Perfil</h1>
        <p className="text-sm text-zinc-500 mt-1">Gestiona tu información personal y seguridad</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
        {activeTab === 'perfil'    && <ProfileTab />}
        {activeTab === 'seguridad' && <SecurityTab />}
      </div>
    </div>
  )
}
