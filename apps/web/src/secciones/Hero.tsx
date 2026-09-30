import { Suspense, lazy, useEffect, useRef, useState } from 'react';

import { artista, temas } from '../datos/artista';
import { hayWebGL } from '../tres/webgl';
import { FondoVideo } from './FondoVideo';

/**
 * three.js + drei pesan más que todo el resto del sitio junto. Cargándolos
 * aparte, la página aparece completa de entrada y el motor 3D llega mientras
 * el visitante todavía está en la puerta; en una máquina sin WebGL no se
 * descarga nunca.
 */
const TituloCromado = lazy(() =>
  import('../tres/TituloCromado').then((m) => ({ default: m.TituloCromado })),
);

const NOMBRE = 'SKINNY XANDER';

/**
 * Portada.
 *
 * Ajustes pedidos por el cliente el 2026-09-29: fuera la bajada de texto, el
 * botón de reproducir y los destellos ("le da un toque infantil"); el dato del
 * último sencillo pasa a estar DEBAJO del nombre; y detrás de todo van los
 * clips del video oficial.
 *
 * Hay DOS versiones del título y no es indecisión:
 *  · La 3D real (three.js) es la buena, la que pidió el cliente.
 *  · La de CSS queda como respaldo para las máquinas sin WebGL y para quien
 *    activó "reducir movimiento". Un sitio de música que en una PC vieja de la
 *    disquera no muestra el nombre del artista no sirve de nada.
 */
export function Hero({ entro }: { entro: boolean }) {
  const escenario = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const [tres, setTres] = useState(false);

  const ultimo = temas[0];
  const anio = ultimo.lanzamiento.slice(0, 4);

  useEffect(() => {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTres(hayWebGL() && !reducido);
  }, []);

  // ---- Respaldo en CSS: mismo tilt del prototipo, ya contenido ----
  useEffect(() => {
    if (tres) return;
    const stage = escenario.current;
    const h1 = titulo.current;
    if (!stage || !h1) return;

    const finos = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finos || reducido) {
      h1.classList.add('settled');
      return;
    }

    const mover = (e: MouseEvent) => {
      const r = h1.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const dx = px - 0.5;
      const dy = py - 0.5;
      h1.style.setProperty('--mx', `${px * 100}%`);
      h1.style.setProperty('--my', `${py * 100}%`);
      h1.style.setProperty('--ry', `${dx * 9}deg`);
      h1.style.setProperty('--rx', `${-dy * 7}deg`);
      h1.style.setProperty('--sx', `${-dx * 14}px`);
      h1.style.setProperty('--sy', `${10 + dy * 12}px`);
    };
    const salir = () => {
      h1.style.setProperty('--rx', '0deg');
      h1.style.setProperty('--ry', '0deg');
      h1.style.setProperty('--sx', '0px');
      h1.style.setProperty('--sy', '10px');
    };

    stage.addEventListener('mousemove', mover);
    stage.addEventListener('mouseleave', salir);
    return () => {
      stage.removeEventListener('mousemove', mover);
      stage.removeEventListener('mouseleave', salir);
    };
  }, [tres]);

  useEffect(() => {
    if (tres) return;
    const h1 = titulo.current;
    if (!h1 || !entro) return;

    const alTerminar = (e: AnimationEvent) => {
      if (e.animationName !== 'chromeSpin') return;
      h1.classList.remove('spin-play');
      h1.classList.add('settled');
    };
    h1.addEventListener('animationend', alTerminar);
    h1.classList.add('spin-play');
    return () => h1.removeEventListener('animationend', alTerminar);
  }, [entro, tres]);

  return (
    <section className="hero" id="hero">
      <FondoVideo activo={entro} />

      <div className={tres ? 'title-stage title-3d' : 'title-stage'} ref={escenario}>
        {tres ? (
          <Suspense fallback={null}>
            <TituloCromado texto={NOMBRE} entro={entro} />
          </Suspense>
        ) : (
          <h1 className="chrome-title" ref={titulo}>
            {NOMBRE}
          </h1>
        )}
        {/* El nombre siempre está en el HTML, aunque la portada sea un canvas:
            es lo que leen Google y un lector de pantalla. */}
        {tres && <h1 className="solo-lectores">{NOMBRE}</h1>}
      </div>

      {/* El dato del lanzamiento va DEBAJO del nombre (pedido 2026-09-29):
          arriba competía con el título. */}
      <div className="kicker kicker-bajo">
        Último sencillo · {ultimo.titulo} · {anio}
      </div>

      <div className="hero-actions">
        <a
          className="btn btn-ghost"
          href={artista.enlaces.spotify}
          target="_blank"
          rel="noreferrer"
        >
          Ver Spotify
        </a>
      </div>

      <div className="scroll-cue">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
