import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route'

// ============================================================
// Coach — chat con acceso a los datos reales del creador.
// 4 modos: Finanzas · Analiza · Negocia · Recomienda.
// Complementa /api/stanley (acciones puntuales); esto es conversación.
// ============================================================

type Mode = 'finanzas' | 'analiza' | 'negocia' | 'recomienda'

const MODES: Record<Mode, string> = {
  finanzas:
    'Estás en modo FINANZAS. Hablas de ingresos, gastos, márgenes y proyecciones. Siempre citas las cifras reales del creador y calculas cuando hace falta. Si faltan datos para responder con números, dilo en vez de inventar.',
  analiza:
    'Estás en modo ANALIZA. Interpretas el rendimiento del contenido: qué formatos, plataformas y categorías funcionan mejor según las métricas reales. Buscas patrones, no anécdotas.',
  negocia:
    'Estás en modo NEGOCIA. Ayudas a fijar tarifas y responder a marcas. Usas el historial real de colaboraciones como referencia de precio y siempre empujas hacia arriba cuando los datos lo justifican.',
  recomienda:
    'Estás en modo RECOMIENDA. Propones el siguiente paso concreto: qué crear, a qué marca escribir, qué dejar de hacer. Una recomendación clara por respuesta, con el porqué.',
}

// Límite diario de mensajes (protege los créditos de Anthropic).
const DAILY_LIMIT = 40

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPayload {
  mode: Mode
  messages: ChatMessage[]
}

type RouteClient = Awaited<ReturnType<typeof createRouteClient>>

// Trae los datos del usuario. RLS limita todo a sus propias filas.
async function buildUserContext(supabase: RouteClient): Promise<string> {
  const [profile, content, income, brands, expenses] = await Promise.all([
    supabase.from('profiles').select('manager_profile, pricing_stance, main_currency').maybeSingle(),
    supabase
      .from('content')
      .select('title, platform, format, category, status, date, views, likes, is_sponsor')
      .order('date', { ascending: false })
      .limit(40),
    supabase.from('income').select('month, year, amount, source').order('year', { ascending: false }).limit(36),
    supabase.from('brands').select('name, platform, amount, status, delivery_date').limit(40),
    supabase.from('expenses').select('category, amount, month, year, description').limit(60),
  ])

  const section = (title: string, rows: unknown[] | null) =>
    rows && rows.length > 0
      ? `## ${title}\n${JSON.stringify(rows)}`
      : `## ${title}\n(sin datos registrados todavía)`

  const p = profile.data
  const quienEs = p?.manager_profile
    ? `## Quién es el creador (lo contó él mismo en la entrevista inicial)\n${JSON.stringify(p.manager_profile)}\nPosicionamiento de precio: ${p.pricing_stance ?? 'mercado'} · Moneda: ${p.main_currency ?? 'USD'}`
    : '## Quién es el creador\n(todavía no completó la entrevista inicial)'

  return [
    quienEs,
    section('Contenido publicado (más reciente primero)', content.data),
    section('Ingresos por mes', income.data),
    section('Colaboraciones con marcas', brands.data),
    section('Gastos', expenses.data),
  ].join('\n\n')
}

// Verifica el límite diario y, si hay cupo, registra el uso.
async function checkAndLogUsage(
  supabase: RouteClient,
  userId: string
): Promise<{ allowed: boolean; limit: number }> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('coach_usage')
    .select('id', { count: 'exact', head: true })
    .eq('action', 'chat')
    .gte('created_at', startOfDay.toISOString())

  if ((count ?? 0) >= DAILY_LIMIT) return { allowed: false, limit: DAILY_LIMIT }

  await supabase.from('coach_usage').insert({ user_id: userId, action: 'chat' })
  return { allowed: true, limit: DAILY_LIMIT }
}

function buildSystemPrompt(mode: Mode, userContext: string): string {
  return `Eres el manager de creación de contenido de este creador dentro de Creator Hub.

Hablas español neutro con tuteo (nunca voseo argentino). Eres directo y concreto: sin relleno, sin "espero que esto te ayude", sin disclaimers.

${MODES[mode]}

Reglas que no se rompen:
- Estos son los datos REALES del creador. Úsalos: cita cifras, títulos y nombres concretos en vez de hablar en general.
- Si los datos no alcanzan para responder, dilo claro y pide exactamente lo que falta. Nunca inventes una cifra.
- Respuestas cortas por defecto. Si hay una decisión importante, usa el formato: "Recomiendo X porque [razón]. Alternativa: Y si [condición]."
- Empuja, no valides. Si ves que algo no está funcionando según los números, dilo.

# DATOS DEL CREADOR

${userContext}`
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY no está configurada en las variables de entorno.' },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json()) as ChatPayload

    if (!body.mode || !(body.mode in MODES)) {
      return NextResponse.json(
        { error: 'Modo inválido. Usa: finanzas, analiza, negocia o recomienda.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'Falta el historial de mensajes.' }, { status: 400 })
    }

    const supabase = await createRouteClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
    }

    const usage = await checkAndLogUsage(supabase, user.id)
    if (!usage.allowed) {
      return NextResponse.json(
        { error: `Llegaste al límite de ${usage.limit} mensajes por día. Vuelve mañana. 🙌` },
        { status: 429 }
      )
    }

    const userContext = await buildUserContext(supabase)

    // Solo los últimos 20 turnos: mantiene el costo acotado y el contexto relevante.
    const history = body.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      system: [
        {
          type: 'text',
          text: buildSystemPrompt(body.mode, userContext),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: history,
    })

    if (message.stop_reason === 'refusal') {
      return NextResponse.json(
        { error: 'No puedo responder eso. Reformula la pregunta.' },
        { status: 422 }
      )
    }

    const reply = message.content.find((b) => b.type === 'text')
    if (!reply || reply.type !== 'text') {
      return NextResponse.json({ error: 'No obtuve respuesta. Intenta de nuevo.' }, { status: 502 })
    }

    return NextResponse.json({ reply: reply.text })
  } catch (error) {
    console.error('Error en /api/coach:', error)
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'La IA está saturada ahora mismo. Espera unos segundos e intenta de nuevo.' },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: 'Algo falló procesando tu mensaje.' }, { status: 500 })
  }
}
