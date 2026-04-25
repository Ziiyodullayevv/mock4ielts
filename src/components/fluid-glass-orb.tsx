'use client';

import * as THREE from 'three';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';

function GlassSphere({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.35;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    const pulse = active ? 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.05 : 1;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 96, 96]} />
      <MeshTransmissionMaterial
        thickness={1.4}
        roughness={0.04}
        ior={1.35}
        chromaticAberration={0.18}
        anisotropy={0.25}
        distortion={0.35}
        distortionScale={0.4}
        temporalDistortion={0.12}
        color="#f4d1df"
        attenuationColor="#9975f3"
        attenuationDistance={0.6}
        transmission={1}
      />
    </mesh>
  );
}

type FluidGlassOrbProps = {
  active?: boolean;
  size?: number;
};

export function FluidGlassOrb({ active = true, size = 76 }: FluidGlassOrbProps) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background:
          'linear-gradient(135deg, #e2aac2 0%, #cd6a82 32%, #9975f3 68%, #7032ed 100%)',
        boxShadow:
          '0 10px 30px rgba(153,117,243,0.55), 0 4px 14px rgba(153,117,243,0.35)',
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3], fov: 28 }}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[3, 3, 3]} intensity={1.6} />
        <directionalLight position={[-3, -2, 2]} intensity={0.8} color="#cd6a82" />
        <GlassSphere active={active} />
      </Canvas>
    </div>
  );
}
