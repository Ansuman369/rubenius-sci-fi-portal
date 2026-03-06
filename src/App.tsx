import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  OrthographicCamera,
  Text, 
  Float, 
  MeshReflectorMaterial, 
  Environment,
  Box,
  Sphere,
  Torus,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, ChevronLeft, ChevronRight, X, Loader2, ExternalLink } from 'lucide-react';

// --- Types ---
type ThemeType = 
  | 'tron-white' 
  | 'tron-black' 
  | 'cube-tunnel-white' 
  | 'cube-tunnel-black' 
  | 'parametric-cave' 
  | 'parametric-walls' 
  | 'neon-grid' 
  | 'gold-fractal' 
  | 'void-organic';

interface ThemeConfig {
  id: ThemeType;
  name: string;
  bgColor: string;
  accentColor: string;
}

const THEMES: ThemeConfig[] = [
  { id: 'tron-white', name: 'Minimal Tron', bgColor: '#ffffff', accentColor: '#00e5ff' },
  { id: 'tron-black', name: 'Dark Tron', bgColor: '#050505', accentColor: '#ff3d00' },
  { id: 'cube-tunnel-white', name: 'White Cubes', bgColor: '#f0f0f0', accentColor: '#cccccc' },
  { id: 'cube-tunnel-black', name: 'Animated Cubes', bgColor: '#0a0a0a', accentColor: '#444444' },
  { id: 'parametric-cave', name: 'Glossy Cave', bgColor: '#ffffff', accentColor: '#e0e0e0' },
  { id: 'parametric-walls', name: 'Parametric Walls', bgColor: '#f5f5f5', accentColor: '#333333' },
  { id: 'neon-grid', name: 'Cyber Grid', bgColor: '#020205', accentColor: '#bc13fe' },
  { id: 'gold-fractal', name: 'Golden Fractal', bgColor: '#1a1a1a', accentColor: '#ffd700' },
  { id: 'void-organic', name: 'Biolume Void', bgColor: '#000010', accentColor: '#00ffcc' },
];

// --- Components ---

const LoadingScreen = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[100]">
    <Loader2 className="text-white w-12 h-12 animate-spin mb-4" />
    <p className="text-white/50 text-xs uppercase tracking-widest">Initializing Neural Link...</p>
  </div>
);

const TronGrid = ({ color, dark = false }: { color: string, dark?: boolean }) => {
  return (
    <group>
      <gridHelper args={[100, 50, color, color]} position={[0, -5, 0]} material-opacity={0.5} material-transparent />
      <gridHelper args={[100, 50, color, color]} position={[0, 5, 0]} rotation={[Math.PI, 0, 0]} material-opacity={0.5} material-transparent />
      <gridHelper args={[100, 50, color, color]} position={[-5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material-opacity={0.5} material-transparent />
      <gridHelper args={[100, 50, color, color]} position={[5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material-opacity={0.5} material-transparent />
    </group>
  );
};

const CubeTunnel = ({ dark = false, animated = false }: { dark?: boolean, animated?: boolean }) => {
  const cubes = useMemo(() => {
    const arr = [];
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        if (x === 0 && y === 0) continue;
        arr.push({ position: [x * 2.5, y * 2.5, -10], offset: Math.random() * 10 });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {cubes.map((c, i) => (
        <AnimatedCube key={i} position={c.position as any} offset={c.offset} dark={dark} animated={animated} />
      ))}
    </group>
  );
};

const AnimatedCube = ({ position, offset, dark, animated }: { position: [number, number, number], offset: number, dark: boolean, animated: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (animated && meshRef.current) {
      meshRef.current.position.z = -10 + Math.sin(state.clock.elapsedTime + offset) * 2;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Box ref={meshRef} position={position} args={[2, 2, 2]}>
      <meshStandardMaterial color={dark ? "#111" : "#eee"} metalness={0.8} roughness={0.2} />
    </Box>
  );
};

const ParametricSlices = ({ cave = false }: { cave?: boolean }) => {
  const slices = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 25; i++) {
      arr.push({ 
        z: -i * 1.2, 
        scale: 1 + Math.sin(i * 0.4) * 0.4,
        rotation: i * 0.15,
        offset: [Math.sin(i * 0.3) * 2, Math.cos(i * 0.3) * 2]
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {slices.map((s, i) => (
        <group key={i} position={[cave ? s.offset[0] : 0, cave ? s.offset[1] : 0, s.z]}>
          {!cave ? (
            <>
              <Box position={[-6, 0, 0]} args={[0.1, 10, 0.5]} rotation={[0, 0, 0]}>
                <meshPhysicalMaterial color="#fff" metalness={0.1} roughness={0} transmission={0.5} thickness={1} />
              </Box>
              <Box position={[6, 0, 0]} args={[0.1, 10, 0.5]} rotation={[0, 0, 0]}>
                <meshPhysicalMaterial color="#fff" metalness={0.1} roughness={0} transmission={0.5} thickness={1} />
              </Box>
            </>
          ) : (
            <Torus args={[6 * s.scale, 0.15, 16, 100]} rotation={[0, 0, s.rotation]}>
              <meshPhysicalMaterial 
                color="#ffffff" 
                transmission={0.7} 
                thickness={2} 
                roughness={0.05} 
                metalness={0.1}
                clearcoat={1}
              />
            </Torus>
          )}
        </group>
      ))}
    </group>
  );
};

const CyberGrid = () => {
  return (
    <group>
      <gridHelper args={[100, 40, '#bc13fe', '#bc13fe']} position={[0, -4.9, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
          mirror={1}
        />
      </mesh>
    </group>
  );
};

const GoldFractal = () => {
  return (
    <group>
      {[...Array(12)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
          <Box position={[Math.sin(i) * 8, Math.cos(i) * 8, -15 + i]} args={[1, 1, 1]}>
            <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
          </Box>
        </Float>
      ))}
    </group>
  );
};

const BiolumeVoid = () => {
  return (
    <group>
      {[...Array(20)].map((_, i) => (
        <Sphere key={i} position={[Math.random() * 20 - 10, Math.random() * 20 - 10, -Math.random() * 20]} args={[0.2, 16, 16]}>
          <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
        </Sphere>
      ))}
    </group>
  );
};

// --- Geometric Avatar Component ---

const GeometricAvatar = ({ theme }: { theme: ThemeType }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, -5]}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        {theme.includes('tron') && (
          <mesh>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial color={THEMES.find(t => t.id === theme)?.accentColor} wireframe />
          </mesh>
        )}
        {theme.includes('cube') && (
          <group>
            <Box args={[1, 1, 1]}>
              <meshStandardMaterial color="#fff" />
            </Box>
            <Box args={[0.5, 0.5, 0.5]} position={[1, 1, 0]}>
              <meshStandardMaterial color="#888" />
            </Box>
            <Box args={[0.5, 0.5, 0.5]} position={[-1, -1, 0]}>
              <meshStandardMaterial color="#888" />
            </Box>
          </group>
        )}
        {theme.includes('parametric') && (
          <mesh>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshPhysicalMaterial 
              color="#fff" 
              transmission={0.9} 
              thickness={1} 
              roughness={0} 
            />
          </mesh>
        )}
        {theme === 'neon-grid' && (
          <Torus args={[1.2, 0.2, 16, 100]}>
            <meshStandardMaterial color="#bc13fe" emissive="#bc13fe" emissiveIntensity={2} />
          </Torus>
        )}
        {theme === 'gold-fractal' && (
          <mesh>
            <icosahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
          </mesh>
        )}
        {theme === 'void-organic' && (
          <Sphere args={[1.2, 32, 32]}>
            <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={1} transparent opacity={0.8} />
          </Sphere>
        )}
      </Float>
      
      {/* Aura/Glow */}
      <Sphere args={[2, 16, 16]}>
        <meshBasicMaterial color={THEMES.find(t => t.id === theme)?.accentColor} transparent opacity={0.05} />
      </Sphere>
    </group>
  );
};

// --- Main Room Component ---

const Room = ({ theme, isZoomed, onEnter }: { theme: ThemeType, isZoomed: boolean, onEnter: () => void }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    const config = THEMES.find(t => t.id === theme);
    if (config) {
      scene.background = new THREE.Color(config.bgColor);
      scene.fog = new THREE.Fog(config.bgColor, 5, 40);
    }
  }, [theme, scene]);

  return (
    <group>
      <ambientLight intensity={0.4} />
      
      {/* CMYK Neon Ambient Lighting */}
      <pointLight position={[-10, 5, -5]} color="#00ffff" intensity={2} distance={20} /> {/* Cyan */}
      <pointLight position={[10, 5, -5]} color="#ff00ff" intensity={2} distance={20} />  {/* Magenta */}
      <pointLight position={[0, -5, -5]} color="#ffff00" intensity={1.5} distance={20} /> {/* Yellow */}
      <pointLight position={[0, 10, 0]} color="#ffffff" intensity={0.5} distance={30} />  {/* White Fill */}

      {/* God Element: Geometric Avatar */}
      <GeometricAvatar theme={theme} />
      
      {/* Theme Content */}
      {theme === 'tron-white' && <TronGrid color="#00e5ff" />}
      {theme === 'tron-black' && <TronGrid color="#ff3d00" dark />}
      {theme === 'cube-tunnel-white' && <CubeTunnel />}
      {theme === 'cube-tunnel-black' && <CubeTunnel dark animated />}
      {theme === 'parametric-cave' && <ParametricSlices cave />}
      {theme === 'parametric-walls' && <ParametricSlices />}
      {theme === 'neon-grid' && <CyberGrid />}
      {theme === 'gold-fractal' && <GoldFractal />}
      {theme === 'void-organic' && <BiolumeVoid />}

      {/* Back Wall with Embedded Website */}
      <group position={[0, 0, -12]}>
        {/* Screen Frame */}
        <mesh receiveShadow>
          <planeGeometry args={[24.5, 14.5]} />
          <meshStandardMaterial color="#000" metalness={1} roughness={0} />
        </mesh>
        
        {/* The Screen Surface (for occlusion and depth) */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[24, 14]} />
          <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.2} transparent opacity={0.5} />
        </mesh>

        {/* Embedded Website - Only visible and interactive when zoomed */}
        {isZoomed && (
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Html
              transform
              distanceFactor={10}
              position={[0, 0, 0.05]}
              style={{
                width: '1200px',
                height: '700px',
                background: 'black',
                overflow: 'hidden',
                borderRadius: '12px',
                border: '2px solid rgba(0,229,255,0.3)',
                boxShadow: '0 0 50px rgba(0,229,255,0.2)',
                pointerEvents: 'auto'
              }}
            >
              <iframe 
                src="https://www.rubenius.in" 
                title="Rubenius Website"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  opacity: 1
                }}
              />
            </Html>
          </Float>
        )}

        {/* Portal Placeholder when not zoomed */}
        {!isZoomed && (
          <group position={[0, 0, 0.05]}>
            <mesh onClick={onEnter} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
              <planeGeometry args={[24, 14]} />
              <meshStandardMaterial 
                color="#001122" 
                emissive="#00e5ff" 
                emissiveIntensity={0.2} 
                metalness={1} 
                roughness={0.1} 
              />
            </mesh>
            <Float speed={3} rotationIntensity={0.1} floatIntensity={0.2}>
              <group position={[0, 0, 0.2]}>
                <Text
                  position={[0, 2, 0]}
                  fontSize={1.2}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.05}
                  outlineColor="#000000"
                >
                  RUBENIUS
                </Text>
                <Html
                  transform
                  position={[0, -1, 0]}
                  style={{
                    pointerEvents: 'auto'
                  }}
                >
                  <button 
                    onClick={onEnter}
                    className="flex items-center gap-2 text-cyan-400 text-xl font-medium tracking-widest hover:text-white transition-all group whitespace-nowrap bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-cyan-400/30"
                  >
                    <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
                    ENTER PORTAL
                  </button>
                </Html>
                <Text
                  position={[0, -3, 0]}
                  fontSize={0.6}
                  color="#00e5ff"
                  opacity={0.6}
                  transparent
                >
                  NEURAL LINK ACTIVE
                </Text>
              </group>
            </Float>
          </group>
        )}
      </group>

      {/* Floor with reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={60}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0a"
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};

// --- App Component ---

export default function App() {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const currentTheme = THEMES[currentThemeIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextTheme = () => setCurrentThemeIndex((prev) => (prev + 1) % THEMES.length);
  const prevTheme = () => setCurrentThemeIndex((prev) => (prev - 1 + THEMES.length) % THEMES.length);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans">
      {/* 3D Canvas */}
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        className="absolute inset-0 z-0"
        camera={{ position: [0, 0, 15], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
        }}
      >
        {isZoomed ? (
          <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={45} far={1000} near={-1000} />
        ) : (
          <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        )}

        {!isZoomed && <OrbitControls enablePan={false} maxDistance={25} minDistance={5} autoRotate autoRotateSpeed={0.125} />}
        
        <Room 
          theme={currentTheme.id} 
          isZoomed={isZoomed} 
          onEnter={() => setIsZoomed(true)} 
        />
      </Canvas>

        {/* UI Overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-10 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
          {/* Header */}
          <div className="absolute top-8 left-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <Monitor className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tighter uppercase">Rubenius Portal</h1>
              <p className="text-white/50 text-xs uppercase tracking-widest">Experimental WebGL Environment</p>
            </div>
          </div>

          {/* Theme Controls */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 pointer-events-auto">
            <button 
              onClick={prevTheme}
              className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
              <ChevronLeft className="text-white/50 group-hover:text-white transition-colors" />
            </button>
            
            <div className="flex flex-col items-center min-w-[200px]">
              <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-1">Current Theme</span>
              <h2 className="text-white text-lg font-medium tracking-tight">{currentTheme.name}</h2>
              <div className="flex gap-1 mt-3">
                {THEMES.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${i === currentThemeIndex ? 'w-6 bg-white' : 'w-2 bg-white/20'}`} 
                  />
                ))}
              </div>
            </div>

            <button 
              onClick={nextTheme}
              className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
              <ChevronRight className="text-white/50 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Instructions */}
          <div className="absolute top-8 right-8 text-right">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Navigation</p>
            <p className="text-white/80 text-xs">Orbit: Left Click</p>
            <p className="text-white/80 text-xs">Zoom: Scroll</p>
          </div>
        </div>

        {/* Zoomed Overlay */}
        <AnimatePresence>
          {isZoomed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="absolute top-8 right-8 pointer-events-auto">
                <button 
                  onClick={() => setIsZoomed(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-xs uppercase tracking-widest transition-all"
                >
                  <X size={16} />
                  Exit View (ESC)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Vignette & Effects */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
      
      {/* Debug UI Marker */}
      <div className="absolute top-2 left-2 text-[8px] text-white/20 uppercase pointer-events-none">
        System Active: {currentTheme.id}
      </div>
    </div>
  );
}
