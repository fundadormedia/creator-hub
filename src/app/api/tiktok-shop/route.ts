import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

function buildCreateScriptPrompt(p: CreateScriptPayload): string {
  return `Eres un experto en TikTok Shop y marketing de contenido viral en español latino.
Crea un script viral para TikTok Shop con la siguiente información:

Producto: ${p.product}
Audiencia objetivo: ${p.audience}
Precio / Comisión: ${p.price}
Estilo del video: ${p.style}
Experiencia personal / Contexto: ${p.context || 'Sin contexto adicional'}

INSTRUCCIONES:
- El script debe estar en español latino natural y conversacional
- Estructura obligatoria: Hook (primeros 3 segundos), Desarrollo, Call to Action con urgencia
- El hook debe ser irresistible y detener el scroll
- Incluye momentos de pausa dramática [PAUSA] donde sea efectivo
- Agrega indicaciones de tono entre corchetes: [EMOCIONADO], [SUSURRANDO], [DIRECTO A CÁMARA], etc.
- Duración objetivo: 30-60 segundos (aproximadamente 150-250 palabras habladas)
- El CTA debe incluir el precio/comisión y urgencia (stock limitado, por tiempo limitado, etc.)
- Usa lenguaje coloquial, emojis en puntos clave y frases que generen FOMO

Formato de respuesta:
🎬 **HOOK (0-3 seg)**
[texto del hook]

📱 **DESARROLLO (4-45 seg)**
[desarrollo del script]

🛒 **CALL TO ACTION (últimos 10 seg)**
[CTA con precio y urgencia]

💡 **TIPS DE PRODUCCIÓN**
[3 tips específicos para filmar este video]`
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
  try {
    const body = (await request.json()) as Payload

    if (!body.action) {
      return NextResponse.json({ error: 'Falta el campo action' }, { status: 400 })
    }

    let prompt: string

    switch (body.action as Action) {
      case 'crear-script':
        prompt = buildCreateScriptPrompt(body as CreateScriptPayload)
        break
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ result: text })
  } catch (error) {
    console.error('TikTok Shop API error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud. Verifica tu API key de Anthropic.' },
      { status: 500 }
    )
  }
}
