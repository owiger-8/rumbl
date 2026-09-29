import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AcousticShockwave({ active, count = 7 }) {
  const ringsRef = useRef([]);
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const distance = Math.max(.1, state.camera.position.z - .2);
    const pixelsToWorld = 2 * distance * Math.tan(THREE.MathUtils.degToRad(18)) / state.size.height;
    groupRef.current.position.x = -.2 + 330 * pixelsToWorld;
    groupRef.current.position.y = -.05 - 30 * pixelsToWorld;
    if (!active) return;
    const time = state.clock.getElapsedTime();

    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      // Emanate outwards along positive X / Z
      const offset = (time * 1.6 + i * 0.28) % 2.0;
      const scale = 0.2 + offset * 3.2;
      const opacity = Math.max(0, 1 - offset / 2.0);

      ring.scale.set(scale, scale, scale);
      if (ring.material) {
        ring.material.opacity = opacity * 0.9;
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={[-0.2, -0.05, 0.2]} rotation={[0, -Math.PI / 4, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (ringsRef.current[i] = el)}
          rotation={[0, Math.PI / 2, 0]}
        >
          <ringGeometry args={[0.08, 0.088, 64]} />
          <meshBasicMaterial
            color="#ff5500"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
