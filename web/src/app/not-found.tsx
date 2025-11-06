'use client'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-400 max-w-xl">
        The page you were looking for does not exist. Please return to the application and try again.
      </p>
    </main>
  )
}

