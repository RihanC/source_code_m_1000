import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getWaveElevation } from './waveSimulation';

interface ArgoBuoyProps {
  seaState: 'calm' | 'moderate' | 'rough';
  viewMode: 'surface' | 'subsurface' | 'satellite';
}

export const ArgoBuoy: React.FC<ArgoBuoyProps> = ({ seaState }) => {
  const buoyRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const buoyX = 1.2;
  const buoyZ = 0.8;

  const heightScale = seaState === 'calm' ? 0.14 : seaState === 'rough' ? 0.42 : 0.25;
  const speedScale = seaState === 'calm' ? 0.65 : seaState === 'rough' ? 1.4 : 0.95;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const waveY = getWaveElevation(buoyX, buoyZ, t, heightScale, speedScale);

    if (buoyRef.current) {
      buoyRef.current.position.set(buoyX, waveY + 0.05, buoyZ);

      // Pitch and roll based on wave gradient
      const waveYdx = getWaveElevation(buoyX + 0.1, buoyZ, t, heightScale, speedScale);
      const waveYdz = getWaveElevation(buoyX, buoyZ + 0.1, t, heightScale, speedScale);
      const tiltX = (waveYdz - waveY) * 2.5;
      const tiltZ = -(waveYdx - waveY) * 2.5;

      buoyRef.current.rotation.x = THREE.MathUtils.lerp(buoyRef.current.rotation.x, tiltX, 0.1);
      buoyRef.current.rotation.z = THREE.MathUtils.lerp(buoyRef.current.rotation.z, tiltZ, 0.1);
    }

    // Flashing telemetry beacon
    if (beaconRef.current) {
      const flash = (Math.sin(t * 5.0) + 1.0) * 0.5;
      (beaconRef.current.material as THREE.MeshBasicMaterial).color.setRGB(
        0.1 + flash * 0.9,
        0.9 + flash * 0.1,
        0.2 + flash * 0.8
      );
    }

    // Telemetry pulse ring expansion
    if (ringRef.current) {
      const ringScale = (t % 2.5) / 2.5;
      ringRef.current.scale.set(1 + ringScale * 3.5, 1 + ringScale * 3.5, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        1.0 - ringScale * 1.2
      );
    }
  });

  return (
    <group ref={buoyRef}>
      {/* ─── 1. Main Float Cylinder Hull (Yellow scientific casing) ─── */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
        <meshStandardMaterial
          color="#eab308"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* ─── 2. Upper Collar & Float Foam Collar ─── */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.4}
        />
      </mesh>

      {/* ─── 3. Submerged Damping Stabilization Disk ─── */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* ─── 4. Satellite Telemetry Antenna Mast ─── */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.22, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ─── 5. Beacon Light on Antenna Tip ─── */}
      <mesh ref={beaconRef} position={[0, 0.33, 0]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      {/* ─── 6. Expanding Telemetry Pulse Ping Ring ─── */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.33, 0]}
      >
        <ringGeometry args={[0.04, 0.07, 24]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
