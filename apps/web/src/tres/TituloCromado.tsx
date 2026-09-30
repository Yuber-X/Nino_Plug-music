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
  maguntia: '/fuentes/UnifrakturMaguntia-Book.ttf',
  cook: '/fuentes/UnifrakturCook-Bold.ttf',
  rocker: '/fuentes/NewRocker-Regular.ttf',
  metalmania: '/fuentes/MetalMania-Regular.ttf',
  nosifer: '/fuentes/Nosifer-Regular.ttf',
  eater: '/fuentes/Eater-Regular.ttf',
  pirata: '/fuentes/PirataOne-Regular.ttf',
  lodger: '/fuentes/JollyLodger-Regular.ttf',
  // Darkhusk NO viaja en el repositorio: es de uso personal y subirla a un
  // repositorio público sería redistribuirla. Para compararla, copiar el .otf
  // desde "Claude Active\Web\...\Fuentes" a apps/web/public/fuentes/ y
  // abrir ?fuente=darkhusk.
  darkhusk: '/fuentes/Darkhusk.otf',
};

/**
 * La que usa el sitio hoy. Eater no gustó (2026-09-30): Unifraktur Cook es la
 * blackletter gruesa de las portadas de metal y de las carátulas de trap
 * oscuro, y con el título grande es la que mejor aguanta. Todas las de la
 * lista son libres para uso comercial.
 */
const FUENTE_POR_DEFECTO = 'cook';

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

/**
 * Tope de inclinación. Bajado a la mitad el 2026-09-30: el cliente pidió que
 * el título reaccione "un tanto menos" al mouse. Además, cuanto menos gira,
 * menos aire necesita a los costados para no salirse de cuadro.
 */
const GIRO_MAX_Y = 0.085;  // ~5°
const GIRO_MAX_X = 0.05;   // ~3°

/** Cuánto tarda una vuelta del paseo solo (modo celular), en segundos. */
const RONDA = 14;

/** ¿Pantalla táctil? Ahí el título no sigue al dedo: se pasea solo. */
function esTactil(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

/**
 * El reflejo que recorre las letras.
 *
 * Es una luz alargada que cruza de lado a lado por delante del texto: al
 * pasar, el metal la devuelve como un destello que viaja. Solo toca al título
 * —es un reflejo del material, no un filtro sobre la pantalla—, que es
 * exactamente lo que pidió el cliente: que brille el texto, no la página.
 */
function DestelloViajero() {
  const luz = useRef<THREE.PointLight>(null);

  useFrame((estado) => {
    const l = luz.current;
    if (!l) return;

    // Una pasada cada 5,5 s, de izquierda a derecha, bien cerca del texto. El
    // resto del ciclo la luz se queda afuera de cuadro y apagada: un brillo
    // permanente deja de ser un brillo.
    const ciclo = 5.5;
    const t = (estado.clock.elapsedTime % ciclo) / ciclo;
    const cruzando = t < 0.55;
    const avance = cruzando ? t / 0.55 : 1;

    l.position.set(-4.2 + avance * 8.4, 0.35, 1.25);
    l.intensity = cruzando ? 26 * Math.sin(avance * Math.PI) : 0;
  });

  // Una luz puntual y no un panel del ambiente: en PBR el metal refleja el
  // ambiente por igual en toda la cara plana, así que un panel más grande solo
  // aclaraba las letras enteras. La luz puntual deja un reflejo chico que SÍ
  // se ve viajar por los trazos (probado el 2026-09-30).
  return <pointLight ref={luz} color="#ffffff" distance={9} decay={1.1} intensity={0} />;
}

/**
 * Una franja blanca angosta que gira alrededor del título.
 *
 * Es lo que hace que el reflejo cambie según la inclinación de cada trazo: con
 * un ambiente parejo, todas las caras del metal devuelven lo mismo y la plata
 * se ve como pintura gris. La franja da el contraste; la luz viajera pone el
 * golpe de brillo.
 */
function FranjaGiratoria() {
  const grupo = useRef<THREE.Group>(null);

  useFrame((estado, delta) => {
    if (grupo.current) grupo.current.rotation.z += delta * 0.35;
    void estado;
  });

  return (
    <group ref={grupo}>
      <Lightformer
        form="rect"
        intensity={9}
        position={[0, 0, 4]}
        rotation={[0, 0, Math.PI / 3]}
        scale={[0.9, 20, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={4}
        position={[0, 0, 4]}
        rotation={[0, 0, -Math.PI / 6]}
        scale={[0.5, 20, 1]}
        color="#c23a52"
      />
    </group>
  );
}

function Letras({ texto, entro }: Props) {
  const malla = useRef<THREE.Mesh>(null);
  const [fuente, setFuente] = useState<import('opentype.js').Font | null>(null);
  const [tactil, setTactil] = useState(esTactil);
  const { viewport } = useThree();

  // Se escucha el cambio: el cliente prueba el modo celular estirando la
  // ventana, sin recargar.
  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const alCambiar = () => setTactil(mq.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

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

    // En celular no hay puntero que seguir y "seguir el dedo" pelea con el
    // scroll: el título da vueltas solo, como si el mouse dibujara círculos
    // alrededor de la zona de interacción (pedido del cliente, 2026-09-30).
    let objetivoY: number;
    let objetivoX: number;
    if (tactil) {
      const a = (estado.clock.elapsedTime / RONDA) * Math.PI * 2;
      objetivoY = Math.sin(a) * GIRO_MAX_Y;
      objetivoX = Math.cos(a) * GIRO_MAX_X;
    } else {
      const p = estado.pointer;
      objetivoY = THREE.MathUtils.clamp(p.x * GIRO_MAX_Y * 1.1, -GIRO_MAX_Y, GIRO_MAX_Y);
      objetivoX = THREE.MathUtils.clamp(-p.y * GIRO_MAX_X * 1.1, -GIRO_MAX_X, GIRO_MAX_X);
    }

    // Persigue el objetivo más despacio que antes: el tirón seco era parte de
    // lo que hacía sentir el título "nervioso".
    const suavizado = 1 - Math.pow(0.05, delta);
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
  // 0.76 del ancho visible. Parece menos que el 0.92 de antes y es MÁS texto:
  // el canvas dejó de estar capado en 920 px y ahora mide hasta 1600, así que
  // el nombre queda un 20% más grande que en la captura del cliente y encima
  // le sobran unos 200 px de aire a cada lado para inclinarse sin cortarse.
  const escala = Math.min((viewport.width * 0.76) / ancho, viewport.height * 0.72);

  return (
    <group scale={escala}>
      <mesh ref={malla} geometry={geometria}>
        {/* Plateado espejo: casi sin rugosidad, para que el reflejo blanco se
            lea como brillo de cromo pulido y no como pintura gris. */}
        {/* Plata pulida: rugosidad casi nula para que el destello viajero se
            lea como un reflejo que corre por el canto, y no como una mancha
            clara pegada a la letra. */}
        <meshPhysicalMaterial
          color="#c9c9cf"
          metalness={1}
          roughness={0.11}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.35}
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
        {/* Anchos de sobra y los de vino más afuera: con el título más grande,
            las últimas letras caían fuera del blanco y quedaban ROJAS en vez de
            plateadas — se ve en la captura del cliente del 2026-09-30. */}
        <Lightformer intensity={4} position={[0, 3, 2]} scale={[22, 4, 1]} color="#ffffff" />
        <Lightformer intensity={2.2} position={[0, -3, 2]} scale={[22, 3, 1]} color="#b9b9bd" />
        <Lightformer intensity={2.5} position={[-8, 0, 2]} scale={[2, 6, 1]} color="#c23a52" />
        <Lightformer intensity={1.8} position={[8, 0, 2]} scale={[2, 6, 1]} color="#86192c" />
        {/* La "softbox" de adelante: es la que ven las caras planas de las
            letras. Sin ella el frente refleja el fondo negro y el título se
            lee como una silueta apagada en vez de cromo. */}
        {/* La softbox de adelante baja a la mitad: con ella al máximo las caras
            quedaban blancas de punta a punta y el destello viajero no se veía
            pasar — no había dónde brillar (2026-09-30). */}
        <Lightformer intensity={1.7} position={[0, 0, 5]} scale={[24, 9, 1]} color="#ffffff" />
        <Lightformer intensity={1} position={[0, 0, -4]} scale={[16, 7, 1]} color="#1c1917" />
      </Environment>

      <FranjaGiratoria />
      <DestelloViajero />

      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />

      <Letras texto={texto} entro={entro} />
    </Canvas>
  );
}
