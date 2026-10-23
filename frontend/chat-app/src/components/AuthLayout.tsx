import type { ReactNode } from 'react'

export default function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-center text-blue-600">ChatApp</h1>
        <h2 className="mt-1 mb-6 text-center text-gray-600">{title}</h2>
        {children}
      </div>
    </div>
  )
}
