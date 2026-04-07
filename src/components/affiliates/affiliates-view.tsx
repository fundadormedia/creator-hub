'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Affiliate } from '@/lib/supabase'
import { Link2, TrendingUp } from 'lucide-react'

export function AffiliatesView() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('affiliates')
      .select('*')
      .order('total_earned', { ascending: false })
      .then(({ data }) => {
        if (data) setAffiliates(data as Affiliate[])
        setLoading(false)
      })
  }, [])

  const totalEarned = affiliates.reduce((acc, p) => acc + p.total_earned, 0)
  const totalConversions = affiliates.reduce((acc, p) => acc + p.conversions, 0)

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
            {affiliates.filter((p) => p.status === 'activo').length}
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
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-zinc-500 text-sm">Cargando...</p>
          </div>
        ) : (
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
                {affiliates.map((program) => (
                  <tr
                    key={program.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Link2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{program.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          program.status === 'activo'
                            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-600/30'
                        }
                      >
                        {program.status === 'activo' ? 'Activo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                      {program.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                      {program.conversions}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{program.commission}</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      ${program.total_earned.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
