import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface OceanSurfaceMeshProps {
  seaState: 'calm' | 'moderate' | 'rough';
  viewMode: 'surface' | 'subsurface' | 'satellite';
  wireframe?: boolean;
}

const vertexShader = `
  uniform float uTime;
  uniform float uWaveSpeed;
  uniform float uWaveHeight;
  uniform float uMode;

  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormalVec;
  varying vec3 vWorldPosition;

  float calculateWave(vec2 pos, vec2 dir, float freq, float amp, float speed) {
    return sin(dot(pos, dir) * freq + uTime * speed) * amp;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Superposition of multi-directional sinusoidal wave harmonics
    vec2 p = pos.xy;
    float e1 = calculateWave(p, normalize(vec2(0.92, 0.38)), 1.8, 0.18, 1.2 * uWaveSpeed);
    float e2 = calculateWave(p, normalize(vec2(-0.51, 0.86)), 2.4, 0.12, 1.6 * uWaveSpeed);
    float e3 = calculateWave(p, normalize(vec2(0.75, -0.66)), 3.6, 0.06, 2.0 * uWaveSpeed);
    float e4 = sin(length(p) * 2.6 - uTime * 1.5 * uWaveSpeed) * 0.04;

    float totalElevation = (e1 + e2 + e3 + e4) * uWaveHeight;
    pos.z += totalElevation;
    vElevation = totalElevation;

    // Numerical finite-difference normal calculation for accurate wave shading
    float eps = 0.04;
    float eX = calculateWave(p + vec2(eps, 0.0), normalize(vec2(0.92, 0.38)), 1.8, 0.18, 1.2 * uWaveSpeed) +
               calculateWave(p + vec2(eps, 0.0), normalize(vec2(-0.51, 0.86)), 2.4, 0.12, 1.6 * uWaveSpeed);
    float eY = calculateWave(p + vec2(0.0, eps), normalize(vec2(0.92, 0.38)), 1.8, 0.18, 1.2 * uWaveSpeed) +
               calculateWave(p + vec2(0.0, eps), normalize(vec2(-0.51, 0.86)), 2.4, 0.12, 1.6 * uWaveSpeed);
    
    vec3 tangentX = vec3(eps, 0.0, (eX * uWaveHeight - totalElevation));
    vec3 tangentY = vec3(0.0, eps, (eY * uWaveHeight - totalElevation));
    vec3 calcNormal = normalize(cross(tangentX, tangentY));
    
    vNormalVec = normalMatrix * calcNormal;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  uniform vec3 uColorWaterDeep;
  uniform vec3 uColorWaterSurface;
  uniform vec3 uColorCrest;
  uniform vec3 uColorFoam;
  uniform float uMode;
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormalVec;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormalVec);

    // Color gradient based on wave height
    float heightNorm = clamp((vElevation + 0.18) / 0.42, 0.0, 1.0);
    vec3 baseWater = mix(uColorWaterDeep, uColorWaterSurface, heightNorm);

    // Dynamic wave crest foam
    float foamThreshold = 0.70;
    if (heightNorm > foamThreshold) {
      float foamFactor = smoothstep(foamThreshold, 0.95, heightNorm);
      baseWater = mix(baseWater, uColorFoam, foamFactor * 0.85);
    }

    // Fresnel reflection for realistic oceanic surface sheen
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.2);
    vec3 surfaceSheen = mix(baseWater, uColorCrest, fresnel * 0.9);

    // Specular sunlight reflection glint
    vec3 sunDir = normalize(vec3(0.6, 1.2, 0.5));
    vec3 halfVec = normalize(sunDir + viewDir);
    float specular = pow(max(dot(normal, halfVec), 0.0), 55.0);
    vec3 finalColor = surfaceSheen + vec3(1.0, 0.98, 0.92) * specular * 1.1;

    // View Mode 1: Subsurface Thermocline Mode (temperature gradient heat map)
    if (uMode > 0.5 && uMode < 1.5) {
      vec3 warmSST = vec3(0.96, 0.42, 0.12);   // 29°C SST
      vec3 thermocline = vec3(0.08, 0.82, 0.88); // 20°C
      vec3 abyss = vec3(0.03, 0.12, 0.38);       // 8°C
      float tFactor = clamp((vElevation + 0.22) / 0.45, 0.0, 1.0);
      vec3 tempMap = mix(abyss, mix(thermocline, warmSST, tFactor), tFactor);
      finalColor = mix(finalColor, tempMap, 0.70);
    }

    // View Mode 2: Satellite Altimetry Radar Grid & Pulse
    if (uMode > 1.5) {
      // Mesh altimetry grid lines
      vec2 gridCoords = fract(vUv * 36.0);
      float lineX = step(0.94, gridCoords.x);
      float lineY = step(0.94, gridCoords.y);
      float gridIntensity = max(lineX, lineY);

      // Expanding radar beam ring
      float distFromCenter = length(vUv - vec2(0.5));
      float radarSweep = sin(distFromCenter * 24.0 - uTime * 4.5);
      float sweepGlow = smoothstep(0.82, 0.99, radarSweep) * 0.75;

      vec3 radarCyan = vec3(0.12, 0.95, 0.98);
      finalColor = mix(finalColor, radarCyan, gridIntensity * 0.35 + sweepGlow);
    }

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

function createOceanUniforms() {
  return {
    uTime: { value: 0 },
    uWaveSpeed: { value: 0.95 },
    uWaveHeight: { value: 0.25 },
    uMode: { value: 0 },
    uColorWaterDeep: { value: new THREE.Color('#031930') },
    uColorWaterSurface: { value: new THREE.Color('#0284c7') },
    uColorCrest: { value: new THREE.Color('#38bdf8') },
    uColorFoam: { value: new THREE.Color('#e0f2fe') },
    uOpacity: { value: 0.94 },
  };
}

export const OceanSurfaceMesh: React.FC<OceanSurfaceMeshProps> = ({
  seaState,
  viewMode,
  wireframe = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [uniforms] = useState(createOceanUniforms);

  const config = useMemo(() => {
    switch (seaState) {
      case 'calm':
        return { height: 0.14, speed: 0.65 };
      case 'rough':
        return { height: 0.42, speed: 1.4 };
      case 'moderate':
      default:
        return { height: 0.25, speed: 0.95 };
    }
  }, [seaState]);

  const modeValue = useMemo(() => {
    if (viewMode === 'subsurface') return 1.0;
    if (viewMode === 'satellite') return 2.0;
    return 0.0;
  }, [viewMode]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uWaveSpeed.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uWaveSpeed.value,
        config.speed,
        0.05
      );
      materialRef.current.uniforms.uWaveHeight.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uWaveHeight.value,
        config.height,
        0.05
      );
      materialRef.current.uniforms.uMode.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uMode.value,
        modeValue,
        0.1
      );
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value,
        viewMode === 'subsurface' ? 0.82 : 0.94,
        0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      {/* High-density grid for smooth fluid surface */}
      <planeGeometry args={[5.6, 5.6, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
