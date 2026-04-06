'use client'

import { Link2, TrendingUp } from 'lucide-react'

interface AffiliateProgram {
  id: string
  programa: string
  clics: number
  conversiones: number
  comision: string
  totalGanado: number
  estado: 'activo' | 'pausado'
}

const affiliatePrograms: AffiliateProgram[] = [
  {
    id: '1',
    programa: 'Amazon Associates',
    clics: 2840,
    conversiones: 124,
    comision: '4-10%',
    totalGanado: 420,
    estado: 'activo',
  },
  {
    id: '2',
    programa: 'Hostinger',
    clics: 1250,
    conversiones: 38,
    comision: '60%',
    totalGanado: 1140,
    estado: 'activo',
  },
  {
    id: '3',
    programa: 'Notion Pro',
    clics: 890,
    conversiones: 67,
    comision: '20%',
    totalGanado: 268,
    estado: 'activo',
  },
  {
    id: '4',
    programa: 'Coursera',
    clics: 560,
    conversiones: 22,
    comision: '45%',
    totalGanado: 495,
    estado: 'activo',
  },
  {
    id: '5',
    programa: 'NordVPN',
    clics: 320,
    conversiones: 11,
    comision: '100%',
    totalGanado: 1210,
    estado: 'pausado',
  },
  {
    id: '6',
    programa: 'Canva Pro',
    clics: 740,
    conversiones: 49,
    comision: '25%',
    totalGanado: 183,
    estado: 'activo',
  },
]

const totalEarned = affiliatePrograms.reduce((acc, p) => acc + p.totalGanado, 0)
const totalConversions = affiliatePrograms.reduce((acc, p) => acc + p.conversiones, 0)

export function AffiliatesView() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Afiliados</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Seguimiento de programas de afiliados
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Programas activos</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {affiliatePrograms.filter((p) => p.estado === 'activo').length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Total conversiones</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalConversions.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">$</span>
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Total ganado</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${totalEarned.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Affiliates table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Programas de afiliados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Programa</th>
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Estado</th>
                <th className="text-right px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Clics</th>
                <th className="text-right px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Conversiones</th>
                <th className="text-left px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Comisión</th>
                <th className="text-right px-6 py-3 text-zinc-500 dark:text-zinc-400 font-medium">Total ganado</th>
              </tr>
            </thead>
            <tbody>
              {affiliatePrograms.map((program) => (
                <tr
                  key={program.id}
                  className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Link2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{program.programa}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        program.estado === 'activo'
                          ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-600/30'
                      }
                    >
                      {program.estado === 'activo' ? 'Activo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                    {program.clics.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                    {program.conversiones}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{program.comision}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    ${program.totalGanado.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
