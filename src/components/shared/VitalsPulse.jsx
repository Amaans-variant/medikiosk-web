export default function VitalsPulse({ className = '' }) {
  // A single continuous ECG-style trace, animated via stroke-dashoffset.
  // Pure SVG + CSS — no canvas, no external assets, 60fps on kiosk hardware.
  const path =
    'M0,40 L60,40 L80,40 L92,10 L104,70 L116,40 L140,40 L156,40 L166,20 L176,60 L186,40 L220,40 ' +
    'L280,40 L300,40 L312,10 L324,70 L336,40 L360,40 L376,40 L386,20 L396,60 L406,40 L440,40 ' +
    'L500,40 L520,40 L532,10 L544,70 L556,40 L580,40 L596,40 L606,20 L616,60 L626,40 L660,40 L720,40'

  return (
    <svg
      viewBox="0 0 720 80"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Simulated vitals waveform"
    >
      <line x1="0" y1="40" x2="720" y2="40" stroke="#E2E5E9" strokeWidth="1" />
      <path
        d={path}
        fill="none"
        stroke="#059669"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="30 370"
        className="animate-pulseWave"
      />
    </svg>
  )
}
