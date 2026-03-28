import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const WIDTH = 1200
const HEIGHT = 630

const LOGO_URL = 'https://www.optionswhatif.com/logo512.png'

type Row = { label: string; profit: number }

function makeSampleRows(strategy: string): Row[] {
  const s = strategy.toUpperCase()
  if (s === 'PUT') {
    return [
      { label: '-10%', profit: 320 },
      { label: '-5%',  profit: 95  },
      { label: '0%',   profit: -150 },
      { label: '+5%',  profit: -150 },
      { label: '+10%', profit: -150 },
    ]
  }
  if (s === 'CALL') {
    return [
      { label: '-10%', profit: -120 },
      { label: '-5%',  profit: -120 },
      { label: '0%',   profit: -120 },
      { label: '+5%',  profit: 80  },
      { label: '+10%', profit: 310 },
    ]
  }
  // straddle
  return [
    { label: '-10%', profit: 280  },
    { label: '-5%',  profit: -40  },
    { label: '0%',   profit: -160 },
    { label: '+5%',  profit: -40  },
    { label: '+10%', profit: 280  },
  ]
}

function strategyLabel(strategy: string): string {
  const s = strategy.toUpperCase()
  if (s === 'PUT') return 'Put Option'
  if (s === 'CALL') return 'Call Option'
  return 'Straddle'
}

function strategyColor(strategy: string): string {
  const s = strategy.toUpperCase()
  if (s === 'PUT') return '#60a5fa'
  if (s === 'CALL') return '#22c55e'
  return '#a78bfa'
}

function BrandedImage({ tagline = 'Options Profit Calculator & ROI Visualizer' }: { tagline?: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(37,99,235,0.08) 59px, rgba(37,99,235,0.08) 60px), repeating-linear-gradient(90deg, transparent, transparent 119px, rgba(37,99,235,0.08) 119px, rgba(37,99,235,0.08) 120px)',
        }}
      />
      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_URL}
        width={200}
        height={200}
        alt="logo"
        style={{ marginBottom: 24, borderRadius: 24 }}
      />
      {/* App name */}
      <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, color: '#f8fafc', letterSpacing: '-2px' }}>
        Options
        <span style={{ color: '#60a5fa' }}>WhatIf</span>
      </div>
      {/* Tagline */}
      <div style={{ display: 'flex', fontSize: 28, color: '#93c5fd', marginTop: 16 }}>
        {tagline}
      </div>
      {/* Bottom accent bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #1d4ed8, #60a5fa, #1d4ed8)',
          display: 'flex',
        }}
      />
    </div>
  )
}

function TickerImage({
  symbol,
  strategy,
  expiry,
}: {
  symbol: string
  strategy: string
  expiry: string | null
}) {
  const rows = makeSampleRows(strategy)
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.profit)))
  const label = strategyLabel(strategy)
  const badgeColor = strategyColor(strategy)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        padding: '48px 56px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
          display: 'flex',
        }}
      />

      {/* Header: logo + site name */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_URL}
          width={100}
          height={100}
          alt="logo"
          style={{ borderRadius: 12, marginRight: 14 }}
        />
        <span style={{ fontSize: 22, color: '#60a5fa', fontWeight: 700 }}>OptionsWhatIf</span>
      </div>

      {/* Ticker + strategy badge */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: expiry ? 8 : 28 }}>
        <span style={{ fontSize: 80, fontWeight: 900, color: '#f8fafc', letterSpacing: '-3px' }}>
          {symbol}
        </span>
        <span
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#0f172a',
            background: badgeColor,
            borderRadius: 8,
            padding: '4px 16px',
            marginBottom: 12,
            display: 'flex',
          }}
        >
          {label}
        </span>
      </div>

      {/* Expiry */}
      {expiry && (
        <div style={{ display: 'flex', fontSize: 20, color: '#94a3b8', marginBottom: 24 }}>
          Expiry: {expiry}
        </div>
      )}

      {/* Mini bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flex: 1 }}>
        {rows.map((row) => {
          const isPos = row.profit >= 0
          const barH = Math.round((Math.abs(row.profit) / maxAbs) * 180)
          return (
            <div
              key={row.label}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: isPos ? '#22c55e' : '#ef4444',
                  marginBottom: 6,
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                {isPos ? '+' : ''}
                {row.profit}
              </span>
              <div
                style={{
                  width: '100%',
                  height: barH,
                  background: isPos ? '#22c55e' : '#ef4444',
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.85,
                  display: 'flex',
                }}
              />
              <span
                style={{ fontSize: 16, color: '#94a3b8', marginTop: 8, fontWeight: 600, display: 'flex' }}
              >
                {row.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer subtitle */}
      <div style={{ display: 'flex', fontSize: 18, color: '#475569', marginTop: 16 }}>
        Illustrative profit model at various price points · optionswhatif.com
      </div>
    </div>
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol   = searchParams.get('symbol')?.toUpperCase().slice(0, 5) ?? null
  const strategy = searchParams.get('strategy') ?? null
  const expiry   = searchParams.get('expiry') ?? null
  const page     = searchParams.get('page') ?? null

  const hasParams = Boolean(symbol && strategy)

  const jsx = hasParams ? (
    <TickerImage symbol={symbol!} strategy={strategy!} expiry={expiry} />
  ) : page === 'addon' ? (
    <BrandedImage tagline="Google Sheets Add-on for Options Strategy Modeling" />
  ) : (
    <BrandedImage />
  )

  const img = new ImageResponse(jsx, { width: WIDTH, height: HEIGHT })

  return new Response(img.body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
