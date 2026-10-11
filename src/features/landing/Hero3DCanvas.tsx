import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DCanvasProps {
  className?: string;
}

/**
 * Generates an engraved metallic Rupee coin texture for the hero canvas
 */
function createHeroRupeeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 256);
    grad.addColorStop(0, '#D8FFE8');
    grad.addColorStop(0.35, '#B6FF5C');
    grad.addColorStop(0.75, '#50E3C2');
    grad.addColorStop(0.95, '#0F2C24');
    grad.addColorStop(1, '#080D12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // 30 day notches
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

    // Groove
    ctx.strokeStyle = 'rgba(216, 255, 232, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, 214, 0, Math.PI * 2);
    ctx.stroke();

    // Draw rotating content (Rupee symbol & inscription) upright
    ctx.save();
    ctx.translate(256, 256);
    // Rotate -90deg so Rupee symbol is standing upright at top
    ctx.rotate(-Math.PI / 2);

    // Rupee symbol ₹
    ctx.fillStyle = '#080D12';
    ctx.font = '900 230px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(182, 255, 92, 0.9)';
    ctx.shadowBlur = 18;
    ctx.fillText('₹', 0, -6);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#080D12';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText('TENFLOW • ₹10,000 CAP', 0, 140);
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080d12, 0.02);

    // Camera distanced to fit all orbital rings with ample top/bottom margin
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 11.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x080d12, 0);
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xd8ffe8, 0.65);
    scene.add(ambientLight);

    const mintLight = new THREE.DirectionalLight(0xb6ff5c, 3);
    mintLight.position.set(3, 4, 4);
    scene.add(mintLight);

    const cyanLight = new THREE.PointLight(0x50e3c2, 2.5, 25);
    cyanLight.position.set(-3, -2, 3);
    scene.add(cyanLight);

    // 3D Rupee Coin Core
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);

    const coinTexture = createHeroRupeeTexture();
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
    coinMesh.rotation.x = Math.PI / 2;
    coinGroup.add(coinMesh);

    // Beveled Torus Rims
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

    // Outer Halo
    const haloGeo = new THREE.RingGeometry(1.55, 1.68, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xb6ff5c,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    coinGroup.add(haloMesh);

    // Orbital Rings - scaled proportionally to fit entirely within viewport
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const makeRing = (radius: number, color: number, tiltX: number, tiltY: number) => {
      const geo = new THREE.TorusGeometry(radius, 0.02, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = tiltX;
      mesh.rotation.y = tiltY;
      ringGroup.add(mesh);
      return mesh;
    };

    const ring1 = makeRing(2.1, 0xb6ff5c, Math.PI / 3, 0);
    const ring2 = makeRing(2.9, 0x50e3c2, Math.PI / 4, Math.PI / 4);
    const ring3 = makeRing(3.65, 0xd8ffe8, -Math.PI / 5, Math.PI / 6);

    // 30 Glowing Day Markers
    const markerGroup = new THREE.Group();
    ringGroup.add(markerGroup);
    const markerGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xb6ff5c });

    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(Math.cos(angle) * 2.9, Math.sin(angle) * 2.9, 0);
      markerGroup.add(marker);
    }
    markerGroup.rotation.x = Math.PI / 4;
    markerGroup.rotation.y = Math.PI / 4;

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window Resize
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
      if (document.hidden) return; // Battery & GPU throttling
      const delta = clock.getDelta();

      coinGroup.rotation.y += 0.45 * delta;
      ring1.rotation.z += 0.25 * delta;
      ring2.rotation.z -= 0.2 * delta;
      ring3.rotation.z += 0.15 * delta;
      markerGroup.rotation.z -= 0.2 * delta;

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.04;
      camera.position.y += (0.2 + mouseY * 0.3 - camera.position.y) * 0.04;
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
      coinTexture.dispose();
      coinGeo.dispose();
      rimMat.dispose();
      faceMat.dispose();
      rimBevelGeo.dispose();
      rimBevelMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      markerGeo.dispose();
      markerMat.dispose();
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
