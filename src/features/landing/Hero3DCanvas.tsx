import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DCanvasProps {
  className?: string;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL capability safely
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
    scene.fog = new THREE.FogExp2(0x080d12, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 9);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x080d12, 0);
    container.appendChild(renderer.domElement);

    // 2. Sophisticated Lighting
    const ambientLight = new THREE.AmbientLight(0xd8ffe8, 0.5);
    scene.add(ambientLight);

    const mintLight = new THREE.PointLight(0xb6ff5c, 3, 20);
    mintLight.position.set(3, 4, 4);
    scene.add(mintLight);

    const cyanLight = new THREE.PointLight(0x50e3c2, 2.5, 20);
    cyanLight.position.set(-3, -2, 3);
    scene.add(cyanLight);

    // 3. Central Financial Core: Luminous faceted crystal with internal nucleus
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Translucent faceted geometry
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x50e3c2,
      emissive: 0x092620,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.75,
      thickness: 1.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Outer geometric wireframe cage
    const cageGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xb6ff5c,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cageMesh);

    // Glowing inner energy orb
    const nucleusGeo = new THREE.SphereGeometry(0.65, 16, 16);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0xd8ffe8,
      transparent: true,
      opacity: 0.8,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleusMesh);

    // 4. Concentric Orbital Rings (Representing Savings, Commitments, Cash)
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const makeRing = (radius: number, color: number, tiltX: number, tiltY: number) => {
      const geo = new THREE.TorusGeometry(radius, 0.025, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = tiltX;
      mesh.rotation.y = tiltY;
      ringGroup.add(mesh);
      return mesh;
    };

    const ring1 = makeRing(2.8, 0xb6ff5c, Math.PI / 3, 0);
    const ring2 = makeRing(3.7, 0x50e3c2, Math.PI / 4, Math.PI / 4);
    const ring3 = makeRing(4.6, 0xd8ffe8, -Math.PI / 5, Math.PI / 6);

    // 5. Flowing Spline Ribbon (Representing 30-day timeline)
    const splinePoints: THREE.Vector3[] = [];
    for (let i = 0; i < 30; i++) {
      const t = i / 29;
      const angle = t * Math.PI * 2.2;
      const r = 5.0 - t * 1.2;
      splinePoints.push(
        new THREE.Vector3(
          Math.cos(angle) * r,
          Math.sin(t * Math.PI * 2.5) * 1.1 - (t - 0.5) * 1.5,
          Math.sin(angle) * r - t * 2.5
        )
      );
    }
    const spline = new THREE.CatmullRomCurve3(splinePoints);
    const tubeGeo = new THREE.TubeGeometry(spline, 100, 0.05, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x50e3c2,
      transparent: true,
      opacity: 0.5,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    // 6. Day Markers along spline
    const markerGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xb6ff5c });
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);

    for (let i = 0; i < 30; i += 3) {
      const pt = spline.getPoint(i / 29);
      const m = new THREE.Mesh(markerGeo, markerMat);
      m.position.copy(pt);
      markerGroup.add(m);
    }

    // 7. Floating Transaction Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const pt = spline.getPoint(Math.random());
      particlePos[i * 3] = pt.x + (Math.random() - 0.5) * 2;
      particlePos[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 2;
      particlePos[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xb6ff5c,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 8. Mouse parallax interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize handler
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
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Continuous rotations
      coreGroup.rotation.y += 0.35 * delta;
      coreGroup.rotation.x += 0.15 * delta;

      ring1.rotation.z += 0.25 * delta;
      ring2.rotation.z -= 0.2 * delta;
      ring3.rotation.z += 0.15 * delta;

      // Mouse parallax smooth lerp
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (1.5 + mouseY * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      markerGeo.dispose();
      markerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
