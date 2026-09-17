import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 280;

function seededPseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const [INITIAL_POSITIONS, BASE_POSITIONS] = (() => {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const initial = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (seededPseudoRandom(i * 3 + 1) - 0.5) * 5.0;
    const y = -seededPseudoRandom(i * 3 + 2) * 2.2 - 0.1; // Subsurface depth 0.1m to 2.3m
    const z = (seededPseudoRandom(i * 3 + 3) - 0.5) * 5.0;

    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    initial[i * 3] = x;
    initial[i * 3 + 1] = y;
    initial[i * 3 + 2] = z;
  }

  return [initial, pos];
})();

export const MarineParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const positionAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = positionAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const initX = INITIAL_POSITIONS[i3];
      const initY = INITIAL_POSITIONS[i3 + 1];
      const initZ = INITIAL_POSITIONS[i3 + 2];

      // Gentle orbital fluid eddy drift
      array[i3] = initX + Math.sin(t * 0.5 + initY * 2.0) * 0.15;
      array[i3 + 1] = initY + Math.sin(t * 0.8 + initX * 2.0) * 0.08;
      array[i3 + 2] = initZ + Math.cos(t * 0.5 + initX * 1.5) * 0.15;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[BASE_POSITIONS, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#22d3ee"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
