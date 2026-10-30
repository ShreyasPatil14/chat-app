import { useEffect, useRef, useState } from 'react'

const SHOW_MS = 2200
const REDUCED_MS = 1000
const FADE_MS = 300

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const showFor = reduced ? REDUCED_MS : SHOW_MS

    const fadeTimer = setTimeout(() => setLeaving(true), showFor)
    const doneTimer = setTimeout(() => onDoneRef.current(), showFor + FADE_MS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  return (
    <div
      role="status"
      aria-label="ChatApp"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <svg className="splash-logo w-24 h-24" viewBox="0 0 512 512" aria-hidden="true">
        <path
          fill="#2563eb"
          d="M96 64h320a48 48 0 0 1 48 48v208a48 48 0 0 1-48 48H224l-96 80v-80H96a48 48 0 0 1-48-48V112a48 48 0 0 1 48-48z"
        />
        <circle cx="160" cy="216" r="28" fill="#fff" />
        <circle cx="256" cy="216" r="28" fill="#fff" />
        <circle cx="352" cy="216" r="28" fill="#fff" />
      </svg>
      <h1 className="gradient-text splash-title mt-4 text-4xl font-bold">ChatApp</h1>
    </div>
  )
}