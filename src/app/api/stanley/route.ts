import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route'

// ============================================================
// Stanley LatAm — Head of Content con IA
// Acción inicial: extraer-voz (la "voz ancla" del creador).
// Las otras 3 (estratega / copywriter / entrevistador / analista)
// se sumarán como nuevos `case` leyendo el voice_profile guardado.
// ============================================================

type Action = 'extraer-voz'

interface ExtraerVozPayload {
  action: 'extraer-voz'
  posts: string // 5-10 posts del creador, pegados (cualquier separador)
  niche: string
  objective: string
}

type Payload = ExtraerVozPayload

// El esquema que Claude DEBE devolver. Es el contrato que consumen
// los otros sombreros, así que se valida antes de guardar.
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

function buildExtraerVozPrompt(p: ExtraerVozPayload): string {
  return `Eres el mejor analista de voz de marca para creadores de contenido en español de LatAm. Tu especialidad: leer cómo escribe una persona y destilar su "voz" con tanta precisión que otra IA pueda escribir EXACTAMENTE como ella sin sonar a robot ni a plantilla.

No describes en abstracto ("tono cercano y auténtico" no sirve). Capturas lo CONCRETO: las muletillas reales, el ritmo real, los modismos del país, cómo abre y cierra, qué emojis usa, qué temas le obsesionan. Si dos creadores diferentes pudieran recibir tu mismo análisis, fallaste.

DATOS DEL CREADOR:
- Nicho declarado: ${p.niche || 'no especificado — infiérelo de los posts'}
- Objetivo declarado: ${p.objective || 'no especificado — infiérelo de los posts'}

POSTS DEL CREADOR (su material real, aprende de aquí):
"""
${p.posts}
"""

INSTRUCCIONES:
1. Lee TODOS los posts buscando el patrón, no la excepción. La voz es lo que se repite.
2. Identifica modismos para inferir país/región (ej: "chévere/parce" Colombia, "padrísimo/neta" México, "bacán/pana" Ecuador/Perú). Español neutro si no hay señales claras.
3. En "muestras_de_voz" copia frases TEXTUALES suyas (palabras exactas de los posts), no parafrasees.
4. "instruccion_para_escribir_como_el" es el campo más importante: un párrafo directivo en segunda persona ("Escribe como un creador que...") que otra IA leerá como system prompt para imitar esta voz. Que sea accionable y específico, no genérico.
5. Si el material es pobre o contradictorio, dilo en los campos pero igual entrega tu mejor lectura.

Responde ÚNICAMENTE con un objeto JSON válido (sin texto antes ni después, sin bloques de código markdown) con ESTE esquema exacto:

{
  "arquetipo": "el personaje/rol que proyecta en 1 frase (ej: 'el mentor cercano que ya lo logró y te empuja sin filtro')",
  "tono": ["3-5 adjetivos concretos de tono"],
  "nivel_formalidad": "tuteo casual | tuteo cercano | mixto | formal — con matiz",
  "ritmo": "describe el ritmo real: frases cortas/largas, pausas, saltos de línea, cómo respira el texto",
  "vocabulario_firma": ["muletillas, palabras y frases que repite — textuales"],
  "modismos_region": "país/región inferido + los modismos concretos detectados",
  "uso_emojis": "cómo y cuánto usa emojis + los emojis específicos típicos suyos",
  "estructura_hooks": ["los patrones reales con que abre sus posts — 2-4 patrones"],
  "temas_pilares": ["sus 3-5 temas/obsesiones recurrentes"],
  "formato_tipico": "cómo estructura un post: listas, párrafos cortos, una idea por línea, CTA final, etc.",
  "muestras_de_voz": ["2-3 frases TEXTUALES suyas que capturan su voz"],
  "que_evita": ["tonos, palabras o estilos que NO usa — su anti-voz"],
  "audiencia": "a quién le habla realmente, inferido del lenguaje",
  "instruccion_para_escribir_como_el": "párrafo directivo listo para inyectar como system prompt a otra IA para que escriba con esta voz exacta"
}`
}

function parseVoiceProfile(raw: string): VoiceProfile {
  // El modelo puede envolver en ```json ... ``` pese a la instrucción.
  let cleaned = raw.trim()
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) cleaned = fence[1].trim()
  // Recorta a las llaves externas por si hay texto residual.
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1)

  const parsed = JSON.parse(cleaned) as VoiceProfile
  if (!parsed.instruccion_para_escribir_como_el || !Array.isArray(parsed.tono)) {
    throw new Error('El perfil de voz devuelto no tiene la forma esperada.')
  }
  return parsed
}

export async function POST(request: NextRequest) {
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

    switch (body.action as Action) {
      case 'extraer-voz': {
        const p = body as ExtraerVozPayload

        if (!p.posts || p.posts.trim().length < 100) {
          return NextResponse.json(
            { error: 'Pega al menos unos cuantos posts (mínimo ~100 caracteres) para extraer tu voz.' },
            { status: 400 }
          )
        }

        const supabase = await createRouteClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
        }

        // Crown jewel → modelo fuerte. Corre 1 vez por creador, costo despreciable.
        const message = await client.messages.create({
          model: 'claude-opus-4-8',
          max_tokens: 2000,
          messages: [{ role: 'user', content: buildExtraerVozPrompt(p) }],
        })

        const text = message.content[0].type === 'text' ? message.content[0].text : ''

        let voiceProfile: VoiceProfile
        try {
          voiceProfile = parseVoiceProfile(text)
        } catch (e) {
          console.error('No se pudo parsear el perfil de voz:', e)
          return NextResponse.json(
            { error: 'No pude estructurar tu voz esta vez. Intenta de nuevo con un par de posts más.' },
            { status: 502 }
          )
        }

        // Upsert: 1 voz activa por creador
        const { error: upsertError } = await supabase
          .from('creator_voice')
          .upsert(
            {
              user_id: user.id,
              raw_posts: p.posts,
              niche: p.niche ?? null,
              objective: p.objective ?? null,
              voice_profile: voiceProfile,
            },
            { onConflict: 'user_id' }
          )

        if (upsertError) {
          console.error('Error guardando voz:', upsertError.message)
          return NextResponse.json(
            { error: 'Extraje tu voz pero falló al guardarla. Intenta otra vez.' },
            { status: 500 }
          )
        }

        return NextResponse.json({ voiceProfile })
      }

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Stanley API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
