const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-600',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
]

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function getAvatarColor(name: string): string {
  let hash = 0
  for (const ch of name) {
    hash = (hash * 31 + ch.charCodeAt(0)) | 0
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function formatChatTime(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (date >= startOfToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (date >= startOfYesterday) return 'Yesterday'
  return date.toLocaleDateString()
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}