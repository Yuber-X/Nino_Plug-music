import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

import { cargarFuente, geometriaDeTexto } from './geometriaTexto';

const FUENTE = '/fuentes/Anton-Regular.ttf';

/**
 * El nombre del artista en metal, en 3D real.
 *
 * Entra girando sobre su eje y después queda siguiendo al mouse, igual que en
 * ascension.pegassi.be (la referencia del cliente) — pero acá las letras tienen
 * espesor de verdad: el brillo que se mueve por el canto es un reflejo, no un
 * degradado pintado.
 */

interface Props {
  texto: string;
  /** Arranca el giro de entrada cuando el visitante pasa la puerta. */
  entro: boolean;
}

function Letras({ texto, entro }: Props) {
  const malla = useRef<THREE.Mesh>(null);
  const [fuente, setFuente] = useState<import('opentype.js').Font | null>(null);
  const { viewport } = useThree();

  useEffect(() => {
    let vivo = true;
    cargarFuente(FUENTE)
      .then((f) => vivo && setFuente(f))
      .catch((e) => console.warn('Tipografía 3D:', e));
    return () => {
      vivo = false;
    };
  }, []);

  const geometria = useMemo(
    () => (fuente ? geometriaDeTexto(fuente, texto, { tamano: 1, espesor: 0.16 }) : null),
    [fuente, texto],
  );

  // Se libera al cambiar de texto o al desmontar: una geometría extruida con
  // biseles son miles de triángulos y la GPU no los suelta sola.
  useEffect(() => () => geometria?.dispose(), [geometria]);

  const destino = useRef({ x: 0, y: 0 });
  const giro = useRef(0);

  useFrame((estado, delta) => {
    const m = malla.current;
    if (!m) return;

    // Entrada: una vuelta completa, frenando al final.
    if (entro && giro.current < 1) {
      giro.current = Math.min(1, giro.current + delta / 1.9);
      const t = 1 - Math.pow(1 - giro.current, 3);
      m.rotation.y = t * Math.PI * 2;
      m.scale.setScalar(0.55 + t * 0.45);
      m.position.y = 0;
      return;
    }

    // Después: sigue al puntero con retardo. El lerp es lo que evita que el
    // título se sacuda con cada movimiento chico del mouse.
    const p = estado.pointer;
    destino.current.x = -p.y * 0.22;
    destino.current.y = p.x * 0.38;
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, destino.current.x, 1 - Math.pow(0.001, delta));
    m.rotation.y = THREE.MathUtils.lerp(
      m.rotation.y % (Math.PI * 2),
      destino.current.y,
      1 - Math.pow(0.001, delta),
    );
    m.scale.setScalar(1);
  });

  if (!geometria) return null;

  // El título ocupa el ancho del cuadro con un margen; así entra igual en un
  // monitor ancho que en un teléfono, sin tamaños tipeados a mano.
  const ancho = geometria.boundingBox
    ? geometria.boundingBox.max.x - geometria.boundingBox.min.x
    : 1;
  const escala = Math.min((viewport.width * 0.86) / ancho, viewport.height * 0.5);

  return (
    <group scale={escala}>
      <mesh ref={malla} geometry={geometria} castShadow>
        <meshPhysicalMaterial
          color="#eceaea"
          metalness={1}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  );
}

export function TituloCromado({ texto, entro }: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Sin HDRI descargado de un CDN: el ambiente se arma con luces planas
          propias. Es menos "realista" y es mejor acá — el reflejo queda
          controlado (vino del sistema + blanco duro) y el sitio no depende de
          que un servidor ajeno esté vivo. */}
      <Environment resolution={256}>
        {/* Cromo: la mayor parte del reflejo es BLANCO. El vino entra solo por
            los costados, como luz de sala — con el vino de frente las letras
            dejan de ser metal y se ven pintadas de rojo. */}
        <Lightformer intensity={9} position={[0, 3, 2]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={5} position={[0, -3, 2]} scale={[12, 3, 1]} color="#cfcfcf" />
        <Lightformer intensity={3} position={[-4, 0, 2]} scale={[2, 6, 1]} color="#c23a52" />
        <Lightformer intensity={2} position={[4, 0, 2]} scale={[2, 6, 1]} color="#86192c" />
        {/* La "softbox" de adelante: es la que ven las caras planas de las
            letras. Sin ella el frente refleja el fondo negro y el título se
            lee como una silueta apagada en vez de cromo. */}
        <Lightformer intensity={4} position={[0, 0, 5]} scale={[14, 8, 1]} color="#f4efe8" />
        <Lightformer intensity={1} position={[0, 0, -4]} scale={[10, 6, 1]} color="#1c1917" />
      </Environment>

      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 4]} intensity={1.1} />

      <Letras texto={texto} entro={entro} />
    </Canvas>
  );
}
