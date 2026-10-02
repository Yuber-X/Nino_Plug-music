import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * El botón de la portada, con slime (pedido del cliente, 2026-10-02).
 *
 * DOS COSAS DISTINTAS PASAN ACÁ:
 *
 *  1. CON EL MOUSE ENCIMA — del charco de abajo se levantan gotas que SUBEN y
 *     nunca vuelven, "como si el viento se las llevara". Las gotas no son
 *     bolitas sueltas: se FUNDEN entre ellas y con el charco, con cuello y
 *     todo, como en la referencia que mandó el cliente (`slime.jpg`). El color
 *     va rotando entre cuatro neones: verde, rojo, azul y amarillo.
 *
 *  2. AL HACER CLIC — el botón sale girando sobre su eje HORIZONTAL (desde
 *     arriba, no de costado) como un cartel al que le dispararon: da TRES
 *     vueltas enteras, enseñando una y otra vez el reverso —blanco, con el
 *     nombre del sello— y el frente, y en cada vuelta pierde fuerza hasta
 *     quedar quieto justo donde empezó. Recién ahí se abre Spotify: con la
 *     pestaña abriéndose al instante, el giro no se llegaba a ver.
 *
 * CÓMO SE FUNDEN LAS GOTAS. El canvas dibuja círculos sueltos; el efecto de
 * fusión lo pone un filtro SVG ("goo"): desenfoca y después endurece el alfa
 * con una feColorMatrix. Donde dos círculos desenfocados se tocan, la suma de
 * alfas pasa el umbral y aparece el cuello que los une. Es el truco clásico de
 * metaballs, y cuesta muchísimo menos que calcular una superficie implícita a
 * 60 cuadros por segundo.
 *
 * El slime se dibuja en un <canvas> y no con elementos del DOM: son decenas de
 * gotas moviéndose a la vez, y cada una como <div> sería pedirle al navegador
 * que recalcule la maqueta sesenta veces por segundo.
 *
 * El enlace sigue siendo un <a> de verdad: se puede abrir en otra pestaña con
 * el botón del medio, copiar la dirección y leer con lector de pantalla.
 */

/** Los cuatro neones del pedido, en el orden en que se van mezclando. */
const NEONES = [
  [57, 255, 110],   // verde
  [255, 42, 72],    // rojo
  [56, 134, 255],   // azul
  [255, 214, 51],   // amarillo
] as const;

/** Segundos que dura una vuelta completa por los cuatro colores. */
const CICLO_COLOR = 7;

/**
 * Lo que dura el giro con impulso. TIENE que coincidir con la animación
 * `botonGiroImpulso` del CSS: cuando termina, se abre Spotify.
 *
 * Son 2,4 s desde el clic, cómodos dentro de los ~5 s que los navegadores
 * consideran "activación reciente del usuario". Pasado ese rato, `window.open`
 * se bloquearía como si fuera una ventana emergente.
 */
const GIRO_MS = 2600;

interface Gota {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radio: number;
  rebotes: number;
  tono: number;
}

/** Pantalla sin mouse (teléfono, tableta): ahí el slime queda siempre prendido. */
const CONSULTA_TACTIL = '(hover: none), (pointer: coarse)';

function esTactil(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(CONSULTA_TACTIL).matches;
}

/** Mezcla los cuatro neones según el reloj: el color nunca se queda quieto. */
function colorNeon(t: number, alfa: number): string {
  const paso = (t % 1) * NEONES.length;
  const i = Math.floor(paso);
  const k = paso - i;
  const a = NEONES[i];
  const b = NEONES[(i + 1) % NEONES.length];
  const c = (n: 0 | 1 | 2) => Math.round(a[n] + (b[n] - a[n]) * k);
  return `rgba(${c(0)}, ${c(1)}, ${c(2)}, ${alfa})`;
}

export function BotonSlime({ href, children }: { href: string; children: string }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  // ?slime deja el efecto encendido sin mouse. Es para trabajarlo y poder
  // mirarlo en una captura —el hover no se puede fotografiar—, igual que
  // ?entrar salta la puerta y ?carga congela la barra. En producción nadie
  // llega con ese parámetro.
  const bandera =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('slime');

  // EN CELULAR EL SLIME NO SE APAGA NUNCA (pedido del cliente, 2026-10-02).
  // En una pantalla táctil no hay "mouse encima": sin esto, el efecto no se
  // vería jamás en el teléfono, que es donde el sitio se va a mirar más.
  const tactil = useRef(esTactil());
  const encima = useRef(bandera !== null || tactil.current);
  const [girando, setGirando] = useState(false);
  const abierto = useRef(false);
  const red = useRef<number | undefined>(undefined);

  /**
   * Abre Spotify en otra pestaña, UNA sola vez.
   *
   * OJO CON `noopener` EN LA CADENA DE OPCIONES: con él, `window.open` devuelve
   * `null` SIEMPRE, aunque la pestaña se haya abierto perfecto — lo dice la
   * especificación. Acá eso causó el defecto que reportó el cliente el
   * 2026-10-02: la comprobación "si devolvió null es que lo bloquearon"
   * resultaba cierta siempre, así que además de abrir la pestaña nueva
   * mandaba la actual a Spotify.
   *
   * La protección de `noopener` no se pierde: se consigue anulando `opener` en
   * la ventana que se abrió, y de paso el valor devuelto vuelve a servir para
   * saber si de verdad la bloquearon.
   */
  const abrir = useCallback(() => {
    if (abierto.current) return;
    abierto.current = true;
    window.clearTimeout(red.current);

    const otra = window.open(href, '_blank');
    if (otra) otra.opener = null;
    // Solo si de verdad no se abrió nada: lo que no puede pasar es que el
    // clic no haga nada.
    else window.location.href = href;
  }, [href]);

  const alHacerClic = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Con Ctrl/Cmd/medio el visitante pidió otra cosa (abrir aparte, guardar):
      // ahí no se interrumpe nada, se deja al navegador hacer lo suyo.
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      // Sin animación no hay nada que esperar: que el enlace haga lo de siempre.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      e.preventDefault();
      if (girando) return;

      abierto.current = false;
      setGirando(true);
      // Red de seguridad: si por lo que sea no llega el `animationend` —una
      // pestaña en segundo plano, por ejemplo—, igual se abre. Que el clic no
      // haga nada es el único resultado inaceptable.
      red.current = window.setTimeout(abrir, GIRO_MS + 500);
    },
    [abrir, girando],
  );

  /** Terminó el giro: el cartel quedó donde empezó y recién ahí se abre. */
  const alTerminarGiro = useCallback(() => {
    setGirando(false);
    abrir();
  }, [abrir]);

  useEffect(() => () => window.clearTimeout(red.current), []);

  // El cliente prueba el modo celular estirando la ventana, sin recargar.
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA_TACTIL);
    const alCambiar = () => {
      tactil.current = mq.matches;
      if (mq.matches) encima.current = true;
    };
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  // ?slime=giro lanza el giro solo al cargar, para poder mirarlo en una
  // captura sin tener que hacer clic. No abre Spotify: es para trabajar.
  useEffect(() => {
    if (bandera !== 'giro') return;
    abierto.current = true;
    const id = window.setTimeout(() => setGirando(true), 300);
    return () => window.clearTimeout(id);
  }, [bandera]);

  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return;

    // Quien pidió menos movimiento no ve nada de esto: el botón queda quieto.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gotas: Gota[] = [];
    let charco = 0;          // alto del charco de abajo, en píxeles
    let cuadro = 0;
    let anterior = performance.now();
    let ancho = 0;
    let alto = 0;

    const medir = () => {
      const caja = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ancho = caja.width;
      alto = caja.height;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(canvas);

    const nacer = (t: number): Gota => ({
      x: 6 + Math.random() * Math.max(1, ancho - 12),
      y: alto - charco * 0.6,
      // Sube siempre; el "viento" es la deriva lateral, que cambia por gota.
      // Despacio (2026-10-02): a la velocidad anterior las gotas cruzaban el
      // botón antes de alcanzar a fundirse con nadie.
      vx: (Math.random() - 0.5) * 14,
      vy: -(9 + Math.random() * 20),
      // Gordas: dos gotas finas nunca llegan a tocarse y el filtro no tiene
      // qué unir. El tamaño es lo que hace que se vean los cuellos.
      radio: 3.4 + Math.random() * 6.2,
      // 0 a 3 rebotes: el que sale con 0 se va derecho.
      rebotes: Math.floor(Math.random() * 4),
      tono: t,
    });

    const paso = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - anterior) / 1000);
      anterior = ahora;
      const t = ahora / 1000 / CICLO_COLOR;

      ctx.clearRect(0, 0, ancho, alto);
      // Un solo color por cuadro: el filtro de fusión necesita que todo lo que
      // se toca sea del mismo tono, o el cuello se vería de dos colores.
      const tinta = colorNeon(t, 1);

      // --- el charco: sube mientras el mouse está encima, baja al salir ---
      // Más bajo que la mitad a propósito: con el charco muy alto las gotas
      // nacen dentro de él y se funden sin llegar a verse subir.
      const techo = alto * 0.42;
      charco += ((encima.current ? techo : 0) - charco) * Math.min(1, dt * (encima.current ? 2 : 4));

      ctx.fillStyle = tinta;

      if (charco > 0.5) {
        ctx.beginPath();
        ctx.moveTo(0, alto);
        ctx.lineTo(0, alto - charco);
        // La superficie ondea: sin esto parece una barra de progreso.
        for (let x = 0; x <= ancho; x += 6) {
          const onda =
            Math.sin(x / 26 + ahora / 520) * 2.4 + Math.sin(x / 11 - ahora / 340) * 1.2;
          ctx.lineTo(x, alto - charco + onda);
        }
        ctx.lineTo(ancho, alto);
        ctx.closePath();
        ctx.fill();
      }

      // --- nacen gotas mientras haya mouse encima ---
      if (encima.current && gotas.length < 30 && Math.random() < dt * 16)
        gotas.push(nacer(t));

      // --- suben, chocan, se funden y se van ---
      for (let k = gotas.length - 1; k >= 0; k--) {
        const g = gotas[k];
        // Aire que empuja hacia arriba: la gota ACELERA, no cae.
        g.vy -= 7 * dt;
        g.x += g.vx * dt;
        g.y += g.vy * dt;

        if (g.rebotes > 0) {
          if (g.x - g.radio < 0 || g.x + g.radio > ancho) {
            g.vx *= -0.82;
            g.x = Math.max(g.radio, Math.min(ancho - g.radio, g.x));
            g.rebotes--;
          }
        }

        // Se fue por arriba: no vuelve nunca (pedido del cliente).
        if (g.y + g.radio < -6) {
          gotas.splice(k, 1);
          continue;
        }

        // CHOQUE: si dos se solapan de verdad, se hacen UNA sola más gorda
        // (pedido del cliente, 2026-10-02). El radio nuevo conserva el área —
        // √(r₁² + r₂²)— porque sumar los radios daría una gota enorme de la
        // nada, y la velocidad se promedia pesada por tamaño, que es lo que
        // haría un choque de verdad.
        for (let j = k - 1; j >= 0; j--) {
          const o = gotas[j];
          const dx = o.x - g.x;
          const dy = o.y - g.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= (g.radio + o.radio) * 0.65) continue;

          const pesoG = g.radio * g.radio;
          const pesoO = o.radio * o.radio;
          const total = pesoG + pesoO;
          o.x = (g.x * pesoG + o.x * pesoO) / total;
          o.y = (g.y * pesoG + o.y * pesoO) / total;
          o.vx = (g.vx * pesoG + o.vx * pesoO) / total;
          o.vy = (g.vy * pesoG + o.vy * pesoO) / total;
          o.radio = Math.min(11, Math.sqrt(total));
          gotas.splice(k, 1);
          break;
        }
        if (!gotas.includes(g)) continue;

        ctx.beginPath();
        ctx.arc(g.x, g.y, g.radio, 0, Math.PI * 2);
        ctx.fill();
      }

      cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
    };
  }, []);

  return (
    <a
      className={`btn-slime${girando ? ' girando' : ''}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      onPointerEnter={() => (encima.current = true)}
      onPointerLeave={() => {
        // En táctil, un toque dispara enter y enseguida leave: apagarlo ahí
        // dejaría el botón pelado justo después de tocarlo.
        if (!tactil.current && bandera === null) encima.current = false;
      }}
      onClick={alHacerClic}
    >
      {/* El filtro que funde las gotas. Va una sola vez, escondido: un SVG de
          0x0 no ocupa lugar ni se lee en voz alta. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="btn-slime-filtro">
        <defs>
          <filter id="slimeGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="borroso" />
            {/* Endurece el alfa: lo que quedó medio transparente por el
                desenfoque pasa a opaco o desaparece. Ahí nacen los cuellos. */}
            <feColorMatrix
              in="borroso"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <span className="btn-slime-giro" onAnimationEnd={alTerminarGiro}>
        <span className="btn-slime-cara">
          <canvas ref={lienzo} className="btn-slime-lienzo" aria-hidden="true" />
          <span className="btn-slime-texto">{children}</span>
        </span>
        {/* El reverso: blanco, con el sello. aria-hidden porque es la misma
            acción vista por detrás, no otro enlace. */}
        <span className="btn-slime-cara btn-slime-reverso" aria-hidden="true">
          Money One 1
        </span>
      </span>
    </a>
  );
}
