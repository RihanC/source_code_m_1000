/**
 * OceanParticles — Bioluminescent Particle Background
 * Canvas-based drifting particle system simulating deep-ocean luminescence.
 * Responds subtly to mouse movement (parallax drift).
 * Fully self-contained — renders behind all page content via fixed positioning.
 */
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  opacityDir: number; // +1 or -1 for pulse
  hue: number; // 180–220 range (cyan/blue spectrum)
  pulseSpeed: number;
}

const PARTICLE_COUNT = 110;

export function OceanParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to fill window
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Track mouse
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    // Seed particles
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.8 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
      hue: 185 + Math.random() * 40,
      pulseSpeed: 0.003 + Math.random() * 0.006,
    }));

    let frame = 0;

    const draw = () => {
      frame++;
      const { width, height } = canvas;

      // Fade-clear — partial alpha gives trailing glow
      ctx.fillStyle = 'rgba(5, 12, 24, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        // Subtle mouse parallax repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < 14000) {
          const dist = Math.sqrt(distSq);
          const force = (120 - dist) / 120 * 0.012;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Apply velocity with damping
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.x += p.vx;
        p.y += p.vy;

        // Opacity pulse
        p.opacity += p.opacityDir * p.pulseSpeed;
        if (p.opacity > 0.55) { p.opacity = 0.55; p.opacityDir = -1; }
        if (p.opacity < 0.06) { p.opacity = 0.06; p.opacityDir = 1; }

        // Wrap around edges
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y = height + 4;
        if (p.y > height + 4) p.y = -4;

        // Draw glow particle
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 72%, ${p.opacity})`);
        grad.addColorStop(0.5, `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.4})`);
        grad.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw subtle connecting filaments between nearby particles (every 3 frames for perf)
      if (frame % 3 === 0) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              const alpha = (1 - dist / 80) * 0.06;
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
}
