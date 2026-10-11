import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FinanceSceneProps {
  scrollProgress: number; // 0.0 to 1.0
  isReducedMotion?: boolean;
}

export const FinanceScene: React.FC<FinanceSceneProps> = ({
  scrollProgress,
  isReducedMotion = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(scrollProgress);
  progressRef.current = scrollProgress;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL support safely
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080d12, 0.025);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3, 14);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x080d12, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xd8ffe8, 0.4);
    scene.add(ambientLight);

    const mintPointLight = new THREE.PointLight(0xb6ff5c, 3, 25);
    mintPointLight.position.set(2, 4, 3);
    scene.add(mintPointLight);

    const cyanPointLight = new THREE.PointLight(0x50e3c2, 2.5, 25);
    cyanPointLight.position.set(-3, -2, 2);
    scene.add(cyanPointLight);

    const tensionLight = new THREE.PointLight(0xff777f, 0, 20); // Activates in Stage 3
    tensionLight.position.set(4, 1, 0);
    scene.add(tensionLight);

    // 3. Central Financial Core (Translucent Icosahedron with Wireframe Accent)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x50e3c2,
      emissive: 0x0d2822,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7, // Translucent glassmorphic feel
      thickness: 1.2,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Outer lattice cage
    const wireGeo = new THREE.IcosahedronGeometry(1.9, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xb6ff5c,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // Inner glowing nucleus
    const innerGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xd8ffe8,
      transparent: true,
      opacity: 0.7,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 4. Orbital Rings (Savings, Obligations, Cashflow)
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const createRing = (radius: number, color: number, tiltX: number, tiltY: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.03, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      ringGroup.add(ring);
      return ring;
    };

    const ring1 = createRing(3.2, 0xb6ff5c, Math.PI / 3, 0);
    const ring2 = createRing(4.2, 0x50e3c2, Math.PI / 4, Math.PI / 4);
    const ring3 = createRing(5.2, 0xd8ffe8, -Math.PI / 5, Math.PI / 6);

    // 5. 3D Flowing Financial Path (Catmull-Rom Spline Curve representing 30-day timeline)
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i < 30; i++) {
      const t = i / 29;
      const angle = t * Math.PI * 2.2;
      const radius = 5.5 - t * 1.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(t * Math.PI * 3) * 1.2 - (t - 0.5) * 3;
      const z = Math.sin(angle) * radius - t * 4;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const pathCurve = new THREE.CatmullRomCurve3(curvePoints);
    const pathGeo = new THREE.TubeGeometry(pathCurve, 120, 0.07, 8, false);
    const pathMat = new THREE.MeshBasicMaterial({
      color: 0x50e3c2,
      transparent: true,
      opacity: 0.55,
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    scene.add(pathMesh);

    // 6. Thirty subtle Day Markers along the path
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);
    const markerGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xd8ffe8 });

    for (let i = 0; i < 30; i++) {
      const point = pathCurve.getPoint(i / 29);
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(point);
      markerGroup.add(marker);
    }

    // 7. Small Transaction Particles flowing into/around the path
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const p = pathCurve.getPoint(Math.random());
      particlePositions[i * 3] = p.x + (Math.random() - 0.5) * 1.5;
      particlePositions[i * 3 + 1] = p.y + (Math.random() - 0.5) * 1.5;
      particlePositions[i * 3 + 2] = p.z + (Math.random() - 0.5) * 1.5;
      particleSpeeds[i] = 0.002 + Math.random() * 0.004;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xb6ff5c,
      size: 0.09,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Unexpected Pressure Object (Enters during Stage 3: 50% - 75%)
    const pressureGeo = new THREE.OctahedronGeometry(1.2, 0);
    const pressureMat = new THREE.MeshStandardMaterial({
      color: 0xff777f,
      emissive: 0x4a1215,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: true,
    });
    const pressureMesh = new THREE.Mesh(pressureGeo, pressureMat);
    pressureMesh.position.set(6, 2, 2);
    pressureMesh.scale.set(0.001, 0.001, 0.001); // Hidden initially
    scene.add(pressureMesh);

    // 9. Camera positions and look-at targets for the 4 Stages
    const camTarget = new THREE.Vector3(0, 0, 0);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const progress = isReducedMotion ? 0.2 : progressRef.current;

      // Rotate central core
      coreGroup.rotation.y += 0.4 * delta;
      coreGroup.rotation.x += 0.2 * delta;

      // Orbit rings
      ring1.rotation.z += 0.3 * delta;
      ring2.rotation.z -= 0.25 * delta;
      ring3.rotation.z += 0.2 * delta;

      // Animate particles along curve
      const posAttr = particleGeo.attributes.position;
      if (posAttr) {
        const positions = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1]! += Math.sin(clock.elapsedTime + i) * 0.003;
        }
        posAttr.needsUpdate = true;
      }

      // 4 STAGE CAMERA INTERPOLATION (0.0 to 1.0)
      if (progress < 0.25) {
        // Stage 1: The Beginning (Wide cinematic angle, calm core)
        const t = progress / 0.25;
        camera.position.lerp(new THREE.Vector3(0, 2.5, 13 - t * 2), 0.08);
        camTarget.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        tensionLight.intensity = THREE.MathUtils.lerp(tensionLight.intensity, 0, 0.1);
        pressureMesh.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.1);
      } else if (progress < 0.5) {
        // Stage 2: The Daily Flow (Camera travels along path, day markers pass)
        const t = (progress - 0.25) / 0.25;
        camera.position.lerp(new THREE.Vector3(2.5 * (1 - t) - 1.5 * t, 1.8 + t * 0.5, 11 - t * 4), 0.08);
        camTarget.lerp(new THREE.Vector3(0.5 * t, -0.2 * t, -1 * t), 0.08);
        tensionLight.intensity = THREE.MathUtils.lerp(tensionLight.intensity, 0, 0.1);
        pressureMesh.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.1);
      } else if (progress < 0.75) {
        // Stage 3: The Unexpected Expense (Tension light glows amber-rose, pressure object looms)
        const t = (progress - 0.5) / 0.25;
        camera.position.lerp(new THREE.Vector3(2.2 + Math.sin(t * Math.PI) * 1.5, 2.5 - t * 0.8, 6.5 - t * 2), 0.08);
        camTarget.lerp(new THREE.Vector3(1.5, 0.5, -0.5), 0.08);
        tensionLight.intensity = THREE.MathUtils.lerp(tensionLight.intensity, 4.5 * t, 0.1);

        // Pressure mesh scales up and rotates
        const scale = THREE.MathUtils.lerp(0.01, 1.3, t);
        pressureMesh.scale.set(scale, scale, scale);
        pressureMesh.position.set(2.5, 1.2, 0.5);
        pressureMesh.rotation.y += 1.5 * delta;
        pressureMesh.rotation.x += 1.0 * delta;
      } else {
        // Stage 4: Regaining Control (Core stabilizes, open space, illuminated savings rings)
        const t = (progress - 0.75) / 0.25;
        camera.position.lerp(new THREE.Vector3(0, 1.5, 7.5 + t * 1.5), 0.08);
        camTarget.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        tensionLight.intensity = THREE.MathUtils.lerp(tensionLight.intensity, 0, 0.1);
        pressureMesh.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.1);

        // Enhance mint and cyan rings
        ring1.material.opacity = THREE.MathUtils.lerp(ring1.material.opacity, 0.9, 0.05);
        ring2.material.opacity = THREE.MathUtils.lerp(ring2.material.opacity, 0.9, 0.05);
      }

      camera.lookAt(camTarget);
      renderer.render(scene, camera);
    };

    render();

    // Clean up GPU resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      pathGeo.dispose();
      pathMat.dispose();
      markerGeo.dispose();
      markerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      pressureGeo.dispose();
      pressureMat.dispose();
      renderer.dispose();
    };
  }, [isReducedMotion]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
