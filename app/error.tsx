'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mt-4">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Something went wrong</h4>
        <p>{error.message}</p>
        <button className="btn btn-outline-danger" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  )
}
