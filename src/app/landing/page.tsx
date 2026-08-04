import Link from 'next/link'
import {
  Sparkles,
  Briefcase,
  FileText,
  MessageSquare,
  TrendingUp,
  Check,
  ArrowRight,
  Gift,
} from 'lucide-react'

export const metadata = {
  title: 'Creator Hub — Tu manager con IA para creadores',
  description:
    'Tú creas. Tu manager con IA cobra, negocia con marcas y organiza tu carrera. Construido en público por un creador, para creadores.',
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Pipeline de ventas con IA',
    desc: 'Tu manager lee tus conversaciones con marcas y te dice cuándo aceptar, cuándo negociar y cuánto pedir. Con tus datos reales, no consejos genéricos.',
  },
  {
    icon: Briefcase,
    title: 'Colaboraciones y cobros',
    desc: 'Cada campaña con su monto, cuotas, fechas de entrega y estado de pago. Sabes exactamente qué te deben y cuándo.',
  },
  {
    icon: FileText,
    title: 'Media kit automático',
    desc: 'Sube tus capturas de analytics y tu media kit profesional se arma solo. Un link para mandar a marcas en segundos.',
  },
  {
    icon: MessageSquare,
    title: 'Manager que te empuja',
    desc: 'Pregúntale por tarifas, marcas o estrategia. Tiene acceso a tus números reales y te dice la verdad, no lo que quieres oír.',
  },
]

const FREE = ['Media kit público', 'Manager IA · 40 mensajes/día', 'Métricas y colaboraciones', 'Sin tarjeta de crédito']

const PRO = [
  'Manager IA sin tope práctico',
  'Los 4 modos: Finanzas · Analiza · Negocia · Recomienda',
  'Media kit ilimitado',
  'Historial completo de ingresos y marcas',
  'Soporte prioritario',
]

const FAQ = [
  {
    q: '¿En qué se diferencia de otros managers con IA?',
    a: 'Creator Hub lo construye un creador en público, en español y para LatAm. El manager trabaja sobre tus datos reales — tus ingresos, tus marcas, tus tarifas — no con respuestas de plantilla.',
  },
  {
    q: '¿Necesito tarjeta para empezar?',
    a: 'No. El plan gratuito es gratis para siempre: media kit público y tu manager con IA. Subes a Pro solo cuando lo necesites.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Cada creador solo ve sus propios datos, aislados a nivel de base de datos. Nada se comparte con otros usuarios ni con marcas sin que tú lo mandes.',
  },
  {
    q: '¿Sirve si recién empiezo?',
    a: 'Sí. El media kit y el orden de tus colaboraciones te hacen ver profesional desde el primer brand deal, aunque sea el primero.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            Creator Hub
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
            <a href="#funciones" className="hover:text-zinc-900">Funciones</a>
            <a href="#precio" className="hover:text-zinc-900">Precio</a>
            <a href="#faq" className="hover:text-zinc-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:block">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Empieza gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            <Sparkles className="h-4 w-4" /> Construido en público por un creador
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Tú creas.
            <br />
            <span className="text-indigo-600">Tu manager con IA</span> hace lo demás.
          </h1>
          <p className="mt-6 max-w-md text-lg text-zinc-600">
            Gestiona tus colaboraciones, negocia con marcas y cobra a tiempo — mientras tú te enfocas
            en crear. Tu manager digital trabaja con tus números reales.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
            >
              Empieza gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-zinc-500">Gratis para siempre · Sin tarjeta</span>
          </div>
        </div>

        {/* Mockup dashboard */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 shadow-2xl shadow-zinc-900/5">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="text-xl font-bold">Hola, Valentina 👋</div>
            <div className="text-sm text-zinc-400">Lunes 4 de mayo</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-zinc-50 p-3">
                <div className="text-[10px] uppercase tracking-wide text-zinc-400">Activas</div>
                <div className="mt-1 text-lg font-bold">5</div>
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
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-400 line-through">
                <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-600 text-[10px] text-white">✓</span>
                Grabar reel para Nike
              </div>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700">
                <span className="h-4 w-4 rounded border border-zinc-300" />
                Publicar story de L&apos;Oréal
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Gift className="h-4 w-4 text-emerald-600" /> Nueva oferta · HBO Max $9.500
              </div>
              <div className="mt-1 text-xs text-emerald-700">
                Acepta — está $1.500 arriba de tu tarifa promedio.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funciones" className="border-t border-zinc-100 bg-zinc-50/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight">
            Todo lo que necesitas, en una sola plataforma.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-7">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-zinc-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ingresos */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
              <TrendingUp className="h-4 w-4" /> Controla tus ingresos
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight">
              Sabes cuánto ganas, de qué marca y qué falta cobrar.
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Cada colaboración con su monto y estado de pago. Tu manager cruza los números y te dice
              dónde está el dinero — y dónde lo estás dejando sobre la mesa.
            </p>
            <ul className="mt-6 space-y-3">
              {['Ingresos por marca y por mes', 'Cuotas y fechas de cobro', 'Comparativa vs. meses anteriores'].map((i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-700">
                  <Check className="h-5 w-5 text-indigo-600" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-900/5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-500">Últimos 6 meses</span>
              <span className="font-semibold text-indigo-600">+24% vs mes anterior</span>
            </div>
            <div className="mt-6 flex h-40 items-end gap-3">
              {[45, 60, 40, 80, 55, 95].map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-200 to-indigo-500"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-zinc-100 pt-4 text-sm">
              {[
                ['Nike', '$4,000', 'Cobrado', 'text-emerald-600'],
                ['Adidas', '$3,500', 'Por cobrar', 'text-amber-600'],
                ['Spotify', '$2,800', 'Activa', 'text-indigo-600'],
              ].map(([brand, amt, status, color]) => (
                <div key={brand} className="flex items-center justify-between">
                  <span className="font-medium">{brand}</span>
                  <span className="text-zinc-500">{amt}</span>
                  <span className={`text-xs font-semibold ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Precio */}
      <section id="precio" className="border-t border-zinc-100 bg-zinc-50/50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight">Precio simple. Empieza gratis.</h2>
            <p className="mt-3 text-lg text-zinc-600">Sube a Pro cuando tu carrera lo pida. Cancela cuando quieras.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {/* Gratis */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <div className="font-medium text-zinc-500">Gratis</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-zinc-500">/siempre</span>
              </div>
              <ul className="mt-6 space-y-3">
                {FREE.map((f) => (
                  <li key={f} className="flex gap-2 text-zinc-600">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block rounded-full border border-zinc-300 py-3 text-center font-semibold hover:bg-zinc-50"
              >
                Empieza gratis
              </Link>
            </div>
            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-indigo-600 bg-white p-8">
              <div className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="h-3 w-3" /> Recomendado
              </div>
              <div className="font-medium text-indigo-600">Pro</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$14.99</span>
                <span className="text-zinc-500">/mes</span>
              </div>
              <div className="mt-1 text-sm text-zinc-400">o $119/año (~$9.92/mes)</div>
              <ul className="mt-6 space-y-3">
                {PRO.map((f) => (
                  <li key={f} className="flex gap-2 text-zinc-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block rounded-full bg-indigo-600 py-3 text-center font-semibold text-white hover:bg-indigo-700"
              >
                Empieza gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-4xl font-bold tracking-tight">Preguntas frecuentes</h2>
          <div className="mt-10 divide-y divide-zinc-100">
            {FAQ.map((item) => (
              <div key={item.q} className="py-6">
                <h3 className="text-lg font-semibold">{item.q}</h3>
                <p className="mt-2 text-zinc-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-indigo-600 px-8 py-16 text-center text-white">
          <h2 className="text-4xl font-bold tracking-tight">Enfócate en crear. Del resto se encarga tu manager.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Únete gratis y arma tu media kit en minutos. Sin tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Empieza gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-zinc-700">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            Creator Hub
          </div>
          <div className="flex items-center gap-6">
            <a href="#funciones" className="hover:text-zinc-900">Funciones</a>
            <a href="#precio" className="hover:text-zinc-900">Precio</a>
            <Link href="/login" className="hover:text-zinc-900">Iniciar sesión</Link>
          </div>
          <div>© {new Date().getFullYear()} Creator Hub</div>
        </div>
      </footer>
    </div>
  )
}
