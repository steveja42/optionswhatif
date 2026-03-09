'use client'

import { useEffect, useState } from 'react'

interface TokenStatus {
  status: 'ok' | 'refresh_expired' | 'no_tokens'
  issuedAt?: string
  accessToken?: {
    expiresAt: string
    expiresInSeconds: number
    expired: boolean
  }
  refreshToken?: {
    expiresAt: string
    expiresInSeconds: number
    expired: boolean
  }
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'Expired'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function AdminPage() {
  const [status, setStatus] = useState<TokenStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchStatus() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/schwab/status')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStatus() }, [])

  const refresh = status?.refreshToken
  const access = status?.accessToken
  const needsReauth = status?.status === 'no_tokens' || status?.status === 'refresh_expired' || refresh?.expired

  const refreshBarPct = refresh
    ? Math.max(0, Math.min(100, (refresh.expiresInSeconds / (7 * 24 * 3600)) * 100))
    : 0
  const refreshBarColor = refreshBarPct > 40 ? 'success' : refreshBarPct > 15 ? 'warning' : 'danger'

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h4 className="mb-4">Schwab Token Status</h4>

      {loading && <p className="text-muted">Loading…</p>}
      {error && <div className="alert alert-danger">Error: {error}</div>}

      {!loading && !error && status && (
        <>
          {status.status === 'no_tokens' && (
            <div className="alert alert-warning">No tokens stored. Authorization required.</div>
          )}

          {status.issuedAt && (
            <p className="text-muted small mb-3">
              Tokens issued: {new Date(status.issuedAt).toLocaleString()}
            </p>
          )}

          {access && (
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">Access Token</h6>
                <p className="mb-1">
                  <span className={`badge bg-${access.expired ? 'danger' : 'success'} me-2`}>
                    {access.expired ? 'Expired' : 'Valid'}
                  </span>
                  {!access.expired && <span className="text-muted small">{formatDuration(access.expiresInSeconds)} remaining</span>}
                </p>
                <p className="text-muted small mb-0">Expires: {new Date(access.expiresAt).toLocaleString()}</p>
              </div>
            </div>
          )}

          {refresh && (
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title">Refresh Token (7-day window)</h6>
                <p className="mb-2">
                  <span className={`badge bg-${refresh.expired ? 'danger' : 'success'} me-2`}>
                    {refresh.expired ? 'Expired' : 'Valid'}
                  </span>
                  {!refresh.expired && <span className="text-muted small">{formatDuration(refresh.expiresInSeconds)} remaining</span>}
                </p>
                <div className="progress mb-2" style={{ height: 8 }}>
                  <div
                    className={`progress-bar bg-${refreshBarColor}`}
                    style={{ width: `${refreshBarPct}%` }}
                  />
                </div>
                <p className="text-muted small mb-0">Expires: {new Date(refresh.expiresAt).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="d-flex gap-2">
            <a
              href="/api/auth/schwab/login"
              className={`btn btn-${needsReauth ? 'danger' : 'primary'}`}
            >
              {needsReauth ? 'Re-authorize Now' : 'Re-authorize Schwab'}
            </a>
            <button className="btn btn-outline-secondary" onClick={fetchStatus}>
              Refresh Status
            </button>
          </div>

          {!needsReauth && refresh && refresh.expiresInSeconds < 2 * 24 * 3600 && (
            <div className="alert alert-warning mt-3">
              Refresh token expires in less than 2 days — re-authorize soon.
            </div>
          )}
        </>
      )}
    </div>
  )
}
