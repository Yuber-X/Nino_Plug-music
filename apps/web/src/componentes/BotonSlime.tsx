import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * El botón de la portada, con slime (pedido del cliente, 2026-10-02).
 *
 * DOS COSAS DISTINTAS PASAN ACÁ:
 *
 *  1. CON EL MOUSE ENCIMA — del borde de abajo empiezan a salir gotas que
 *     SUBEN y nunca vuelven, "como si el viento se las llevara", y abajo se va
 *     acumulando un charco. Algunas gotas rebotan contra las paredes de
 *     adentro entre 1 y 3 veces antes de irse. El color va rotando entre
 *     cuatro neones: verde, rojo, azul y amarillo.
 *
 *  2. AL HACER CLIC — el botón se da vuelta como un cartel al que le
 *     dispararon: gira sobre su eje HORIZONTAL (desde arriba, no de costado),
 *     enseña el reverso —blanco, con el nombre del sello en letras oscuras—
 *     durante segundo y medio, y vuelve solo.
 *
 * El slime se dibuja en un <canvas> y no con elementos del DOM: son decenas de
 * gotas moviéndose a la vez, y cada una como <div> sería pedirle al navegador
 * que recalcule la maqueta sesenta veces por segundo.
 *
 * El enlace sigue siendo un <a> de verdad: se puede abrir en otra pestaña con
 * el botón del medio, copiar la dirección y leer con lector de pantalla. La
 * vuelta es decoración; el clic nunca se bloquea ni se demora.
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

/** Cuánto se queda el reverso a la vista, en milisegundos (pedido: 1,5 s). */
const REVERSO_MS = 1500;

interface Gota {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radio: number;
  rebotes: number;
  tono: number;
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
  const encima = useRef(false);
  const [volteado, setVolteado] = useState(false);
  const temporizador = useRef<number | undefined>(undefined);

  const alHacerClic = useCallback(() => {
    // El enlace abre igual: esto es solo la vuelta del cartel.
    setVolteado(true);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setVolteado(false), REVERSO_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

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
      y: alto - charco * 0.5,
      // Sube siempre; el "viento" es la deriva lateral, que cambia por gota.
      vx: (Math.random() - 0.5) * 26,
      vy: -(24 + Math.random() * 54),
      radio: 1.6 + Math.random() * 5.4,
      // 0 a 3 rebotes: el que sale con 0 se va derecho.
      rebotes: Math.floor(Math.random() * 4),
      tono: t,
    });

    const paso = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - anterior) / 1000);
      anterior = ahora;
      const t = ahora / 1000 / CICLO_COLOR;

      ctx.clearRect(0, 0, ancho, alto);

      // --- el charco: sube mientras el mouse está encima, baja al salir ---
      const techo = alto * 0.55;
      charco += ((encima.current ? techo : 0) - charco) * Math.min(1, dt * (encima.current ? 2.6 : 4.5));

      if (charco > 0.5) {
        ctx.beginPath();
        ctx.moveTo(0, alto);
        ctx.lineTo(0, alto - charco);
        // La superficie ondea: sin esto parece una barra de progreso.
        for (let x = 0; x <= ancho; x += 6) {
          const onda =
            Math.sin(x / 26 + ahora / 320) * 2.6 + Math.sin(x / 11 - ahora / 210) * 1.4;
          ctx.lineTo(x, alto - charco + onda);
        }
        ctx.lineTo(ancho, alto);
        ctx.closePath();
        // El halo es lo que hace que se lea como NEÓN y no como pintura: sin
        // él el color queda plano sobre el fondo oscuro.
        ctx.shadowBlur = 18;
        ctx.shadowColor = colorNeon(t, 0.9);
        ctx.fillStyle = colorNeon(t, 0.85);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cresta clara: le da el brillo mojado del slime.
        ctx.beginPath();
        for (let x = 0; x <= ancho; x += 6) {
          const onda =
            Math.sin(x / 26 + ahora / 320) * 2.6 + Math.sin(x / 11 - ahora / 210) * 1.4;
          if (x === 0) ctx.moveTo(x, alto - charco + onda);
          else ctx.lineTo(x, alto - charco + onda);
        }
        ctx.strokeStyle = 'rgba(255,255,255,.55)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // --- nacen gotas mientras haya mouse encima ---
      if (encima.current && gotas.length < 70) {
        // Varias por cuadro: con una sola el borde se veía vacío al principio.
        const cuantas = Math.random() < dt * 58 ? 2 : Math.random() < dt * 40 ? 1 : 0;
        for (let n = 0; n < cuantas; n++) gotas.push(nacer(t));
      }

      // --- suben, rebotan y se van ---
      for (let k = gotas.length - 1; k >= 0; k--) {
        const g = gotas[k];
        // Aire que empuja hacia arriba: la gota ACELERA, no cae.
        g.vy -= 26 * dt;
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
        if (g.y + g.radio < -4) {
          gotas.splice(k, 1);
          continue;
        }

        // Se apaga a medida que sube: la que llega arriba ya casi no se ve.
        const desvanece = Math.min(1, Math.max(0, (g.y + g.radio) / Math.max(1, alto)));
        const color = colorNeon(g.tono + (t - g.tono) * 0.5, 0.45 + desvanece * 0.5);

        // 'lighter' suma luz donde las gotas se cruzan, que es exactamente lo
        // que hace un neón de verdad.
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.radio, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'source-over';
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
      className={`btn-slime${volteado ? ' volteado' : ''}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      onPointerEnter={() => (encima.current = true)}
      onPointerLeave={() => (encima.current = false)}
      onClick={alHacerClic}
    >
      <span className="btn-slime-giro">
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
