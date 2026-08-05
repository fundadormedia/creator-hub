import Link from 'next/link'
import { ArrowRight, Sparkles, Briefcase, FileText, MessageSquare, Check } from 'lucide-react'
import { AppShowcase } from '@/components/landing/app-showcase'

export const metadata = {
  title: 'Creator Hub — El manager con IA para creadores que van en serio',
  description:
    'Tu manager con IA negocia con marcas, organiza tus colaboraciones y te dice cuánto cobrar — con tus números reales. Construido en público.',
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Pipeline de ventas con IA',
    desc: 'Tu manager lee tus conversaciones con marcas y te dice cuándo aceptar, cuándo negociar y cuánto pedir. Con tus datos reales.',
  },
  {
    icon: Briefcase,
    title: 'Colaboraciones y cobros',
    desc: 'Cada campaña con su monto, cuotas, fechas de entrega y estado de pago. Todo en un solo lugar.',
  },
  {
    icon: FileText,
    title: 'Media kit automático',
    desc: 'Sube tus capturas de analytics y tu media kit profesional se arma solo. Un link para mandar a marcas en segundos.',
  },
  {
    icon: MessageSquare,
    title: 'Manager que te empuja',
    desc: 'Pregúntale por tarifas, marcas o estrategia. Tiene acceso a tus números reales y te dice la verdad.',
  },
]

const PLAN_FEATURES = [
  'Manager IA sin tope práctico',
  '4 modos: Finanzas · Analiza · Negocia · Recomienda',
  'Colaboraciones y cobros ilimitados',
  'Media kit profesional',
  'Métricas e historial de ingresos',
  'Soporte prioritario',
]

const FAQ = [
  {
    q: '¿En qué se diferencia de otros managers con IA?',
    a: 'Lo construye un creador, en público, en español y para LatAm. El manager trabaja sobre tus datos reales — tus ingresos, tus marcas, tus tarifas — no con respuestas de plantilla.',
  },
  {
    q: '¿Necesito tarjeta para empezar?',
    a: 'No. Pruebas 7 días gratis con acceso completo, sin tarjeta. Solo agregas un método de pago si decides continuar.',
  },
  {
    q: '¿Sirve si recién empiezo?',
    a: 'Sí. El media kit y el orden de tus colaboraciones te hacen ver profesional desde tu primer brand deal, aunque sea el primero.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Cada creador solo ve lo suyo, aislado a nivel de base de datos. Nada se comparte con otros usuarios ni con marcas sin que tú lo mandes.',
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
            Creator&nbsp;Hub
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
            <a href="#funciona" className="hover:text-zinc-900">Cómo funciona</a>
            <a href="#funciones" className="hover:text-zinc-900">Funciones</a>
            <a href="#precio" className="hover:text-zinc-900">Precio</a>
            <a href="#faq" className="hover:text-zinc-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:block">
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Empieza gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — centrado */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          <Sparkles className="h-4 w-4" /> Construido en público por un creador
        </div>
        <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          Tú creas.
          <br />
          <span className="text-indigo-600">Tu manager con IA</span> hace lo demás.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
          Negocia con marcas, organiza tus colaboraciones y cobra a tiempo — mientras tú te enfocas
          en crear. Tu manager digital trabaja con tus números reales.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            Empieza tus 7 días gratis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="text-sm text-zinc-500">Sin tarjeta de crédito</span>
        </div>
      </section>

      {/* Mira cómo funciona — pantallas moviéndose */}
      <section id="funciona" className="border-t border-zinc-100 bg-zinc-50/50 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Mira cómo funciona</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
            Organiza colaboraciones, controla tus ingresos y cierra mejores deals — todo en un solo
            lugar.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-lg px-6">
          <AppShowcase />
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" className="py-20">
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

      {/* Precio */}
      <section id="precio" className="border-t border-zinc-100 bg-zinc-50/50 py-20">
        <div className="mx-auto max-w-md px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight">Un plan. Todo incluido.</h2>
            <p className="mt-3 text-lg text-zinc-600">Prueba 7 días gratis. Sin tarjeta para empezar.</p>
          </div>
          <div className="relative mt-12 rounded-3xl border-2 border-indigo-600 bg-white p-8">
            <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3 w-3" /> 7 días gratis
            </div>
            <div className="text-center">
              <div className="font-medium text-indigo-600">Plan Creador</div>
              <div className="mt-2 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">$14.99</span>
                <span className="text-zinc-500">/mes</span>
              </div>
              <div className="mt-1 text-sm text-zinc-400">o $119/año (~$9.92/mes)</div>
            </div>
            <ul className="mt-8 space-y-3">
              {PLAN_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-zinc-700">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block rounded-full bg-indigo-600 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
            >
              Empieza tus 7 días gratis
            </Link>
            <p className="mt-3 text-center text-sm text-zinc-400">Cancela cuando quieras.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-center text-4xl font-bold tracking-tight">Preguntas frecuentes</h2>
        <div className="mt-10 divide-y divide-zinc-100">
          {FAQ.map((item) => (
            <div key={item.q} className="py-6">
              <h3 className="text-lg font-semibold">{item.q}</h3>
              <p className="mt-2 text-zinc-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-indigo-950 px-8 py-16 text-center text-white">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Tu creatividad merece un manager.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-200">Empieza hoy, gratis.</p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Crear mi cuenta <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-5 text-sm text-indigo-300">7 días gratis · Sin tarjeta · Cancela cuando quieras</p>
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
            <a href="#funciona" className="hover:text-zinc-900">Cómo funciona</a>
            <a href="#precio" className="hover:text-zinc-900">Precio</a>
            <Link href="/login" className="hover:text-zinc-900">Entrar</Link>
          </div>
          <div>© {new Date().getFullYear()} Creator Hub</div>
        </div>
      </footer>
    </div>
  )
}
