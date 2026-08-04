import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

export const metadata = {
  title: 'Creator Hub — El manager con IA para creadores que van en serio',
  description:
    'Deja de perseguir marcas y cobrar tarde. Tu manager con IA negocia, organiza tus colaboraciones y te dice cuánto cobrar — con tus números reales. Construido en público.',
}

// Beneficios como bloques numerados (narrativa, no grilla de cards).
const CAPABILITIES = [
  {
    n: '01',
    title: 'Negocia y cobra por ti',
    body: 'Tu manager lee tus conversaciones con marcas y te dice cuándo aceptar, cuándo apretar y cuánto pedir. Con tus tarifas reales, no consejos de manual.',
    tag: 'Pipeline de ventas con IA',
  },
  {
    n: '02',
    title: 'Ni una campaña sin cobrar',
    body: 'Cada colaboración con su monto, cuotas y fecha de pago. Sabes exactamente qué te deben y cuándo — se acabó el “¿ya me pagaron?”.',
    tag: 'Colaboraciones y cobros',
  },
  {
    n: '03',
    title: 'Media kit en un link',
    body: 'Subes tus capturas de analytics y tu media kit profesional se arma solo. Un link listo para mandar a marcas en segundos.',
    tag: 'Media kit automático',
  },
  {
    n: '04',
    title: 'Un manager que te empuja',
    body: 'Le preguntas por tarifas, marcas o estrategia y responde con tus números en la mano. Te dice la verdad, no lo que quieres oír.',
    tag: 'Chat experto con tus datos',
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
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 selection:bg-lime-300 selection:text-black">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-lime-300 text-black">✦</span>
            Creator&nbsp;Hub
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#como" className="hover:text-white">Cómo funciona</a>
            <a href="#precio" className="hover:text-white">Precio</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-zinc-400 hover:text-white sm:block">
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-lime-300 px-5 py-2 text-sm font-semibold text-black transition hover:bg-lime-200"
            >
              Empieza gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — centrado, tipográfico, sin mockup de navegador */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-lime-300">
            Manager con IA · Construido en público
          </div>
          <h1 className="mt-8 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
            Deja de perseguir marcas.
            <br />
            <span className="text-lime-300">Empieza a cobrar.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg text-zinc-400">
            Tu manager con IA negocia con marcas, ordena tus colaboraciones y te dice cuánto cobrar —
            con tus números reales. Tú creas; él se encarga del negocio.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-lime-300 px-8 py-4 text-base font-semibold text-black transition hover:bg-lime-200"
            >
              Empieza tus 7 días gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="text-sm text-zinc-500">Sin tarjeta de crédito · Cancela cuando quieras</span>
          </div>
        </div>

        {/* Banda de números (prueba social / mission) */}
        <div className="border-y border-white/5 bg-white/[0.02]">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-white/5 px-6 md:grid-cols-4">
            {[
              ['155K+', 'audiencia detrás del build'],
              ['4', 'modos del manager IA'],
              ['1 link', 'para tu media kit'],
              ['0', 'campañas sin cobrar'],
            ].map(([big, small]) => (
              <div key={small} className="px-4 py-8 text-center">
                <div className="text-3xl font-bold text-white">{big}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona — bloques numerados alternados */}
      <section id="como" className="mx-auto max-w-5xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-sm font-medium uppercase tracking-widest text-lime-300">Lo que hace por ti</div>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            El trabajo aburrido del creador, resuelto.
          </h2>
        </div>
        <div className="mt-16 space-y-px overflow-hidden rounded-3xl border border-white/10">
          {CAPABILITIES.map((c) => (
            <div
              key={c.n}
              className="group grid items-center gap-6 bg-white/[0.02] p-8 transition hover:bg-white/[0.04] md:grid-cols-[6rem_1fr_auto] md:p-10"
            >
              <div className="text-5xl font-bold text-lime-300/80 md:text-6xl">{c.n}</div>
              <div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">{c.tag}</div>
                <h3 className="mt-2 text-2xl font-semibold text-white">{c.title}</h3>
                <p className="mt-2 max-w-xl text-zinc-400">{c.body}</p>
              </div>
              <ArrowUpRight className="hidden h-6 w-6 text-zinc-600 transition group-hover:text-lime-300 md:block" />
            </div>
          ))}
        </div>
      </section>

      {/* Ingresos — banda de impacto */}
      <section className="border-y border-white/5 bg-gradient-to-b from-lime-300/[0.06] to-transparent py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Sabes cuánto ganas, de qué marca
            <br className="hidden md:block" /> y qué te falta cobrar.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
            Cada colaboración con su monto y estado de pago. Tu manager cruza los números y te dice
            dónde está el dinero — y dónde lo estás dejando sobre la mesa.
          </p>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ['Ingresos por marca', 'Nike, Adidas, Spotify… quién te deja más.'],
              ['Cuotas y fechas', 'Cada pago con su vencimiento.'],
              ['Mes a mes', 'Tu tendencia real, sin adivinar.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left">
                <div className="font-semibold text-white">{t}</div>
                <div className="mt-1 text-sm text-zinc-400">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nota del fundador — el diferenciador que no se copia */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 md:p-14">
          <div className="text-sm font-medium uppercase tracking-widest text-lime-300">Por qué existe</div>
          <blockquote className="mt-6 text-2xl font-medium leading-snug text-white md:text-3xl">
            “No soy una empresa de software vendiéndote una herramienta. Soy un creador construyendo,
            en público, lo que yo necesitaba: dejar de regalar mi trabajo y cobrar lo que valgo.”
          </blockquote>
          <div className="mt-8 flex items-center gap-3 text-sm text-zinc-400">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lime-300 font-bold text-black">
              A
            </span>
            <div>
              <div className="font-semibold text-white">Andre · fundador</div>
              <div>Creador de contenido, construyendo Creator Hub en público</div>
            </div>
          </div>
        </div>
      </section>

      {/* Precio — un plan, 7 días */}
      <section id="precio" className="mx-auto max-w-md px-6 py-24">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Un plan. Todo incluido.</h2>
          <p className="mt-3 text-lg text-zinc-400">Prueba 7 días gratis. Sin tarjeta para empezar.</p>
        </div>
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-lime-300/40 bg-white/[0.03] p-8">
          <div className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="relative text-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-lime-300 px-3 py-1 text-xs font-semibold text-black">
              7 días gratis
            </div>
            <div className="mt-5 font-medium text-lime-300">Plan Creador</div>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-6xl font-bold text-white">$14.99</span>
              <span className="text-zinc-400">/mes</span>
            </div>
            <div className="mt-1 text-sm text-zinc-500">o $119/año (~$9.92/mes)</div>
          </div>
          <ul className="relative mt-8 space-y-3">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex gap-3 text-zinc-300">
                <span className="mt-0.5 text-lime-300">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="relative mt-8 block rounded-full bg-lime-300 py-3.5 text-center font-semibold text-black transition hover:bg-lime-200"
          >
            Empieza tus 7 días gratis
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center text-4xl font-bold tracking-tight">Preguntas frecuentes</h2>
        <div className="mt-10 divide-y divide-white/5">
          {FAQ.map((item) => (
            <div key={item.q} className="py-6">
              <h3 className="text-lg font-semibold text-white">{item.q}</h3>
              <p className="mt-2 text-zinc-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-lime-300 px-8 py-16 text-center text-black">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Tú al contenido. Del negocio me encargo yo.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-black/70">
            Prueba Creator Hub 7 días gratis y arma tu media kit en minutos. Sin tarjeta.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 text-base font-semibold text-white transition hover:bg-zinc-800"
          >
            Empieza gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-zinc-300">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-lime-300 text-black">✦</span>
            Creator Hub
          </div>
          <div className="flex items-center gap-6">
            <a href="#como" className="hover:text-white">Cómo funciona</a>
            <a href="#precio" className="hover:text-white">Precio</a>
            <Link href="/login" className="hover:text-white">Entrar</Link>
          </div>
          <div>© {new Date().getFullYear()} Creator Hub</div>
        </div>
      </footer>
    </div>
  )
}
