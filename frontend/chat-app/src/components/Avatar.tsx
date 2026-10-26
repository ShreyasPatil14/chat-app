import { getInitials, getAvatarColor } from '../utils/chat'

export default function Avatar({ name, online = false }: { name: string; online?: boolean }) {
  return (
    <div className="relative shrink-0">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(name)}`}
      >
        {getInitials(name)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  )
}