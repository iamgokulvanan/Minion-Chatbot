import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MascotState } from '../../types';

interface MinionCore3DProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const MinionCore3D: React.FC<MinionCore3DProps> = ({
  state = 'idle',
  size = 'md',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Map size to pixel dimensions
  const dims = {
    sm: { w: 100, h: 100 },
    md: { w: 220, h: 220 },
    lg: { w: 280, h: 280 },
  }[size];

  useEffect(() => {
    const container = mountRef.current;
    if (!container || useFallback) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let animId: number;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, dims.w / dims.h, 0.1, 100);
      camera.position.z = 4.8;

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(dims.w, dims.h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // --- LIGHTING ---
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const yellowPoint = new THREE.PointLight(0xffd600, 2.5, 10);
      yellowPoint.position.set(2, 3, 3);
      scene.add(yellowPoint);

      const cyanPoint = new THREE.PointLight(0x00d8ff, 1.8, 10);
      cyanPoint.position.set(-3, -2, 2);
      scene.add(cyanPoint);

      // --- CORE ROBOT HEAD GROUP ---
      const minionGroup = new THREE.Group();
      scene.add(minionGroup);

      // 1. Central Core Sphere (Futuristic Metallic Yellow with Gloss)
      const coreGeo = new THREE.SphereGeometry(1.2, 48, 48);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x111318,
        emissive: 0x221c00,
        metalness: 0.85,
        roughness: 0.18,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      minionGroup.add(coreMesh);

      // 2. Front Face Visor (Glossy Deep Black Screen)
      const visorGeo = new THREE.SphereGeometry(1.21, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.45);
      visorGeo.rotateX(Math.PI / 2);
      const visorMat = new THREE.MeshPhysicalMaterial({
        color: 0x050608,
        metalness: 0.95,
        roughness: 0.05,
        clearcoat: 1.0,
      });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 0, 0.05);
      minionGroup.add(visorMesh);

      // 3. Digital Eyes (Left & Right Glowing Electric Yellow / Cyan)
      const eyeGeo = new THREE.CapsuleGeometry(0.18, 0.16, 8, 16);
      eyeGeo.rotateZ(Math.PI / 2);
      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0xffd600,
        emissive: 0xffd600,
        emissiveIntensity: 3.5,
        roughness: 0.1,
      });

      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.38, 0.15, 1.15);
      minionGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat.clone());
      rightEye.position.set(0.38, 0.15, 1.15);
      minionGroup.add(rightEye);

      // 4. Outer Holographic Gyroscope Ring 1 (Yellow)
      const ring1Geo = new THREE.TorusGeometry(1.65, 0.025, 16, 80);
      const ring1Mat = new THREE.MeshStandardMaterial({
        color: 0xffd600,
        emissive: 0xffd600,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.75,
      });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 3;
      minionGroup.add(ring1);

      // 5. Outer Holographic Gyroscope Ring 2 (Cyan/Blue)
      const ring2Geo = new THREE.TorusGeometry(1.85, 0.02, 16, 80);
      const ring2Mat = new THREE.MeshStandardMaterial({
        color: 0x00d8ff,
        emissive: 0x00d8ff,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.55,
      });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.y = Math.PI / 4;
      minionGroup.add(ring2);

      // 6. Floating Energy Particles Aura
      const particleCount = 45;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 1.6 + Math.random() * 0.9;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i + 2] = radius * Math.cos(phi);
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffd600,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      minionGroup.add(particles);

      // --- MOUSE TRACKING ---
      let mouseX = 0;
      let mouseY = 0;
      const onMouseMove = (e: MouseEvent) => {
        if (!interactive) return;
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };

      window.addEventListener('mousemove', onMouseMove);

      // --- ANIMATION LOOP ---
      let clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // 1. Gentle levitation float
        minionGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.12;

        // 2. Smooth head look-at with mouse
        minionGroup.rotation.y += (mouseX * 0.45 - minionGroup.rotation.y) * 0.05;
        minionGroup.rotation.x += (-mouseY * 0.35 - minionGroup.rotation.x) * 0.05;

        // 3. Gyroscopic Ring Rotations
        ring1.rotation.z += 0.015;
        ring2.rotation.x += 0.012;
        ring2.rotation.y += 0.008;

        // 4. Particle Field Swirl
        particles.rotation.y = elapsedTime * 0.15;

        // 5. State-specific reactive dynamics
        if (state === 'idle') {
          eyeMat.color.setHex(0xffd600);
          eyeMat.emissive.setHex(0xffd600);
          eyeMat.emissiveIntensity = 2.5 + Math.sin(elapsedTime * 3) * 0.8;
          leftEye.scale.set(1, 1, 1);
          rightEye.scale.set(1, 1, 1);
        } else if (state === 'listening') {
          // Eyes widen and pulse cyan-yellow
          eyeMat.color.setHex(0x00e5ff);
          eyeMat.emissive.setHex(0x00e5ff);
          eyeMat.emissiveIntensity = 3.8 + Math.sin(elapsedTime * 8) * 1.5;
          leftEye.scale.set(1.2, 1.25 + Math.sin(elapsedTime * 10) * 0.15, 1);
          rightEye.scale.set(1.2, 1.25 + Math.sin(elapsedTime * 10) * 0.15, 1);
          ring1.rotation.z += 0.035;
        } else if (state === 'thinking') {
          // Rapid orbit and energetic eye shimmer
          eyeMat.color.setHex(0xffb700);
          eyeMat.emissive.setHex(0xffb700);
          eyeMat.emissiveIntensity = 4.0;
          ring1.rotation.z += 0.08;
          ring2.rotation.x += 0.07;
          leftEye.scale.set(0.9, 0.4 + Math.abs(Math.sin(elapsedTime * 8)) * 0.5, 1);
          rightEye.scale.set(0.9, 0.4 + Math.abs(Math.sin(elapsedTime * 8)) * 0.5, 1);
        } else if (state === 'responding') {
          // Radiant energy pulse
          const pulse = 1.0 + Math.sin(elapsedTime * 12) * 0.25;
          coreMat.emissiveIntensity = 0.4 + Math.sin(elapsedTime * 6) * 0.3;
          eyeMat.emissiveIntensity = 4.5;
          leftEye.scale.set(pulse, pulse, 1);
          rightEye.scale.set(pulse, pulse, 1);
          ring1.rotation.z += 0.05;
        } else if (state === 'success') {
          // Cheerful happy curved eyes
          eyeMat.color.setHex(0x00ff88);
          eyeMat.emissive.setHex(0x00ff88);
          leftEye.scale.set(1.2, 0.5, 1);
          rightEye.scale.set(1.2, 0.5, 1);
        } else if (state === 'error') {
          // Warning amber-red tone
          eyeMat.color.setHex(0xff3344);
          eyeMat.emissive.setHex(0xff3344);
          eyeMat.emissiveIntensity = 3.5 + Math.sin(elapsedTime * 14) * 2;
        }

        // Periodic natural blink
        if (Math.sin(elapsedTime * 0.8) > 0.985 && state === 'idle') {
          leftEye.scale.y = 0.1;
          rightEye.scale.y = 0.1;
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', onMouseMove);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to 2D mascot:', err);
      setUseFallback(true);
    }
  }, [dims.w, dims.h, state, interactive, useFallback]);

  if (useFallback) {
    return (
      <div
        className="relative flex items-center justify-center rounded-full bg-[#111318] border border-[#FFD600]/30 shadow-[0_0_30px_rgba(255,214,0,0.25)] animate-pulse"
        style={{ width: dims.w, height: dims.h }}
      >
        <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-tr from-[#171A20] to-[#252830] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#FFD600]/10 rounded-full animate-ping opacity-30" />
          <div className="flex gap-4">
            <div className="w-4 h-6 bg-[#FFD600] rounded-full shadow-[0_0_12px_#FFD600]" />
            <div className="w-4 h-6 bg-[#FFD600] rounded-full shadow-[0_0_12px_#FFD600]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105"
      style={{ width: dims.w, height: dims.h }}
      title={`MINION CORE (${state})`}
    />
  );
};
