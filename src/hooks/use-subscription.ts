'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type SubStatus = 'loading' | 'pro' | 'trial' | 'expired'

// Estado de suscripción del usuario para bloquear la app cuando vence la prueba.
export function useSubscription() {
  const [status, setStatus] = useState<SubStatus>('loading')

  useEffect(() => {
    let active = true
    supabase
      .from('profiles')
      .select('plan, trial_ends_at')
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        // Sin fila de perfil todavía → no bloquear (usuario recién creado).
        if (!data) setStatus('trial')
        else if (data.plan === 'pro') setStatus('pro')
        else if (data.trial_ends_at && new Date(data.trial_ends_at) > new Date()) setStatus('trial')
        else setStatus('expired')
      })
    return () => {
      active = false
    }
  }, [])

  return { status, locked: status === 'expired' }
}
