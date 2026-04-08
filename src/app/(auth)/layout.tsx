import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Creator Hub',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0f] flex items-center justify-center p-4">
      {children}
    </div>
  )
}
