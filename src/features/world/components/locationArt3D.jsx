import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';

export function BuildingHome() {
  return (
    <group>
      {/* Base pad */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.2, 32]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      
      {/* High-rise */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 3, 1.5]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      
      {/* Windows */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[0.76, 0.8 + i * 0.6, 0]} castShadow>
          <boxGeometry args={[0.02, 0.4, 1.2]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function BuildingSchool() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Left wing */}
      <mesh position={[-0.8, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1, 1.2]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      {/* Right wing */}
      <mesh position={[0.8, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1, 1.2]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      {/* Center glass atrium */}
      <mesh position={[0, 0.8, 0.2]} castShadow>
        <boxGeometry args={[1, 1.4, 1.2]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export function BuildingFarm() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.2, 32]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Vertical farm tower */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.8, 1.6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Green glowing rings/layers */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[0, 0.6 + i * 0.6, 0]}>
          <boxGeometry args={[1.62, 0.2, 1.62]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function BuildingMarket() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Shopping Mall wide base */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.2, 1.5]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Billboards */}
      <mesh position={[1.26, 0.8, 0]} castShadow>
        <boxGeometry args={[0.02, 0.6, 0.8]} />
        <meshStandardMaterial color="#ec4899" emissive="#be185d" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-1.26, 0.8, 0]} castShadow>
        <boxGeometry args={[0.02, 0.6, 0.8]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function BuildingMarketing() {
  const antennaRef = useRef();
  useFrame(({ clock }) => {
    if (antennaRef.current) {
      antennaRef.current.emissiveIntensity = Math.sin(clock.elapsedTime * 4) * 0.5 + 0.5;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.6, 0.2, 32]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Sleek Skyscraper */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 1.2, 3.8, 4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.05, 0.6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 4.5, 0]} ref={antennaRef}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial color="#f43f5e" emissive="#e11d48" />
      </mesh>
    </group>
  );
}

export const ART_3D = {
  home: BuildingHome,
  school: BuildingSchool,
  farm: BuildingFarm,
  market: BuildingMarket,
  marketing: BuildingMarketing,
};

export function PlayerAvatar3D({ player }) {
  // Simple bouncing avatar for the player
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.elapsedTime * 8) * 0.1 + 0.8;
    }
  });

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* Shadow blob directly under */}
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
