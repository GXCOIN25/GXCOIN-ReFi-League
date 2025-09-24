import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { OrbitControls, Text, Sphere, Box, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useHeroes } from "@/lib/stores/useHeroes";

function FloatingHero({ hero, position, onClick }: { hero: any, position: [number, number, number], onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial 
          color={hero.color} 
          emissive={hero.color}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {hero.name}
      </Text>
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.2}
        color={hero.color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {hero.symbol}
      </Text>
    </group>
  );
}

function BlackCard3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Box ref={meshRef} args={[2.5, 1.6, 0.1]} position={[0, -3, 0]}>
      <meshStandardMaterial 
        color="#000000"
        metalness={0.9}
        roughness={0.1}
        emissive="#333333"
        emissiveIntensity={0.1}
      />
    </Box>
  );
}

export default function Scene3D() {
  const { heroes, selectHero } = useHeroes();

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00a8ff" />
      
      <Suspense fallback={null}>
        {heroes.map((hero, index) => {
          const angle = (index / heroes.length) * Math.PI * 2;
          const radius = 3;
          const position: [number, number, number] = [
            Math.cos(angle) * radius,
            Math.sin(index * 0.5) * 0.5,
            Math.sin(angle) * radius
          ];
          
          return (
            <FloatingHero
              key={hero.id}
              hero={hero}
              position={position}
              onClick={() => selectHero(hero.id)}
            />
          );
        })}
        
        <BlackCard3D />
      </Suspense>
      
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
