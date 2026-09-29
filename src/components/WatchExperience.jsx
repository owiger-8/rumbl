import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/DigitalWristwatch.glb');

const explodedNames = ['Digital_Wristwatch', 'Plastic_Body_&_Connector', 'Cylinder', 'Cylinder.003', 'diamond_mesh'];

export default function WatchExperience({ scrollProgress, isActivated, isHolding }) {
  const { scene } = useGLTF('/DigitalWristwatch.glb');
  const group = useRef();
  const meshRefs = useRef({});
  const originalPositions = useRef({});
  const lastProgress = useRef(scrollProgress);
  const scrollImpulse = useRef(0);
  const idleDuration = useRef(0);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      // This is the full human-context mesh bundled into the GLB, not a wrist attachment.
      // Keep the watch presentation isolated; the activation art supplies the hand moment.
      if (node.name === 'woman') node.geometry = new THREE.BufferGeometry();
      meshRefs.current[node.name] = node;
      originalPositions.current[node.name] = node.position.clone();
    });
    return clone;
  }, [scene]);

  useFrame((state, frameDelta) => {
    if (!group.current) return;
    const p = scrollProgress;
    const chapterProgress = p * 5;
    const time = state.clock.getElapsedTime();
    const delta = Math.min(frameDelta, .05);
    const progressDelta = p - lastProgress.current;
    lastProgress.current = p;
    if (Math.abs(progressDelta) > .00001) {
      scrollImpulse.current = THREE.MathUtils.clamp(scrollImpulse.current + progressDelta * 12, -0.85, 0.85);
      idleDuration.current = 0;
    } else {
      idleDuration.current += delta;
      scrollImpulse.current *= Math.exp(-delta * 2.6);
    }
    const impulse = scrollImpulse.current;
    const idle = THREE.MathUtils.smoothstep(idleDuration.current, .35, 1.8);
    const scrollPath = Math.sin(p * Math.PI * 8);
    const scrollTurn = Math.sin(p * Math.PI * 4);
    const mobile = state.size.width < 760;
    let x = mobile ? 0 : .2, y = mobile ? .35 : .12, scale = mobile ? 8 : 14, rx = 0.38, ry = -0.55, rz = 0.16;

    if (chapterProgress < 1) { x = mobile ? 0 : -.25; y = mobile ? .35 : .12; scale = mobile ? 8 : 12; }
    else if (chapterProgress < 2) { x = mobile ? 0 : .08; y = .1; scale = 13; ry = -.65; }
    else if (chapterProgress < 3) { x = mobile ? 0 : .12; y = .08; scale = 16; rx = .68; ry = -.18; rz = .04; }
    else if (chapterProgress < 4) { x = mobile ? 0 : -.18; y = .05; scale = 15; rx = .18; ry = 1.25; rz = -.08; }
    else if (chapterProgress < 5) { x = mobile ? 0 : .05; y = .12; scale = mobile ? 8 : 9; ry = -.65; }
    else { x = mobile ? 0 : .15; y = .05; scale = 14; ry = -.55; }

    const shake = isHolding || isActivated ? Math.sin(time * 42) * .012 : 0;
    const lift = mobile ? .04 : .16;
    const follow = 1 - Math.exp(-delta * 5.5);
    const idleBob = Math.sin(time * .72) * .014 * idle;
    const idleYaw = Math.sin(time * .38) * .045 * idle;
    const scrollSway = Math.abs(impulse);
    const targetPosition = new THREE.Vector3(
      x + shake + impulse * .075 + scrollPath * .028 * scrollSway,
      y + lift + idleBob - impulse * .045 + scrollTurn * .022 * scrollSway,
      0,
    );
    group.current.position.lerp(targetPosition, follow);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, rx + impulse * .2 + scrollTurn * .07 * scrollSway + Math.sin(time * .43) * .015 * idle, follow);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, ry + Math.PI + idleYaw + impulse * .28 + scrollPath * .11 * scrollSway, follow);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, rz - impulse * .16 - scrollTurn * .055 * scrollSway, follow);
    const pushedScale = scale * (1 + scrollSway * .055 + Math.sin(p * Math.PI * 8) * .012 * scrollSway);
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x || pushedScale, pushedScale, follow));

    const explode = chapterProgress >= 4 && chapterProgress < 5 ? Math.sin(Math.PI * (chapterProgress - 4)) : 0;
    explodedNames.forEach((name, i) => {
      const mesh = meshRefs.current[name];
      if (!mesh) return;
      if (!originalPositions.current[name]) originalPositions.current[name] = mesh.position.clone();
      const origin = originalPositions.current[name];
      const offset = (i - 2) * .08 * explode;
      mesh.position.set(origin.x + offset * .35, origin.y + offset, origin.z);
    });
  });

  return <group ref={group} dispose={null}>
    <primitive object={model} />
  </group>;
}
