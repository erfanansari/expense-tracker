import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Kharji – Personal Finance Tracker';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#171717',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
        {/* Zap icon box */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* SVG Zap */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#171717"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        <span style={{ fontSize: '72px', fontWeight: '700', color: '#ffffff', letterSpacing: '-2px' }}>Kharji</span>
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '28px',
          fontWeight: '400',
          color: '#a3a3a3',
          margin: 0,
          letterSpacing: '0.5px',
        }}
      >
        Personal Finance Tracker
      </p>

      {/* Divider */}
      <div
        style={{
          marginTop: '48px',
          width: '120px',
          height: '2px',
          backgroundColor: '#404040',
          borderRadius: '2px',
        }}
      />

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
        {['Expenses', 'Income', 'Assets', 'Reports'].map((label) => (
          <div
            key={label}
            style={{
              paddingTop: '10px',
              paddingBottom: '10px',
              paddingLeft: '20px',
              paddingRight: '20px',
              borderRadius: '100px',
              border: '1px solid #404040',
              color: '#737373',
              fontSize: '18px',
              fontWeight: '500',
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  );
}
