/**
 * OceanWaveDivider — Animated 3-layer SVG Wave Separator
 * Renders flowing ocean waves between page sections.
 * Each layer has slightly different speed and opacity.
 */

interface OceanWaveDividerProps {
  /** Flip vertically so wave troughs face up */
  flip?: boolean;
  className?: string;
}

export function OceanWaveDivider({ flip = false, className = '' }: OceanWaveDividerProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className}`}
      style={{
        transform: flip ? 'scaleY(-1)' : undefined,
        height: '56px',
        position: 'relative',
      }}
      aria-hidden="true"
    >
      {/* Layer 3 — slowest, most transparent */}
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200%',
          height: '100%',
          animation: 'waveSlide3 18s linear infinite',
          opacity: 0.18,
        }}
      >
        <path
          d="M0,28 C180,50 360,10 540,28 C720,46 900,10 1080,28 C1260,46 1350,18 1440,28 L1440,56 L0,56 Z"
          fill="#0ea5e9"
        />
      </svg>

      {/* Layer 2 — medium speed */}
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200%',
          height: '100%',
          animation: 'waveSlide2 12s linear infinite',
          opacity: 0.12,
        }}
      >
        <path
          d="M0,18 C120,38 300,6 480,24 C660,42 840,8 1020,24 C1200,40 1320,14 1440,20 L1440,56 L0,56 Z"
          fill="#06b6d4"
        />
      </svg>

      {/* Layer 1 — fastest, most visible */}
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200%',
          height: '100%',
          animation: 'waveSlide1 8s linear infinite',
          opacity: 0.09,
        }}
      >
        <path
          d="M0,36 C240,12 480,48 720,32 C960,16 1200,44 1440,36 L1440,56 L0,56 Z"
          fill="#38bdf8"
        />
      </svg>
    </div>
  );
}
