'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  FileUser,
  Users,
  TrendingUp,
  Globe,
  X,
  Pencil,
} from 'lucide-react'
import {
  type MediaKit,
  getMediaKits,
  createMediaKit,
  duplicateMediaKit,
  deleteMediaKit,
  fmt,
  totalFollowers,
  avgEngagement,
  enabledPlatformCount,
  relativeDate,
} from '@/lib/mediakit-store'

// ─── Platform pill colors ─────────────────────────────────────────────────────

const platformColors: Record<string, string> = {
  youtube:  'bg-red-500/15 text-red-600 dark:text-red-400',
  instagram:'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  tiktok:   'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  twitter:  'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
}

const platformLabels: Record<string, string> = {
  youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok', twitter: 'Twitter',
}

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string, desc: string) => void
}) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim(), desc.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Nuevo Media Kit
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nombre del kit <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Kit para marcas de tecnología"
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Descripción corta
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Para qué tipo de colaboraciones está pensado..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              Crear Media Kit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Kit card ─────────────────────────────────────────────────────────────────

function KitCard({ kit, onDuplicate, onDelete }: {
  kit: MediaKit
  onDuplicate: () => void
  onDelete: () => void
}) {
  const router = useRouter()
  const followers = totalFollowers(kit)
  const engagement = avgEngagement(kit)
  const platformCount = enabledPlatformCount(kit)
  const enabledPlatforms = Object.entries(kit.platforms)
    .filter(([, v]) => v.enabled)
    .map(([k]) => k)

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-indigo-500/40 transition-colors group">
      {/* Card header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
              <FileUser className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {kit.name}
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {kit.description || 'Sin descripción'}
              </p>
            </div>
          </div>
        </div>

        {/* Platform pills */}
        {enabledPlatforms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {enabledPlatforms.map((p) => (
              <span
                key={p}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${platformColors[p]}`}
              >
                {platformLabels[p]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Users className="w-3 h-3 text-zinc-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{fmt(followers)}</p>
          <p className="text-[10px] text-zinc-400">seguidores</p>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className="w-3 h-3 text-zinc-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{engagement}</p>
          <p className="text-[10px] text-zinc-400">engagement</p>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Globe className="w-3 h-3 text-zinc-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{platformCount}</p>
          <p className="text-[10px] text-zinc-400">plataformas</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-[10px] text-zinc-400">
          Actualizado {relativeDate(kit.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => window.open(`/public/mediakit/${kit.id}`, '_blank')}
            title="Ver página pública"
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDuplicate}
            title="Duplicar"
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => router.push(`/mediakit/${kit.id}`)}
            title="Editar"
            className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Eliminar"
            className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
        <FileUser className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        Aún no tienes Media Kits
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
        Crea tu primer Media Kit para compartir tus métricas con marcas y potenciales colaboradores.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Crear mi primer Media Kit
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaKitListPage() {
  const [kits, setKits] = useState<MediaKit[]>([])
  const [showModal, setShowModal] = useState(false)

  const reload = useCallback(() => setKits(getMediaKits()), [])
  useEffect(reload, [reload])

  function handleCreate(name: string, desc: string) {
    createMediaKit(name, desc)
    reload()
    setShowModal(false)
  }

  function handleDuplicate(id: string) {
    duplicateMediaKit(id)
    reload()
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este Media Kit?')) return
    deleteMediaKit(id)
    reload()
  }

  return (
    <>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Media Kits</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {kits.length === 0
                ? 'Crea kits para compartir con marcas y colaboradores'
                : `${kits.length} kit${kits.length !== 1 ? 's' : ''} creado${kits.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Media Kit
          </button>
        </div>

        {/* Content */}
        {kits.length === 0 ? (
          <EmptyState onNew={() => setShowModal(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kits.map((kit) => (
              <KitCard
                key={kit.id}
                kit={kit}
                onDuplicate={() => handleDuplicate(kit.id)}
                onDelete={() => handleDelete(kit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  )
}
