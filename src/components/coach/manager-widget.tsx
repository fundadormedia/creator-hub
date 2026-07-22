'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Sparkles, X, Wallet, BarChart3, Handshake, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'finanzas' | 'analiza' | 'negocia' | 'recomienda'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const MODES: {
  id: Mode
  label: string
  icon: React.ComponentType<{ className?: string }>
  placeholder: string
}[] = [
  { id: 'finanzas', label: 'Finanzas', icon: Wallet, placeholder: '¿Cuánto facturé este trimestre?' },
  { id: 'analiza', label: 'Analiza', icon: BarChart3, placeholder: '¿Qué formato me funciona mejor?' },
  { id: 'negocia', label: 'Negocia', icon: Handshake, placeholder: '¿Cuánto cobro por un reel?' },
  { id: 'recomienda', label: 'Recomienda', icon: Lightbulb, placeholder: '¿Qué hago esta semana?' },
]

// La entrevista inicial. Son preguntas fijas: no gastan llamadas a la IA,
// y lo que responde el creador queda guardado como contexto permanente.
const ONBOARDING: { key: string; question: string; placeholder: string }[] = [
  {
    key: 'nicho',
    question:
      '¡Hola! Soy tu manager. Antes de empezar, quiero conocerte mejor. ¿De qué trata tu contenido y cuál es tu nicho?',
    placeholder: 'Ej: Lifestyle, fitness, gastronomía…',
  },
  {
    key: 'plataformas',
    question: '¿En qué plataformas publicas y cuál es tu principal?',
    placeholder: 'Ej: TikTok e Instagram, sobre todo TikTok',
  },
  {
    key: 'audiencia',
    question: '¿Cuántos seguidores tienes en tu red principal?',
    placeholder: 'Ej: 155K en TikTok',
  },
  {
    key: 'frecuencia',
    question: '¿Con qué frecuencia publicas hoy?',
    placeholder: 'Ej: 3 videos por semana',
  },
  {
    key: 'marcas',
    question: '¿Qué tipo de marcas te interesan para colaborar?',
    placeholder: 'Ej: apps, suplementos, moda…',
  },
  {
    key: 'tarifa',
    question: '¿Cuánto cobras hoy por una pieza? Si todavía no cobras, dímelo tal cual.',
    placeholder: 'Ej: $300 por reel — o "aún no cobro"',
  },
  {
    key: 'objetivo',
    question: '¿Cuál es tu objetivo para los próximos 6 meses?',
    placeholder: 'Ej: llegar a $10K/mes con marcas',
  },
]

export function ManagerWidget() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('recomienda')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Onboarding: null mientras se consulta el perfil.
  const [onboarded, setOnboarded] = useState<boolean | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, step])

  // Al abrir por primera vez, mira si ya hizo la entrevista.
  useEffect(() => {
    if (!open || onboarded !== null) return
    supabase
      .from('profiles')
      .select('manager_onboarded')
      .maybeSingle()
      .then(({ data }) => {
        const done = Boolean(data?.manager_onboarded)
        setOnboarded(done)
        if (!done) setMessages([{ role: 'assistant', content: ONBOARDING[0].question }])
      })
  }, [open, onboarded])

  const activeMode = MODES.find((m) => m.id === mode)!
  const inOnboarding = onboarded === false
  const currentQuestion = ONBOARDING[step]

  async function finishOnboarding(finalAnswers: Record<string, string>) {
    await supabase
      .from('profiles')
      .update({ manager_profile: finalAnswers, manager_onboarded: true })
      .not('id', 'is', null)
    setOnboarded(true)
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content:
          'Listo, ya te conozco. A partir de ahora puedo responderte con tus datos reales. Elige un modo arriba y pregúntame lo que quieras.',
      },
    ])
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    // --- Modo entrevista: no llama a la IA, sólo avanza el guion ---
    if (inOnboarding) {
      const nextAnswers = { ...answers, [currentQuestion.key]: text }
      setAnswers(nextAnswers)
      setMessages((prev) => [...prev, { role: 'user', content: text }])
      setInput('')

      const nextStep = step + 1
      if (nextStep < ONBOARDING.length) {
        setStep(nextStep)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: ONBOARDING[nextStep].question },
        ])
      } else {
        await finishOnboarding(nextAnswers)
      }
      return
    }

    // --- Chat normal ---
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, messages: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Algo falló. Intenta de nuevo.')
        return
      }
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setError('No pude conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-indigo-700"
      >
        <Sparkles className="h-4 w-4" />
        Hablar con tu manager
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Cabecera */}
      <div className="flex items-center justify-between bg-indigo-600 px-4 py-3.5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold leading-tight">Tu manager</p>
            <p className="flex items-center gap-1.5 text-xs text-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              En línea ahora
            </p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Cerrar chat">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Los modos sólo aparecen cuando ya terminó la entrevista */}
      {onboarded && (
        <div className="flex gap-1 border-b border-zinc-200 p-2 dark:border-zinc-800">
          {MODES.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                title={m.label}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                  m.id === mode
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Conversación */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {onboarded === null && (
          <p className="pt-8 text-center text-sm text-zinc-400">Cargando…</p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn('flex items-end gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {m.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                M
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm',
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              M
            </div>
            <div className="rounded-2xl bg-zinc-100 px-3.5 py-2.5 text-sm text-zinc-500 dark:bg-zinc-800">
              Revisando tus datos…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 pb-2 text-xs text-red-500">{error}</p>}

      {/* Input */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                send()
              }
            }}
            disabled={onboarded === null}
            placeholder={inOnboarding ? currentQuestion.placeholder : activeMode.placeholder}
            className="flex-1 rounded-full border border-indigo-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-full bg-zinc-100 p-2.5 text-zinc-500 transition-colors hover:bg-indigo-600 hover:text-white disabled:opacity-40 dark:bg-zinc-800"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {inOnboarding && (
          <p className="mt-2 text-center text-xs text-zinc-400">
            Pregunta {step + 1} de {ONBOARDING.length}
          </p>
        )}
      </div>
    </div>
  )
}
