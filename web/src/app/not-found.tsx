'use client'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
        <a href="/" className="text-blue-400 hover:underline">
          Return Home
        </a>
      </div>
    </div>
  )
}

