import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FinanceSceneProps {
  scrollProgress: number; // 0.0 (Stage 1) to 1.0 (Stage 4)
  isReducedMotion?: boolean;
}

/**
 * Dynamically generates a high-resolution metallic Rupee coin face texture
 */
function createRupeeCoinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Cyber-metallic radial background
    const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 256);
    grad.addColorStop(0, '#D8FFE8');
    grad.addColorStop(0.3, '#B6FF5C');
    grad.addColorStop(0.7, '#50E3C2');
    grad.addColorStop(0.95, '#0F2C24');
    grad.addColorStop(1, '#080D12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // 30 micro notches around rim (representing 30-day budget horizon)
    ctx.strokeStyle = '#D8FFE8';
    ctx.lineWidth = 5;
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const x1 = 256 + Math.cos(angle) * 228;
      const y1 = 256 + Math.sin(angle) * 228;
      const x2 = 256 + Math.cos(angle) * 248;
      const y2 = 256 + Math.sin(angle) * 248;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Concentric protective groove ring
    ctx.strokeStyle = 'rgba(216, 255, 232, 0.65)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(256, 256, 215, 0, Math.PI * 2);
    ctx.stroke();

    // Draw rotating content (Rupee symbol & inscription) upright
    ctx.save();
    ctx.translate(256, 256);
    // Rotate -90deg so Rupee symbol is standing upright at top
    ctx.rotate(-Math.PI / 2);

    // Central Indian Rupee symbol ₹
    ctx.fillStyle = '#080D12';
    ctx.font = '900 220px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(182, 255, 92, 0.9)';
    ctx.shadowBlur = 18;
    ctx.fillText('₹', 0, -8);

    // Micro inscription along lower arc
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#080D12';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText('TENFLOW • 10K / 30 DAYS', 0, 140);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const FinanceScene: React.FC<FinanceSceneProps> = ({
  scrollProgress,
  isReducedMotion = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(scrollProgress);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

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

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080d12, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 12);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x080d12, 0);
    container.appendChild(renderer.domElement);

    // 2. High-Fidelity Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xd8ffe8, 0.65);
    scene.add(ambientLight);

    const mintKeyLight = new THREE.DirectionalLight(0xb6ff5c, 2.5);
    mintKeyLight.position.set(4, 5, 5);
    scene.add(mintKeyLight);

    const cyanFillLight = new THREE.PointLight(0x50e3c2, 2.5, 30);
    cyanFillLight.position.set(-4, -2, 4);
    scene.add(cyanFillLight);

    const tensionLight = new THREE.PointLight(0xff777f, 0, 25); // Activates in Stage 3
    tensionLight.position.set(3, 2, 2);
    scene.add(tensionLight);

    // 3. Central Financial Core: High-Detail 3D Rupee Coin
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);

    const coinTexture = createRupeeCoinTexture();

    // Multi-material cylinder: side rim is metallic ribbed; top and bottom faces display engraved Rupee texture
    const coinGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.26, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x50e3c2,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0x092620,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      map: coinTexture,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0d2822,
    });
    const coinMesh = new THREE.Mesh(coinGeo, [rimMat, faceMat, faceMat]);
    coinMesh.rotation.x = Math.PI / 2; // Face forward
    coinGroup.add(coinMesh);

    // Beveled outer torus rims (front and back)
    const rimBevelGeo = new THREE.TorusGeometry(1.45, 0.05, 16, 64);
    const rimBevelMat = new THREE.MeshStandardMaterial({
      color: 0xb6ff5c,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x1a3d24,
    });
    const frontRim = new THREE.Mesh(rimBevelGeo, rimBevelMat);
    frontRim.position.z = 0.13;
    coinGroup.add(frontRim);

    const backRim = new THREE.Mesh(rimBevelGeo, rimBevelMat);
    backRim.position.z = -0.13;
    coinGroup.add(backRim);

    // Glowing halo ring around the coin perimeter
    const haloGeo = new THREE.RingGeometry(1.55, 1.68, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xb6ff5c,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    coinGroup.add(haloMesh);

    // 4. Concentric Orbital Rings (Savings, Fixed Commitments, Daily Flow)
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const createRing = (radius: number, color: number, tiltX: number, tiltY: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.02, 16, 120);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      ringGroup.add(ring);
      return ring;
    };

    const ring1 = createRing(2.1, 0xb6ff5c, Math.PI / 3, 0);
    const ring2 = createRing(2.9, 0x50e3c2, Math.PI / 4, Math.PI / 4);
    const ring3 = createRing(3.65, 0xd8ffe8, -Math.PI / 5, Math.PI / 6);

    // 5. 30 Orbital Day Markers on the primary ring
    const dayMarkerGroup = new THREE.Group();
    ringGroup.add(dayMarkerGroup);
    const dayMarkerGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const dayMarkerMat = new THREE.MeshBasicMaterial({ color: 0xb6ff5c });

    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const marker = new THREE.Mesh(dayMarkerGeo, dayMarkerMat);
      marker.position.set(Math.cos(angle) * 2.9, Math.sin(angle) * 2.9, 0);
      dayMarkerGroup.add(marker);
    }
    dayMarkerGroup.rotation.x = Math.PI / 4;
    dayMarkerGroup.rotation.y = Math.PI / 4;

    // 6. Stage 3 Shock Element: Fractured Tension Octahedron
    const shockGroup = new THREE.Group();
    scene.add(shockGroup);

    const shockGeo = new THREE.OctahedronGeometry(0.9, 0);
    const shockMat = new THREE.MeshStandardMaterial({
      color: 0xff777f,
      emissive: 0x440810,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    shockGroup.add(shockMesh);

    const shockWireMat = new THREE.MeshBasicMaterial({
      color: 0xffcb70,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const shockWire = new THREE.Mesh(shockGeo, shockWireMat);
    shockWire.scale.setScalar(1.15);
    shockGroup.add(shockWire);

    shockGroup.position.set(2.6, 0.9, 1);
    shockGroup.scale.set(0.001, 0.001, 0.001);

    // 7. Ambient Particle Field (Floating micro cashflow telemetry)
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particleCoords[i] = (Math.random() - 0.5) * 12;
      particleCoords[i + 1] = (Math.random() - 0.5) * 8;
      particleCoords[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particleCoords, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x50e3c2,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

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
      if (document.hidden) return; // Save GPU cycles when tab is hidden
      const delta = clock.getDelta();
      const progress = isReducedMotion ? 0.2 : progressRef.current;

      // Base rotations
      coinGroup.rotation.y += 0.45 * delta;
      ring1.rotation.z += 0.25 * delta;
      ring2.rotation.z -= 0.2 * delta;
      ring3.rotation.z += 0.15 * delta;
      dayMarkerGroup.rotation.z -= 0.2 * delta;
      particleSystem.rotation.y += 0.05 * delta;

      // Dynamic Camera & State Transitions across 4 Stages (0.0 to 1.0)
      if (progress < 0.25) {
        // STAGE 1: The Launch (Calm, majestic hero view, ₹10,000 full tank)
        const t = progress / 0.25;
        camera.position.lerp(new THREE.Vector3(0, 0.5, 11.8 - t * 0.4), 0.08);
        camTarget.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        coinGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        tensionLight.intensity = THREE.MathUtils.lerp(tensionLight.intensity, 0, 0.1);
        shockGroup.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.1);
      } else if (progress < 0.5) {
        // STAGE 2: Daily Flow (Traveling camera, side angle, steady telemetry)
        const t = (progress - 0.25) / 0.25;
        camera.position.lerp(new THREE.Vector3(1.0 * (1 - t) - 0.5 * t, 0.6 + t * 0.2, 11.4 - t * 0.4), 0.08);
        camTarget.lerp(new THREE.Vector3(0.15 * t, 0, 0), 0.08);
        coinGroup.position.lerp(new THREE.Vector3(-0.2 * t, 0.1 * t, 0), 0.08);
        tensionLight.intensity = THREE.MathUtils.lerp(tensionLight.intensity, 0, 0.1);
        shockGroup.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.1);
      } else if (progress < 0.75) {
        // STAGE 3: The Shock (-₹1,500 surprise, tension lights flare, hazard object looms)
        const t = (progress - 0.5) / 0.25;
        camera.position.lerp(new THREE.Vector3(0.8 + Math.sin(t * Math.PI) * 0.4, 0.7, 10.8 - t * 0.3), 0.08);
        camTarget.lerp(new THREE.Vector3(0.4, 0.15, 0), 0.08);

        // Coin tilts and reacts to financial shock
        coinGroup.rotation.x = Math.sin(clock.elapsedTime * 4) * 0.15;
        tensionLight.intensity = THREE.MathUtils.lerp(tensionLight.intensity, 3.5, 0.1);
        shockGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        shockGroup.rotation.y += 1.2 * delta;
        shockGroup.rotation.x += 0.8 * delta;
      } else {
        // STAGE 4: Regain Control (Balanced glidepath, stabilized core, calm focus)
        const t = (progress - 0.75) / 0.25;
        camera.position.lerp(new THREE.Vector3(0, 0.5, 11.0 + t * 0.6), 0.08);
        camTarget.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        coinGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.08);
        coinGroup.rotation.x = 0;
        tensionLight.intensity = THREE.MathUtils.lerp(tensionLight.intensity, 0.4, 0.08);
        shockGroup.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.1);
      }

      camera.lookAt(camTarget);
      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coinTexture.dispose();
      coinGeo.dispose();
      rimMat.dispose();
      faceMat.dispose();
      rimBevelGeo.dispose();
      rimBevelMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      dayMarkerGeo.dispose();
      dayMarkerMat.dispose();
      shockGeo.dispose();
      shockMat.dispose();
      shockWireMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [isReducedMotion]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing"
      aria-label="3D Interactive Rupee Coin Telemetry Scene"
      role="img"
    />
  );
};
