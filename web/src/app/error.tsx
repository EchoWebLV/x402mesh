'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('Global application error:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-400 max-w-xl mb-6">
        An unexpected error occurred while rendering this page. Try refreshing, or return to the home experience.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary font-semibold hover:scale-105 transition"
      >
        Try again
      </button>
    </main>
  )
}

