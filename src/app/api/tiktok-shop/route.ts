import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route'

// Máximo de scripts que un usuario puede generar por día
const DAILY_SCRIPT_LIMIT = 3

type Action = 'crear-script' | 'policy-checker' | 'extraer-video'

interface CreateScriptPayload {
  action: 'crear-script'
  product: string
  audience: string
  price: string
  style: string
  context: string
}

interface PolicyCheckerPayload {
  action: 'policy-checker'
  script: string
  category: string
}

interface ExtraerVideoPayload {
  action: 'extraer-video'
  url: string
  language: string
}

type Payload = CreateScriptPayload | PolicyCheckerPayload | ExtraerVideoPayload

function buildCreateScriptPrompt(p: CreateScriptPayload & { platform?: string }): string {
  const plat = p.platform || 'redes sociales'
  return `Eres uno de los mejores guionistas de contenido viral en español del mundo. Dominas el storytelling al nivel de los grandes creadores latinos: la cercanía y el carisma de Luisito Comunica, la estructura de retención de los mejores guionistas de YouTube, y la psicología de venta de Alex Hormozi. No copias su voz — dominas las MISMAS técnicas que los hacen imparables.

Tu trabajo: escribir un guión de video UGC que sea imposible de saltar.

BRIEF:
- Producto / Servicio: ${p.product}
- Audiencia objetivo: ${p.audience || 'audiencia general'}
- Plataforma: ${plat}
- Estilo del video: ${p.style}
- Experiencia personal / Contexto: ${p.context || 'Sin contexto adicional'}

PRINCIPIOS DE STORYTELLING DE ÉLITE (aplícalos todos):
1. HOOK con curiosity gap: abre un bucle abierto que el cerebro NECESITA cerrar. Promete algo específico o rompe una expectativa en los primeros 3 segundos. Nada genérico — nada de "hoy te voy a hablar de...".
2. Especificidad sobre generalidad: números concretos, detalles sensoriales, momentos reales. "Perdí $3.000 en una semana" pega más que "perdí dinero".
3. Vulnerabilidad y stakes: muestra el antes (la frustración, el fracaso, la duda) para que el después tenga peso emocional. La gente se conecta con humanos imperfectos, no con anuncios.
4. Estructura PERO/POR ESO: cada frase debe crear tensión o consecuencia, nunca solo "y luego... y luego". El guión avanza, no se estanca.
5. Ritmo de retención: frases cortas. Pattern interrupts. Cambios de energía. Que cada 3-4 segundos pase algo que impida el scroll.
6. El producto entra como SOLUCIÓN dentro de la historia, no como comercial. Se siente como un amigo contándote qué le cambió la vida, no como un vendedor.
7. CTA con momentum emocional: cuando llega el call to action, la persona ya QUIERE actuar. No ruegas — invitas a lo obvio.

REGLAS:
- Español latino natural, conversacional, con la energía de la plataforma (${plat}).
- Indicaciones de tono y actuación entre corchetes: [PAUSA], [DIRECTO A CÁMARA], [SUSURRANDO], [SUBE LA ENERGÍA], [GESTO DE SORPRESA], etc.
- Duración: 30-60 seg (150-250 palabras habladas). Cada palabra gana su lugar.
- Cero relleno, cero clichés de vendedor ("no esperes más", "calidad insuperable"). Si suena a anuncio, está mal.

FORMATO DE RESPUESTA:
🎬 **HOOK (0-3 seg)**
[el gancho — debe abrir un bucle imposible de ignorar]

📖 **STORYTELLING (4-45 seg)**
[la historia con tensión, vulnerabilidad y el producto como giro de la trama]

✅ **CALL TO ACTION (últimos 10 seg)**
[el cierre que convierte la emoción en acción]

🧠 **POR QUÉ FUNCIONA**
[1-2 líneas explicando la psicología detrás de este guión, para que el creador aprenda]

💡 **TIPS DE PRODUCCIÓN**
[3 tips específicos para filmar este video en ${plat}: encuadre, energía, edición]`
}

function buildPolicyCheckerPrompt(p: PolicyCheckerPayload): string {
  return `Eres un experto en las políticas de TikTok Shop y contenido de creadores.
Analiza el siguiente script para verificar si cumple con las políticas de TikTok Shop.

Categoría del producto: ${p.category}

Script a analizar:
"""
${p.script}
"""

Analiza específicamente:
1. Afirmaciones de salud o médicas no permitidas
2. Comparaciones directas con competidores
3. Claims de ganancias o resultados garantizados
4. Lenguaje engañoso o exagerado
5. Problemas con la categoría específica del producto
6. Llamadas a la acción que violan políticas (ej: "abandona TikTok para comprar")
7. Disclosure de afiliado / patrocinio (¿está presente?)

Responde con este formato exacto:

## Resultado: ✅ APROBADO / ⚠️ REQUIERE CAMBIOS / ❌ RECHAZADO

## Puntuación de Riesgo: X/10

## Problemas Encontrados
[Lista numerada de problemas, o "Ninguno" si está limpio]

## Sugerencias de Corrección
[Lista de correcciones específicas, o "El script está listo para publicar"]

## Elementos Faltantes
[Elementos que debería agregar: disclosure, etc.]`
}

function buildExtraerVideoPrompt(p: ExtraerVideoPayload): string {
  return `El usuario quiere extraer información del siguiente video de TikTok: ${p.url}

Nota: No tengo acceso directo a videos de TikTok. Sin embargo, puedo ayudarte a analizar el script o contenido si lo pegas directamente.

Por favor indica al usuario que:
1. Descargue o transcriba el video manualmente
2. Pegue el texto/script en la sección de Policy Checker
3. O use la función "Crear Script" para generar uno nuevo basado en el producto del video

Responde en ${p.language === 'English' ? 'English' : 'español'}.`
}

export async function POST(request: NextRequest) {
  console.log('API KEY existe:', !!process.env.ANTHROPIC_API_KEY)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY no está configurada en las variables de entorno.' },
      { status: 500 }
    )
  }

  const client = new Anthropic({ apiKey })

  try {
    const body = (await request.json()) as Payload

    if (!body.action) {
      return NextResponse.json({ error: 'Falta el campo action' }, { status: 400 })
    }

    let prompt: string

    switch (body.action as Action) {
      case 'crear-script': {
        // ── Rate limit: máximo DAILY_SCRIPT_LIMIT scripts por usuario por día ──
        const supabase = await createRouteClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Debes iniciar sesión para generar scripts.' }, { status: 401 })
        }

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const { count, error: countError } = await supabase
          .from('script_usage')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString())

        if (countError) {
          console.error('Error contando uso:', countError.message)
        } else if ((count ?? 0) >= DAILY_SCRIPT_LIMIT) {
          return NextResponse.json(
            { error: `Llegaste al límite de ${DAILY_SCRIPT_LIMIT} scripts por día. Vuelve mañana para generar más. 🙌` },
            { status: 429 }
          )
        }

        // Registrar esta generación
        await supabase.from('script_usage').insert({ user_id: user.id })

        prompt = buildCreateScriptPrompt(body as CreateScriptPayload)
        break
      }
      case 'policy-checker':
        prompt = buildPolicyCheckerPrompt(body as PolicyCheckerPayload)
        break
      case 'extraer-video':
        prompt = buildExtraerVideoPrompt(body as ExtraerVideoPayload)
        break
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ result: text })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('TikTok Shop API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
