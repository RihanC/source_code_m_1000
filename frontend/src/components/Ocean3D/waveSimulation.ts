/**
 * Mathematical wave elevation calculation using harmonic Gerstner-like superposition.
 * Used identically across GLSL shaders and TypeScript physics simulation.
 */
export function getWaveElevation(
  x: number,
  z: number,
  time: number,
  heightScale: number,
  speedScale: number
): number {
  const e1 = Math.sin((x * 0.92 + z * 0.38) * 1.8 + time * 1.2 * speedScale) * 0.18;
  const e2 = Math.sin((-x * 0.51 + z * 0.86) * 2.4 + time * 1.6 * speedScale) * 0.12;
  const e3 = Math.sin((x * 0.75 - z * 0.66) * 3.6 + time * 2.0 * speedScale) * 0.06;
  const e4 = Math.sin(Math.sqrt(x * x + z * z) * 2.6 - time * 1.5 * speedScale) * 0.04;
  return (e1 + e2 + e3 + e4) * heightScale;
}
