'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/use-user'
import { Sparkles, Wand2, Loader2, Fingerprint, CheckCircle2, PenLine, Copy, BookmarkPlus, CalendarDays, Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors'

const TEXTAREA = INPUT + ' resize-none'

interface VoiceProfile {
  arquetipo: string
  tono: string[]
  nivel_formalidad: string
  ritmo: string
  vocabulario_firma: string[]
  modismos_region: string
  uso_emojis: string
  estructura_hooks: string[]
  temas_pilares: string[]
  formato_tipico: string
  muestras_de_voz: string[]
  que_evita: string[]
  audiencia: string
  instruccion_para_escribir_como_el: string
}

interface PlanItem {
  dia: string
  plataforma: string
  formato: string
  categoria: string
  titulo: string
  hook: string
  objetivo: string
  notas: string
}

interface HookScore {
  score: number
  veredicto: string
  fortalezas: string[]
  debilidades: string[]
  mejoras: string[]
  razon: string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items?.map((it, i) => (
        <span
          key={i}
          className="px-2.5 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20"
        >
          {it}
        </span>
      ))}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <div className="text-sm text-zinc-800 dark:text-zinc-200">{children}</div>
    </div>
  )
}

function VoiceCard({ v }: { v: VoiceProfile }) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-zinc-200 dark:border-zinc-700">
        <Fingerprint className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Tu voz ancla</span>
        <span className="ml-auto text-xs text-zinc-400">Tu Content Coach te recordará entre sesiones</span>
      </div>

      <div className="p-5 space-y-5">
        <Row label="Arquetipo">{v.arquetipo}</Row>
        <Row label="Tono"><Chips items={v.tono} /></Row>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Row label="Formalidad">{v.nivel_formalidad}</Row>
          <Row label="Modismos / región">{v.modismos_region}</Row>
        </div>
        <Row label="Ritmo">{v.ritmo}</Row>
        <Row label="Vocabulario firma"><Chips items={v.vocabulario_firma} /></Row>
        <Row label="Temas pilares"><Chips items={v.temas_pilares} /></Row>
        <Row label="Patrones de hook">
          <ul className="list-disc pl-4 space-y-1">{v.estructura_hooks?.map((h, i) => <li key={i}>{h}</li>)}</ul>
        </Row>
        <Row label="Formato típico">{v.formato_tipico}</Row>
        <Row label="Uso de emojis">{v.uso_emojis}</Row>
        <Row label="Muestras de su voz">
          <ul className="space-y-1.5">
            {v.muestras_de_voz?.map((m, i) => (
              <li key={i} className="italic text-zinc-600 dark:text-zinc-300 border-l-2 border-indigo-400 pl-3">“{m}”</li>
            ))}
          </ul>
        </Row>
        <Row label="Audiencia">{v.audiencia}</Row>
        <Row label="Qué evita"><Chips items={v.que_evita} /></Row>
        <Row label="Instrucción para escribir como tú">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 leading-relaxed">
            {v.instruccion_para_escribir_como_el}
          </p>
        </Row>
      </div>
    </div>
  )
}

export default function StanleyPage() {
  const { user } = useUser()
  const [posts, setPosts] = useState('')
  const [niche, setNiche] = useState('')
  const [objective, setObjective] = useState('')
  const [voice, setVoice] = useState<VoiceProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadedExisting, setLoadedExisting] = useState(false)

  // Cargar la voz guardada (memoria persistente — el diferenciador)
  useEffect(() => {
    if (!user) return
    supabase
      .from('creator_voice')
      .select('voice_profile, niche, objective')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.voice_profile) {
          setVoice(data.voice_profile as VoiceProfile)
          setNiche(data.niche ?? '')
          setObjective(data.objective ?? '')
        }
        setLoadedExisting(true)
      })
  }, [user])

  async function handleExtract() {
    if (posts.trim().length < 100) return
    setError('')
    setLoading(true)

    const res = await fetch('/api/stanley', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extraer-voz', posts, niche, objective }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setError(data.error ?? 'No pude extraer tu voz')
    } else {
      setVoice(data.voiceProfile)
    }
    setLoading(false)
  }

  // ── Sombrero Copywriter ──
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState('Reel')
  const [platform, setPlatform] = useState('Instagram')
  const [goal, setGoal] = useState('Crecer')
  const [post, setPost] = useState('')
  const [writing, setWriting] = useState(false)
  const [writeError, setWriteError] = useState('')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleWrite() {
    if (topic.trim().length < 3) return
    setWriteError('')
    setPost('')
    setWriting(true)

    const res = await fetch('/api/stanley', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'escribir-post', topic, format, platform, goal }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setWriteError(data.error ?? 'No pude escribir el post')
    } else {
      setPost(data.post)
    }
    setWriting(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(post)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSaveToIdeas() {
    if (!post || !user) return
    setSaving(true)
    await supabase.from('ideas').insert({
      title: `${format}: ${topic}`,
      description: post,
      platform,
      priority: 'Alta',
      user_id: user.id,
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  // ── Sombrero Estratega ──
  const [planFocus, setPlanFocus] = useState('')
  const [postsPerWeek, setPostsPerWeek] = useState(5)
  const [plan, setPlan] = useState<PlanItem[] | null>(null)
  const [planning, setPlanning] = useState(false)
  const [planError, setPlanError] = useState('')
  const [savingPlan, setSavingPlan] = useState(false)
  const [planSaved, setPlanSaved] = useState(false)

  async function handlePlan() {
    setPlanError('')
    setPlan(null)
    setPlanSaved(false)
    setPlanning(true)

    const res = await fetch('/api/stanley', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'plan-semanal', focus: planFocus, postsPerWeek }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setPlanError(data.error ?? 'No pude armar el plan')
    } else {
      setPlan(data.plan)
    }
    setPlanning(false)
  }

  async function handleSavePlanToCalendar() {
    if (!plan || !user) return
    setSavingPlan(true)
    const today = new Date()
    const rows = plan.map((it, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      return {
        title: it.titulo,
        platform: it.plataforma,
        format: it.formato,
        category: it.categoria,
        status: 'programado',
        date: d.toISOString().split('T')[0],
        user_id: user.id,
      }
    })
    await supabase.from('content').insert(rows)
    setPlanSaved(true)
    setSavingPlan(false)
    setTimeout(() => setPlanSaved(false), 4000)
  }

  // ── Sombrero Analista ──
  const [hookText, setHookText] = useState('')
  const [hookPlatform, setHookPlatform] = useState('Instagram')
  const [scoreResult, setScoreResult] = useState<HookScore | null>(null)
  const [scoring, setScoring] = useState(false)
  const [scoreError, setScoreError] = useState('')

  async function handleScore() {
    if (hookText.trim().length < 5) return
    setScoreError('')
    setScoreResult(null)
    setScoring(true)

    const res = await fetch('/api/stanley', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'score-hook', hook: hookText, platform: hookPlatform }),
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      setScoreError(data.error ?? 'No pude analizar el hook')
    } else {
      setScoreResult(data.result)
    }
    setScoring(false)
  }

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Content Coach</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Tu Head of Content con IA. Empieza enseñándole tu voz.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-5">
        <div className="flex items-start gap-2 text-sm text-zinc-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg p-3">
          <Fingerprint className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
          <p>Pega de 5 a 10 de tus mejores posts. Tu Content Coach aprende cómo HABLAS y lo recuerda para todo lo que escriba después.</p>
        </div>

        <Field label="Tus posts (pega 5-10, sepáralos con una línea ---)">
          <textarea
            className={TEXTAREA + ' h-48'}
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
            placeholder={'Pega aquí tus captions / posts reales...\n---\nOtro post...\n---\nOtro post...'}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Tu nicho">
            <input
              className={INPUT}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ej: Finanzas personales para jóvenes"
            />
          </Field>
          <Field label="Tu objetivo">
            <input
              className={INPUT}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ej: Vender mi curso de inversión"
            />
          </Field>
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <button
          onClick={handleExtract}
          disabled={loading || posts.trim().length < 100}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? 'Analizando tu voz...' : voice ? 'Volver a analizar' : 'Extraer mi voz'}
        </button>

        {loadedExisting && voice && !loading && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tu Content Coach ya conoce tu voz. Vuelve a analizar cuando evolucione tu estilo.
          </p>
        )}
      </div>

      {voice && <VoiceCard v={voice} />}

      {/* ── Sombrero Copywriter ─────────────────────────────────────────── */}
      {voice && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-5">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Escribe en mi voz</h2>
          </div>
          <p className="text-sm text-zinc-500 -mt-2">Dime qué quieres publicar y lo escribo imitando tu voz exacta.</p>

          <Field label="¿Sobre qué quieres el post?">
            <input
              className={INPUT}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Por qué dejé mi trabajo para emprender"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Formato">
              <div className="flex flex-wrap gap-2 mt-1">
                {['Reel', 'Carrusel', 'Post estático', 'Historia'].map((f) => (
                  <Pill key={f} active={format === f} onClick={() => setFormat(f)}>{f}</Pill>
                ))}
              </div>
            </Field>
            <Field label="Plataforma">
              <div className="flex flex-wrap gap-2 mt-1">
                {['Instagram', 'TikTok', 'LinkedIn', 'YouTube'].map((pl) => (
                  <Pill key={pl} active={platform === pl} onClick={() => setPlatform(pl)}>{pl}</Pill>
                ))}
              </div>
            </Field>
            <Field label="Objetivo">
              <div className="flex flex-wrap gap-2 mt-1">
                {['Crecer', 'Vender', 'Educar', 'Conectar'].map((g) => (
                  <Pill key={g} active={goal === g} onClick={() => setGoal(g)}>{g}</Pill>
                ))}
              </div>
            </Field>
          </div>

          {writeError && <p className="text-sm text-red-500 dark:text-red-400">{writeError}</p>}

          <button
            onClick={handleWrite}
            disabled={writing || topic.trim().length < 3}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {writing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
            {writing ? 'Escribiendo en tu voz...' : 'Escribir post'}
          </button>

          {post && (
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">En tu voz</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveToIdeas}
                    disabled={saving || saved}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
                  >
                    {saved
                      ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Guardado</>
                      : <><BookmarkPlus className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar en Ideas'}</>}
                  </button>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-500 transition-colors">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
              <div className="p-4 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {post}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sombrero Estratega ──────────────────────────────────────────── */}
      {voice && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Plan de la semana</h2>
          </div>
          <p className="text-sm text-zinc-500 -mt-2">Tu Head of Content arma qué publicar cada día. Lo mandas directo a tu Calendario.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Foco de la semana (opcional)">
              <input
                className={INPUT}
                value={planFocus}
                onChange={(e) => setPlanFocus(e.target.value)}
                placeholder="Ej: lanzamiento de mi curso / crecer en TikTok"
              />
            </Field>
            <Field label="Piezas esta semana">
              <div className="flex flex-wrap gap-2 mt-1">
                {[3, 4, 5, 6, 7].map((n) => (
                  <Pill key={n} active={postsPerWeek === n} onClick={() => setPostsPerWeek(n)}>{n}</Pill>
                ))}
              </div>
            </Field>
          </div>

          {planError && <p className="text-sm text-red-500 dark:text-red-400">{planError}</p>}

          <button
            onClick={handlePlan}
            disabled={planning}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {planning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
            {planning ? 'Armando tu semana...' : 'Generar plan semanal'}
          </button>

          {plan && (
            <div className="space-y-3">
              {plan.map((it, i) => (
                <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-bold text-indigo-500">{it.dia}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{it.plataforma}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{it.formato}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">{it.objetivo}</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{it.titulo}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1"><span className="font-medium text-zinc-500">Hook:</span> {it.hook}</p>
                  {it.notas && <p className="text-xs text-zinc-400 mt-1 italic">{it.notas}</p>}
                </div>
              ))}

              <button
                onClick={handleSavePlanToCalendar}
                disabled={savingPlan || planSaved}
                className="flex items-center gap-2 px-5 py-2.5 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-60 text-sm font-medium rounded-lg transition-colors"
              >
                {planSaved
                  ? <><CheckCircle2 className="w-4 h-4" /> Guardado en Calendario</>
                  : <><CalendarDays className="w-4 h-4" /> {savingPlan ? 'Guardando...' : 'Guardar plan en Calendario'}</>}
              </button>
              {planSaved && (
                <p className="text-xs text-zinc-400">Lo verás como “programado” en tu Calendario y en Contenido, empezando hoy.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sombrero Analista ───────────────────────────────────────────── */}
      {voice && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 space-y-5">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">¿Va a pegar?</h2>
          </div>
          <p className="text-sm text-zinc-500 -mt-2">Pega un hook o idea y te digo qué tan probable es que frene el scroll — antes de grabar.</p>

          <Field label="Tu hook o idea">
            <textarea
              className={TEXTAREA + ' h-24'}
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              placeholder="Ej: Nadie te dice esto sobre ahorrar a los 20..."
            />
          </Field>

          <Field label="Plataforma">
            <div className="flex flex-wrap gap-2 mt-1">
              {['Instagram', 'TikTok', 'LinkedIn', 'YouTube'].map((pl) => (
                <Pill key={pl} active={hookPlatform === pl} onClick={() => setHookPlatform(pl)}>{pl}</Pill>
              ))}
            </div>
          </Field>

          {scoreError && <p className="text-sm text-red-500 dark:text-red-400">{scoreError}</p>}

          <button
            onClick={handleScore}
            disabled={scoring || hookText.trim().length < 5}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {scoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gauge className="w-4 h-4" />}
            {scoring ? 'Analizando...' : 'Analizar hook'}
          </button>

          {scoreResult && <ScoreCard r={scoreResult} />}
        </div>
      )}
    </div>
  )
}

function ScoreCard({ r }: { r: HookScore }) {
  const tone =
    r.score >= 90 ? { txt: 'text-emerald-500', bar: 'bg-emerald-500', label: 'Excepcional' }
    : r.score >= 70 ? { txt: 'text-indigo-500', bar: 'bg-indigo-500', label: 'Sólido' }
    : r.score >= 50 ? { txt: 'text-amber-500', bar: 'bg-amber-500', label: 'Mejorable' }
    : { txt: 'text-red-500', bar: 'bg-red-500', label: 'Flojo' }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center shrink-0">
          <span className={`text-4xl font-bold ${tone.txt}`}>{r.score}</span>
          <span className="text-sm text-zinc-400">/100</span>
        </div>
        <div className="flex-1">
          <span className={`text-xs font-semibold ${tone.txt}`}>{tone.label}</span>
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
            <div className={`h-full rounded-full transition-all ${tone.bar}`} style={{ width: `${r.score}%` }} />
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">{r.veredicto}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {r.fortalezas?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 mb-1.5">Fortalezas</p>
            <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
              {r.fortalezas.map((f, i) => <li key={i}>✓ {f}</li>)}
            </ul>
          </div>
        )}
        {r.debilidades?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-1.5">Qué lo frena</p>
            <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
              {r.debilidades.map((d, i) => <li key={i}>✗ {d}</li>)}
            </ul>
          </div>
        )}
      </div>

      {r.mejoras?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-2">Versiones más fuertes</p>
          <div className="space-y-2">
            {r.mejoras.map((m, i) => (
              <div key={i} className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                <span className="text-sm text-zinc-800 dark:text-zinc-200 flex-1">{m}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(m)}
                  className="text-zinc-400 hover:text-indigo-500 transition-colors shrink-0"
                  title="Copiar"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {r.razon && <p className="text-xs text-zinc-400 italic border-t border-zinc-100 dark:border-zinc-800 pt-3">{r.razon}</p>}
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        active
          ? 'bg-indigo-500 border-indigo-500 text-white'
          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-500'
      )}
    >
      {children}
    </button>
  )
}
