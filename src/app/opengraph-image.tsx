import { ImageResponse } from 'next/og'
 
export const alt = 'Invoq - Modern Billing Operations'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 84,
          background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f172a',
          fontWeight: 800,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '40px'
          }}
        >
          <div style={{
            background: '#2563eb',
            color: 'white',
            width: '140px',
            height: '140px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 100,
            lineHeight: 1,
            paddingTop: '10px'
          }}>
            I
          </div>
          <div style={{ fontSize: 120, letterSpacing: '-0.05em' }}>Invoq</div>
        </div>
        <div style={{ fontSize: 48, color: '#475569', fontWeight: 600 }}>
          Modern Billing Operations
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
