'use client'

import { CapturasAnalyzer } from '@/components/mediakit/capturas-analyzer'
import { CreatorProfileCard } from '@/components/mediakit/creator-profile-card'
import { AudienceCard } from '@/components/mediakit/audience-card'
import { PortfolioCard } from '@/components/mediakit/portfolio-card'
import { ShareMediaKit } from '@/components/mediakit/share-mediakit'

// ============================================================
// Media Kit — una sola presentación, no una lista de kits.
// Se completa una vez (perfil) y se actualiza mes a mes (capturas).
//
// La antigua lista de kits múltiples se retiró; su lógica sigue en
// lib/mediakit (getMediaKits, createMediaKit…) y en la ruta /mediakit/[id]
// por si algún día se recupera el concepto de varios kits.
// ============================================================

export default function MediaKitPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Media Kit
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tu presentación profesional para marcas. Se completa una vez y se actualiza con tus
          capturas mes a mes.
        </p>
      </div>

      <ShareMediaKit />

      <CapturasAnalyzer />

      <CreatorProfileCard />

      <AudienceCard />

      <PortfolioCard />
    </div>
  )
}
