'use client'

import { useState, useEffect } from 'react'

// Showcase rotativo: muestra pantallas de la app dentro de un marco de navegador,
// alternando cada pocos segundos (estilo Silvia, con colores Creator Hub).

const CAPTIONS = ['Tu día, organizado', 'Tu manager con IA', 'Controla tus ingresos']

function SlideDashboard() {
  return (
    <div className="p-6">
      <div className="text-lg font-bold text-zinc-900">Hola, Valentina 👋</div>
      <div className="text-sm text-zinc-400">Lunes 4 de mayo</div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-indigo-50 p-3">
          <div className="text-[10px] uppercase tracking-wide text-indigo-400">Activas</div>
          <div className="mt-1 text-lg font-bold text-indigo-900">5</div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <div className="text-[10px] uppercase tracking-wide text-emerald-600">Cobrado</div>
          <div className="mt-1 text-lg font-bold text-emerald-700">$4,000</div>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <div className="text-[10px] uppercase tracking-wide text-amber-600">Por cobrar</div>
          <div className="mt-1 text-lg font-bold text-amber-700">$6,500</div>
        </div>
      </div>
      <div className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Tareas de hoy</div>
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-400 line-through">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-600 text-[10px] text-white">✓</span>
          Grabar reel para Nike
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700">
          <span className="h-4 w-4 rounded border border-zinc-300" /> Publicar story de L&apos;Oréal
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
        <div className="text-sm font-semibold text-indigo-900">Nueva oferta · HBO Max $9.500</div>
        <div className="mt-1 text-xs text-indigo-700">Acepta — está $1.500 arriba de tu tarifa promedio.</div>
      </div>
    </div>
  )
}

function SlideManager() {
  const modes = ['Finanzas', 'Analiza', 'Negocia', 'Recomienda']
  return (
    <div className="p-6">
      <div className="text-sm font-bold text-zinc-900">Pregúntale a tu manager</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {modes.map((m, idx) => (
          <div
            key={m}
            className={`rounded-lg border px-3 py-2 text-xs font-medium ${
              idx === 3
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-zinc-200 text-zinc-500'
            }`}
          >
            ✦ {m}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
          ¿Cómo mejoro mi media kit para conseguir más marcas?
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
          M
        </span>
        <div className="rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-2.5 text-sm text-zinc-700">
          Incluye 3 cosas: métricas actualizadas, casos con resultados concretos y tus tarifas por
          formato. Puedo generarlo en segundos.
        </div>
      </div>
    </div>
  )
}

function SlideIngresos() {
  const bars = [45, 62, 40, 80, 55, 95]
  return (
    <div className="p-6">
      <div className="text-sm font-bold text-zinc-900">Controla tus ingresos</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-zinc-50 p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-zinc-400">Activas</div>
          <div className="text-base font-bold text-zinc-900">5</div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-emerald-600">Cobrado</div>
          <div className="text-base font-bold text-emerald-700">$4,000</div>
        </div>
        <div className="rounded-lg bg-amber-50 p-2.5">
          <div className="text-[10px] uppercase tracking-wide text-amber-600">Por cobrar</div>
          <div className="text-base font-bold text-amber-700">$6,500</div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-zinc-100 p-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-zinc-400">Últimos 6 meses</span>
          <span className="font-semibold text-indigo-600">+24%</span>
        </div>
        <div className="mt-3 flex h-24 items-end gap-2">
          {bars.map((h, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t bg-gradient-to-t from-indigo-200 to-indigo-600"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-sm">
        {[
          ['Nike', '$4,000', 'text-emerald-600', 'Cobrado'],
          ['Adidas', '$3,500', 'text-amber-600', 'Por cobrar'],
        ].map(([b, amt, c, s]) => (
          <div key={b} className="flex items-center justify-between">
            <span className="font-medium text-zinc-800">{b}</span>
            <span className="text-zinc-400">{amt}</span>
            <span className={`text-xs font-semibold ${c}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SLIDES = [SlideDashboard, SlideManager, SlideIngresos]

export function AppShowcase() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % SLIDES.length), 3800)
    return () => clearInterval(t)
  }, [])

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5 shadow-2xl shadow-indigo-900/10">
        <div className="overflow-hidden rounded-xl bg-white">
          {/* barra de navegador */}
          <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-zinc-400">creatorhub.app</span>
          </div>
          {/* slides */}
          <div className="relative h-[440px]">
            {SLIDES.map((Slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  active === idx ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <Slide />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* indicadores */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            aria-label={CAPTIONS[idx]}
            className={`h-2 rounded-full transition-all ${
              active === idx ? 'w-6 bg-indigo-600' : 'w-2 bg-zinc-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
