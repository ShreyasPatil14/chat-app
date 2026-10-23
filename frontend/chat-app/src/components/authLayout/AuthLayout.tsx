import type { ReactNode } from 'react'
import './AuthLayout.css'

export default function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg select-none">
      <div className="w-full max-w-sm card-bg rounded-xl shadow p-9">
        <h1 className="text-2xl font-semibold text-center gradient-text">ChatApp</h1>
        <h2 className="mt-1 mb-6 text-center text-gray-400">{title}</h2>
        {children}
      </div>
    </div>
  )
}