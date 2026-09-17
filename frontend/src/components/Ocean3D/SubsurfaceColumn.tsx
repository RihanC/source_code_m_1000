import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SubsurfaceColumnProps {
  viewMode: 'surface' | 'subsurface' | 'satellite';
}

export const SubsurfaceColumn: React.FC<SubsurfaceColumnProps> = ({ viewMode }) => {
  const probeRef = useRef<THREE.Group>(null);
  const thermoclineRef = useRef<THREE.Mesh>(null);

  // Depth markers scale:
  // 0.0 = 0m (Surface)
  // -0.5 = -50m (Mixed Layer)
  // -1.1 = -200m (Thermocline Peak)
  // -1.8 = -500m (Intermediate Waters)
  // -2.5 = -1000m (Seafloor / Abyssal Base)

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (probeRef.current) {
      // Gentle vertical oscillation of autonomous CTD depth profiler
      probeRef.current.position.y = -1.25 + Math.sin(t * 0.8) * 1.1;
    }
    if (thermoclineRef.current) {
      thermoclineRef.current.position.y = -1.1 + Math.sin(t * 0.4) * 0.04;
    }
  });

  const isSubsurface = viewMode === 'subsurface';
  const columnOpacity = isSubsurface ? 0.35 : 0.15;

  return (
    <group position={[0, 0, 0]}>
      {/* ─── 1. Translucent Deep Ocean Water Volume ─── */}
      <mesh position={[0, -1.25, 0]}>
        <boxGeometry args={[5.5, 2.5, 5.5]} />
        <meshPhysicalMaterial
          color="#021833"
          transparent
          opacity={columnOpacity}
          roughness={0.1}
          metalness={0.1}
          transmission={0.4}
          ior={1.33}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ─── 2. Bounding Depth Rail Outlines ─── */}
      <lineSegments position={[0, -1.25, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(5.5, 2.5, 5.5)]} />
        <lineBasicMaterial
          color={isSubsurface ? '#38bdf8' : '#0369a1'}
          transparent
          opacity={isSubsurface ? 0.6 : 0.25}
          linewidth={1}
        />
      </lineSegments>

      {/* ─── 3. Mixed Layer Boundary (50m, y = -0.5) ─── */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.4, 5.4, 16, 16]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe={!isSubsurface}
          transparent
          opacity={isSubsurface ? 0.18 : 0.08}
        />
      </mesh>

      {/* ─── 4. Main Thermocline Iso-surface (200m, y = -1.1) ─── */}
      <mesh ref={thermoclineRef} position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.4, 5.4, 32, 32]} />
        <meshStandardMaterial
          color={isSubsurface ? '#6366f1' : '#1e3a8a'}
          wireframe
          transparent
          opacity={isSubsurface ? 0.45 : 0.18}
          emissive={isSubsurface ? '#4338ca' : '#000000'}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* ─── 5. Seafloor Bathymetry / Abyssal Basin (1000m, y = -2.5) ─── */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, 5.5, 24, 24]} />
        <meshStandardMaterial
          color="#05192d"
          wireframe
          roughness={0.9}
        />
      </mesh>

      {/* ─── 6. Autonomous Subsurface CTD Profiler Sensor ─── */}
      {isSubsurface && (
        <group ref={probeRef} position={[-1.2, -1.25, 1.2]}>
          {/* Probe Body */}
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Sensor Tip */}
          <mesh position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Active Sensor Laser Ping Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.45, 24]} />
            <meshBasicMaterial
              color="#00f2fe"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Vertical Tether Cable */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 2.5, 6]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {/* ─── 7. Depth Marker Pins on Vertical Rails ─── */}
      {[-0.05, -0.5, -1.1, -1.8, -2.48].map((yVal, idx) => (
        <group key={idx} position={[-2.75, yVal, -2.75]}>
          <mesh>
            <boxGeometry args={[0.15, 0.02, 0.15]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
