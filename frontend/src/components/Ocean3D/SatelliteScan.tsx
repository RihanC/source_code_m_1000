import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteScanProps {
  viewMode: 'surface' | 'subsurface' | 'satellite';
}

export const SatelliteScan: React.FC<SatelliteScanProps> = ({ viewMode }) => {
  const satGroupRef = useRef<THREE.Group>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const sweepCircleRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (satGroupRef.current) {
      // Gentle orbit sway
      satGroupRef.current.position.x = Math.sin(t * 0.4) * 0.6;
      satGroupRef.current.position.z = Math.cos(t * 0.4) * 0.4;
      satGroupRef.current.rotation.y = t * 0.2;
    }

    if (sweepCircleRef.current) {
      const scanPhase = (t * 0.8) % 1;
      sweepCircleRef.current.scale.set(1 + scanPhase * 2.2, 1 + scanPhase * 2.2, 1);
      (sweepCircleRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        (1 - scanPhase) * 0.5
      );
    }
  });

  const isSatMode = viewMode === 'satellite';
  const beamOpacity = isSatMode ? 0.28 : 0.12;

  return (
    <group position={[0, 0, 0]}>
      {/* ─── 1. Orbiting Satellite Body ─── */}
      <group ref={satGroupRef} position={[0, 2.8, 0]}>
        {/* Central Satellite Bus */}
        <mesh>
          <boxGeometry args={[0.22, 0.18, 0.22]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Altimeter Radar Antenna Dish pointing down */}
        <mesh position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.06, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Solar Panels (Left & Right Wings) */}
        <mesh position={[-0.34, 0, 0]}>
          <boxGeometry args={[0.42, 0.015, 0.16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.7} />
        </mesh>
        <mesh position={[0.34, 0, 0]}>
          <boxGeometry args={[0.42, 0.015, 0.16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.7} />
        </mesh>

        {/* Small Sensor Lens glow */}
        <mesh position={[0, -0.15, 0]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* ─── 2. Conical Altimeter Scanning Beam ─── */}
      <mesh
        ref={coneRef}
        position={[0, 1.4, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[1.5, 2.8, 32, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={beamOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ─── 3. Surface Radar Footprint Scan Ring ─── */}
      <mesh
        ref={sweepCircleRef}
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.7, 0.78, 32]} />
        <meshBasicMaterial
          color="#00f2fe"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
