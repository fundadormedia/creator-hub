import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route'

// ============================================================
// Lee capturas de Insights/Analytics y extrae las métricas.
// El creador revisa y corrige antes de guardar — la IA propone,
// no confirma.
// ============================================================

type Platform = 'instagram' | 'tiktok' | 'youtube'

interface Shot {
  platform: Platform
  media_type: string // image/png, image/jpeg…
  data: string // base64 sin el prefijo data:
}

const DAILY_LIMIT = 10

const SYSTEM = `Eres un extractor de métricas. Recibes capturas de pantalla de paneles de analíticas de creadores (Instagram Insights, TikTok Analytics, YouTube Studio).

Tu única tarea es leer los números visibles y devolverlos. Reglas:
- Devuelve SOLO un objeto JSON válido, sin texto alrededor ni bloques de código.
- Formato exacto por plataforma:
  {"instagram":{"followers":N,"views":N,"engagement_rate":N,"posts":N,"likes":N,"comments":N,"shares":N,"saves":N,"impressions":N,"reach":N,"clicks":N},"tiktok":{...},"youtube":{...}}
- Incluye únicamente las plataformas de las que recibiste capturas.
- Todos los campos son enteros salvo engagement_rate, que es un porcentaje con decimales (4.75 significa 4.75%).
- Convierte las abreviaturas: "80K" → 80000, "1,2 M" → 1200000, "341.5k" → 341500.
- Equivalencias frecuentes: "cuentas alcanzadas" = reach · "visualizaciones"/"reproducciones" = views · "impresiones" = impressions · "publicaciones" = posts · "veces compartido" = shares · "elementos guardados" = saves · "toques en el enlace"/"visitas al sitio" = clicks.
- Si un dato no aparece en la captura, ponlo en null. NUNCA lo inventes, lo estimes ni lo derives de otro.`

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no está configurada.' }, { status: 500 })
  }

  try {
    const { shots } = (await request.json()) as { shots: Shot[] }

    if (!Array.isArray(shots) || shots.length === 0) {
      return NextResponse.json({ error: 'Sube al menos una captura.' }, { status: 400 })
    }
    if (shots.length > 9) {
      return NextResponse.json({ error: 'Máximo 9 capturas por análisis.' }, { status: 400 })
    }

    const supabase = await createRouteClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
    }

    // Límite diario compartido con el resto de acciones de IA.
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('coach_usage')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'mediakit-analyze')
      .gte('created_at', startOfDay.toISOString())

    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Llegaste al límite de ${DAILY_LIMIT} análisis por día. Vuelve mañana. 🙌` },
        { status: 429 }
      )
    }
    await supabase.from('coach_usage').insert({ user_id: user.id, action: 'mediakit-analyze' })

    // Cada captura va precedida de una línea que dice a qué red pertenece.
    const content = shots.flatMap((s) => [
      { type: 'text' as const, text: `Captura de ${s.platform}:` },
      {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: s.media_type as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
          data: s.data,
        },
      },
    ])

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1000,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            ...content,
            { type: 'text', text: 'Extrae las métricas de estas capturas y devuelve solo el JSON.' },
          ],
        },
      ],
    })

    if (message.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'No pude procesar esas imágenes.' }, { status: 422 })
    }

    const block = message.content.find((b) => b.type === 'text')
    const raw = block && block.type === 'text' ? block.text.trim() : ''

    // Por si el modelo envuelve el JSON en un bloque de código.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim()

    try {
      return NextResponse.json({ metrics: JSON.parse(cleaned) })
    } catch {
      console.error('Respuesta no parseable del análisis de capturas:', raw)
      return NextResponse.json(
        { error: 'No pude leer los números de esas capturas. Prueba con imágenes más nítidas.' },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Error en /api/mediakit-analyze:', error)
    return NextResponse.json({ error: 'Algo falló analizando las capturas.' }, { status: 500 })
  }
}
