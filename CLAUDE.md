@AGENTS.md

# Creator Hub — Manual del repo

> ⚠️ **Next.js 16 con breaking changes** (ver `AGENTS.md`): APIs y convenciones difieren de tu training. Lee `node_modules/next/dist/docs/` antes de escribir código.

## Qué es
SaaS multi-usuario para creadores de contenido. Modelo actual: **lead magnet gratis** — la app se da gratis a cambio del email para construir lista. Producción: https://creator-hub-vert-psi.vercel.app

Documentación de negocio/estrategia en el vault: `~/AI-Business/andre-brain/01-projects/creator-hub/` (overview, roadmap, spec de Stanley, plan de lanzamiento). Este repo es la **mano que construye**; el vault es el **cerebro**.

## Stack
- **Next.js 16.2** (App Router) + **React 19** + TypeScript
- **Supabase** (`@supabase/ssr`) — auth + DB, multi-tenant con RLS por `user_id`
- **Anthropic SDK** (`@anthropic-ai/sdk`) — IA. Opus para estrategia, Haiku para generación masiva
- **Tailwind 4** + **shadcn** + base-ui + lucide
- **dnd-kit** (kanban/sortable) · **recharts** (gráficas finanzas)

## Estructura
```
src/app/(dashboard)   → app autenticada (secciones del producto)
src/app/(auth)        → login/registro
src/app/api           → endpoints server (incl. /api/tiktok-shop = generador IA)
src/app/public        → media kit público
src/components/<feature>  → content, ideas, calendar, kanban, brands, affiliates,
                            finances, income, mediakit, dashboard, layout, ui
src/lib               → clientes Supabase (incl. supabase-route.ts server)
supabase/migrations   → 001_init · 002_auth · 003_profiles · 004_script_usage · 005_finances
```

## Features actuales (deployadas)
- **Script UGC** (ruta `/tiktok-shop`, endpoint `/api/tiktok-shop`): generador de guiones con IA (producto + audiencia + plataforma + estilo → hook/storytelling/CTA). Prompt nivel storyteller élite. Rate limit **3 scripts/día** por usuario (tabla `script_usage`).
- **Media Kit** + Portfolio (ⓘ portfolio vive en localStorage, no Supabase).
- **Finanzas**: Ingresos/Gastos/Presupuestos por categoría (tablas `expenses`, `budgets`).
- Contenido · Ideas · Calendario · Kanban · Marcas · Afiliados.

## 🎯 En construcción: Módulo Stanley LatAm (Coach IA) — PRIORIDAD
"Head of Content con IA" como módulo premium **$149/mes**. Réplica mejorada de Stanley (getstanley.ai). Spec completo: `~/AI-Business/andre-brain/01-projects/creator-hub/09-modulo-stanley-latam.md`.

**Construir SOBRE la ruta `/tiktok-shop` existente (reusar 70%), no desde cero.**

Los **4 sombreros**:
1. 🎯 Estratega — plan de ángulos/calendario
2. ✍️ Copywriter en tu voz — guion imitando cómo habla el creador
3. 🧠 Entrevistador — preguntas → saca ideas → contenido
4. 📊 Analista (Predictor) — score 0-100 de "probabilidad de pegar" + por qué + fix
   - **v0 heurístico** (en el MVP): solo prompt, sin datos externos
   - **v2 con datos** (Fase 2): Instagram Graph API + histórico real = foso tipo DataFast

**MVP v0 (sin Graph API):** creador pega 5-10 posts → Claude extrae su "voz" → guardar en tabla `creator_voice` (memoria persistente, futura pgvector) → UI de 4 botones → output enchufado a secciones existentes (idea→banco, plan→calendario).

**Próximos pasos técnicos:** migración `006_creator_voice` · prompt de extracción de voz · UI 4 botones · pagos Stripe/dLocal.

## Reglas de operación
- **Español neutro, tuteo** (NO voseo) en toda la UI y el copy generado.
- **Control de costo Anthropic**: tope $50/mes, ~$0.03/script. Recargar créditos antes de mandar tráfico.
- **Commits frecuentes** — cada sesión nueva de Claude Code debe arrancar del estado real del código.
- **Una sola sesión tocando el repo a la vez** (evitar conflictos de git entre chats paralelos).
- Vercel NO lee `.env.local` → actualizar env vars en el dashboard + redeploy.
