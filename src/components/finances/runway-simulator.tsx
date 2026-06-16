'use client'

import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'

// ── Simulador de Runway ──────────────────────────────────────────────────────
// Dinámico y editable: el creador renombra cada rubro y mueve los sliders;
// runway, net/mes, mes de quiebre y el gráfico se recalculan en vivo.
// Persiste en localStorage (no toca Supabase — es una herramienta de "qué pasaría si").

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const STORAGE_KEY = 'runway-simulator-v1'
const PROJECTION_MONTHS = 36

interface Item {
  id: string
  label: string
  amount: number
  max: number // tope del slider
}

interface State {
  capital: number
  capitalMax: number
  gastos: Item[]
  ingresos: Item[]
}

const uid = () => Math.random().toString(36).slice(2, 9)

function defaultState(): State {
  return {
    capital: 55000,
    capitalMax: 200000,
    gastos: [
      { id: uid(), label: 'Renta', amount: 4500, max: 10000 },
      { id: uid(), label: 'Servicios', amount: 500, max: 5000 },
      { id: uid(), label: 'Auto', amount: 1000, max: 5000 },
      { id: uid(), label: 'Colegio', amount: 2000, max: 8000 },
      { id: uid(), label: 'Comida', amount: 1000, max: 5000 },
      { id: uid(), label: 'Salidas', amount: 500, max: 5000 },
    ],
    ingresos: [
      { id: uid(), label: 'Retainer marca', amount: 1500, max: 20000 },
      { id: uid(), label: 'TikTok Shop', amount: 2000, max: 20000 },
      { id: uid(), label: 'Negocio propio', amount: 0, max: 30000 },
      { id: uid(), label: 'Otros ingresos', amount: 0, max: 20000 },
    ],
  }
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

// ── Fila con label editable + slider ─────────────────────────────────────────
function Row({
  item,
  onChange,
}: {
  item: Item
  onChange: (patch: Partial<Item>) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <input
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1 -ml-1 min-w-0 flex-1"
        />
        <input
          type="number"
          value={item.amount}
          onChange={(e) => onChange({ amount: Math.max(0, Number(e.target.value) || 0) })}
          className="w-24 text-right bg-transparent text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1"
        />
      </div>
      <input
        type="range"
        min={0}
        max={item.max}
        step={item.max > 10000 ? 500 : 50}
        value={Math.min(item.amount, item.max)}
        onChange={(e) => onChange({ amount: Number(e.target.value) })}
        className="w-full accent-indigo-500 cursor-pointer"
      />
    </div>
  )
}

function MetricCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub?: string
  tone?: 'danger' | 'warn' | 'normal'
}) {
  const valueColor =
    tone === 'danger' ? 'text-red-500' : tone === 'warn' ? 'text-amber-500' : 'text-zinc-900 dark:text-zinc-100'
  const subColor =
    tone === 'warn' ? 'text-amber-500' : 'text-zinc-400'
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  )
}

// ── Gráfico de agotamiento de capital ────────────────────────────────────────
function RunwayChart({ capital, net }: { capital: number; net: number }) {
  const W = 800
  const H = 240
  const padL = 8
  const padR = 8
  const padB = 24
  const padT = 8

  const series = useMemo(() => {
    const pts: number[] = []
    let cap = capital
    for (let i = 0; i <= PROJECTION_MONTHS; i++) {
      pts.push(Math.max(0, cap))
      cap += net
    }
    return pts
  }, [capital, net])

  const yMax = Math.max(capital, ...series, 1)
  const xStep = (W - padL - padR) / PROJECTION_MONTHS
  const x = (i: number) => padL + i * xStep
  const y = (v: number) => padT + (1 - v / yMax) * (H - padT - padB)

  const line = series.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const area = `${padL},${y(0)} ${line} ${x(PROJECTION_MONTHS)},${y(0)}`

  const burning = net < 0
  const stroke = burning ? '#ef4444' : '#22c55e'
  const fill = burning ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.15)'

  const now = new Date()
  const labels = []
  for (let i = 0; i <= PROJECTION_MONTHS; i += 4) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    labels.push({ i, txt: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` })
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 220 }}>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={padL} x2={W - padR} y1={padT + g * (H - padT - padB)} y2={padT + g * (H - padT - padB)} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth={1} />
      ))}
      <polygon points={area} fill={fill} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
      {labels.map((l) => (
        <text key={l.i} x={x(l.i)} y={H - 6} fontSize={11} className="fill-zinc-400" textAnchor={l.i === 0 ? 'start' : 'middle'}>
          {l.txt}
        </text>
      ))}
    </svg>
  )
}

export function RunwaySimulator() {
  const [state, setState] = useState<State>(defaultState)
  const [loaded, setLoaded] = useState(false)

  // Cargar de localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState(JSON.parse(raw))
    } catch {
      // ignorar JSON corrupto
    }
    setLoaded(true)
  }, [])

  // Guardar en localStorage
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, loaded])

  const totalGasto = state.gastos.reduce((s, g) => s + g.amount, 0)
  const totalIngreso = state.ingresos.reduce((s, i) => s + i.amount, 0)
  const net = totalIngreso - totalGasto
  const burning = net < 0
  const runwayMonths = burning ? state.capital / -net : Infinity
  const runwayDays = Math.round(runwayMonths * 30)

  const ceroEn = (() => {
    if (!burning) return '—'
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth() + Math.floor(runwayMonths), 1)
    return MONTHS[d.getMonth()]
  })()

  function patchItem(kind: 'gastos' | 'ingresos', id: string, patch: Partial<Item>) {
    setState((s) => ({
      ...s,
      [kind]: s[kind].map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))
  }

  // ── Presets / escenarios ──
  function reset() {
    setState(defaultState())
  }
  function setIngreso(label: string, amount: number) {
    setState((s) => {
      const exists = s.ingresos.some((i) => i.label === label)
      const ingresos = exists
        ? s.ingresos.map((i) => (i.label === label ? { ...i, amount } : i))
        : [...s.ingresos, { id: uid(), label, amount, max: 30000 }]
      return { ...s, ingresos }
    })
  }
  function breakevenExacto() {
    // Ajusta "Negocio propio" para que net = 0
    setState((s) => {
      const gasto = s.gastos.reduce((a, g) => a + g.amount, 0)
      const ingresoSinNegocio = s.ingresos
        .filter((i) => i.label !== 'Negocio propio')
        .reduce((a, i) => a + i.amount, 0)
      const necesario = Math.max(0, gasto - ingresoSinNegocio)
      return {
        ...s,
        ingresos: s.ingresos.map((i) =>
          i.label === 'Negocio propio' ? { ...i, amount: necesario, max: Math.max(i.max, necesario) } : i
        ),
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Runway"
          value={burning ? `${runwayMonths.toFixed(1)} meses` : '∞'}
          sub={burning ? `${runwayDays} días` : 'flujo positivo'}
          tone={burning ? 'warn' : 'normal'}
        />
        <MetricCard label="Net / mes" value={fmt(net)} sub="ingreso − gasto" tone={burning ? 'danger' : 'normal'} />
        <MetricCard label="Total gasto" value={fmt(totalGasto)} sub={`suma ${state.gastos.length} rubros`} />
        <MetricCard label="Cero en" value={ceroEn} sub={burning ? 'capital llega a $0' : 'no se agota'} />
      </div>

      {/* Columnas editables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Gastos / mes</h3>
          {state.gastos.map((g) => (
            <Row key={g.id} item={g} onChange={(p) => patchItem('gastos', g.id, p)} />
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Capital & ingresos</h3>
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Capital inicial</span>
              <input
                type="number"
                value={state.capital}
                onChange={(e) => setState((s) => ({ ...s, capital: Math.max(0, Number(e.target.value) || 0) }))}
                className="w-28 text-right bg-transparent text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1"
              />
            </div>
            <input
              type="range"
              min={0}
              max={state.capitalMax}
              step={1000}
              value={Math.min(state.capital, state.capitalMax)}
              onChange={(e) => setState((s) => ({ ...s, capital: Number(e.target.value) }))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
          {state.ingresos.map((i) => (
            <Row key={i.id} item={i} onChange={(p) => patchItem('ingresos', i.id, p)} />
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <RunwayChart capital={state.capital} net={net} />
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={() => setIngreso('TikTok Shop', 5000)}
            className="px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            TikTok recuperado ($5K)
          </button>
          <button
            onClick={() => setIngreso('Negocio propio', 3000)}
            className="px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Build mode (+negocio)
          </button>
          <button
            onClick={breakevenExacto}
            className="px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Breakeven exacto
          </button>
        </div>
      </div>
    </div>
  )
}
