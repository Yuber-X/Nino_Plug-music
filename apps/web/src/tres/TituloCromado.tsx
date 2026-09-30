import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

import { cargarFuente, geometriaDeTexto } from './geometriaTexto';

/**
 * Tipografías candidatas para el título.
 *
 * Todas las de esta lista son OFL (SIL Open Font License): se pueden usar en
 * un sitio comercial sin pagar nada. La única que NO lo es sigue siendo
 * Darkhusk —uso personal, multa de US$999 si se publica— y está acá solo para
 * comparar mientras el cliente elige (2026-09-30).
 *
 * Se cambia con ?fuente=nombre, para poder mirarlas una al lado de la otra.
 */
const FUENTES: Record<string, string> = {
  metalmania: '/fuentes/MetalMania-Regular.ttf',
  nosifer: '/fuentes/Nosifer-Regular.ttf',
  eater: '/fuentes/Eater-Regular.ttf',
  pirata: '/fuentes/PirataOne-Regular.ttf',
  // Darkhusk NO viaja en el repositorio: es de uso personal y subirla a un
  // repositorio público sería redistribuirla. Para compararla, copiar el .otf
  // desde "Claude Active\Web\...\Fuentes" a apps/web/public/fuentes/ y
  // abrir ?fuente=darkhusk.
  darkhusk: '/fuentes/Darkhusk.otf',
};

/**
 * La que usa el sitio hoy: Eater es la más parecida a Darkhusk de las libres
 * —letras con púas, del palo death metal— y no cuesta nada publicarla.
 */
const FUENTE_POR_DEFECTO = 'eater';

function fuenteElegida(): string {
  if (typeof window === 'undefined') return FUENTES[FUENTE_POR_DEFECTO];
  const pedida = new URLSearchParams(window.location.search).get('fuente');
  return FUENTES[pedida ?? ''] ?? FUENTES[FUENTE_POR_DEFECTO];
}

const FUENTE = fuenteElegida();

/**
 * El nombre del artista en metal plateado, arqueado, en 3D real.
 *
 * Entra girando y después sigue al puntero — pero CONTENIDO: el cliente
 * reportó el 2026-09-29 que el título se salía del marco y se veía recortado.
 * El giro ahora está limitado y el texto se encoge un poco al inclinarse, así
 * que nunca pasa del ancho del cuadro.
 */

interface Props {
  texto: string;
  /** Arranca el giro de entrada cuando el visitante pasa la puerta. */
  entro: boolean;
}

/** Tope de inclinación. Más que esto y las letras de la punta salen de cuadro. */
const GIRO_MAX_Y = 0.16;   // ~9°
const GIRO_MAX_X = 0.09;   // ~5°

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
    () =>
      fuente
        ? geometriaDeTexto(fuente, texto, { tamano: 1, espesor: 0.14, arco: 0.62 })
        : null,
    [fuente, texto],
  );

  // Se libera la geometría ANTERIOR cuando aparece una nueva, y nunca al
  // desmontar. Liberarla en el cleanup parecía lo correcto y rompía la
  // portada: en StrictMode React monta, desmonta y vuelve a montar, el cleanup
  // destruía la geometría y al remontar useMemo devolvía esa misma —ya
  // liberada—, así que el título salía o no salía según la suerte del
  // arranque (2026-09-29). Una geometría que sobreviva a la página no le hace
  // daño a nadie; un título invisible sí.
  const anterior = useRef<THREE.ExtrudeGeometry | null>(null);
  useEffect(() => {
    if (anterior.current && anterior.current !== geometria) anterior.current.dispose();
    anterior.current = geometria;
  }, [geometria]);

  const giro = useRef(0);

  useFrame((estado, delta) => {
    const m = malla.current;
    if (!m) return;

    if (entro && giro.current < 1) {
      giro.current = Math.min(1, giro.current + delta / 1.9);
      const t = 1 - Math.pow(1 - giro.current, 3);
      m.rotation.y = t * Math.PI * 2;
      m.rotation.x = 0;
      m.scale.setScalar(0.6 + t * 0.4);
      return;
    }

    const p = estado.pointer;
    const objetivoY = THREE.MathUtils.clamp(p.x * GIRO_MAX_Y * 1.6, -GIRO_MAX_Y, GIRO_MAX_Y);
    const objetivoX = THREE.MathUtils.clamp(-p.y * GIRO_MAX_X * 1.6, -GIRO_MAX_X, GIRO_MAX_X);

    const suavizado = 1 - Math.pow(0.0015, delta);
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y % (Math.PI * 2), objetivoY, suavizado);
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, objetivoX, suavizado);

    // Al girar, el texto ocupa más ancho en pantalla. Se compensa encogiéndolo
    // lo justo para que el borde no se pase del cuadro.
    const compensacion = 1 - Math.abs(m.rotation.y) * 0.35;
    m.scale.setScalar(compensacion);
  });

  if (!geometria) return null;

  const ancho = geometria.boundingBox
    ? geometria.boundingBox.max.x - geometria.boundingBox.min.x
    : 1;
  // 0.78 del ancho visible: el resto es el aire que necesita para inclinarse
  // sin tocar los bordes.
  const escala = Math.min((viewport.width * 0.78) / ancho, viewport.height * 0.52);

  return (
    <group scale={escala}>
      <mesh ref={malla} geometry={geometria}>
        {/* Plateado espejo: casi sin rugosidad, para que el reflejo blanco se
            lea como brillo de cromo pulido y no como pintura gris. */}
        <meshPhysicalMaterial
          color="#f2f2f2"
          metalness={1}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={2}
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
      <Environment resolution={256}>
        {/* Cromo: la mayor parte del reflejo es BLANCO. El vino entra solo por
            los costados, como luz de sala — con el vino de frente las letras
            dejan de ser metal y se ven pintadas de rojo. */}
        <Lightformer intensity={10} position={[0, 3, 2]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer intensity={6} position={[0, -3, 2]} scale={[12, 3, 1]} color="#dcdcdc" />
        <Lightformer intensity={2.5} position={[-4, 0, 2]} scale={[2, 6, 1]} color="#c23a52" />
        <Lightformer intensity={1.8} position={[4, 0, 2]} scale={[2, 6, 1]} color="#86192c" />
        {/* La "softbox" de adelante: es la que ven las caras planas de las
            letras. Sin ella el frente refleja el fondo negro y el título se
            lee como una silueta apagada en vez de cromo. */}
        <Lightformer intensity={5} position={[0, 0, 5]} scale={[14, 8, 1]} color="#ffffff" />
        <Lightformer intensity={1} position={[0, 0, -4]} scale={[10, 6, 1]} color="#1c1917" />
      </Environment>

      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />

      <Letras texto={texto} entro={entro} />
    </Canvas>
  );
}
