import { useEffect, useRef } from 'react';

/**
 * Portada: el título cromado que gira al entrar y después queda reaccionando al
 * mouse.
 *
 * ⚠ Por ahora el efecto es el del prototipo: CSS (degradado cromado +
 * perspectiva + tilt con el puntero). Three.js entra en la fase de mejora,
 * cuando el cliente apruebe la base — la idea es reemplazar solo este bloque
 * por letras extruidas con material metálico, sin tocar el resto del sitio.
 */
export function Hero({ entro }: { entro: boolean }) {
  const escenario = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const stage = escenario.current;
    const h1 = titulo.current;
    if (!stage || !h1) return;

    // Sin puntero fino (táctil) o con "reducir movimiento", no se liga nada:
    // en un teléfono el tilt no tiene sentido y el movimiento molesta a quien
    // pidió que no lo haya.
    const finos = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finos || reducido) return;

    const mover = (e: MouseEvent) => {
      const r = h1.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const dx = px - 0.5;
      const dy = py - 0.5;
      h1.style.setProperty('--mx', `${px * 100}%`);
      h1.style.setProperty('--my', `${py * 100}%`);
      h1.style.setProperty('--ry', `${dx * 16}deg`);
      h1.style.setProperty('--rx', `${-dy * 14}deg`);
      h1.style.setProperty('--sx', `${-dx * 22}px`);
      h1.style.setProperty('--sy', `${10 + dy * 18}px`);
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
  }, []);

  useEffect(() => {
    const h1 = titulo.current;
    if (!h1 || !entro) return;

    // Cuando termina el giro, el título pasa a "settled": ahí suelta el
    // transform de la animación y queda mandado por las variables del tilt. Si
    // se deja pegado al final de la animación, se queda tieso para siempre.
    const alTerminar = (e: AnimationEvent) => {
      if (e.animationName !== 'chromeSpin') return;
      h1.classList.remove('spin-play');
      h1.classList.add('settled');
    };
    h1.addEventListener('animationend', alTerminar);
    h1.classList.add('spin-play');
    return () => h1.removeEventListener('animationend', alTerminar);
  }, [entro]);

  return (
    <section className="hero" id="hero">
      <div className="kicker">Último sencillo · 2026</div>
      <div className="title-stage" ref={escenario}>
        <h1 className="chrome-title" ref={titulo}>
          ASCENSIÓN
        </h1>
        <span className="sparkle" style={{ top: '6%', left: '2%', fontSize: 22 }}>
          ✦
        </span>
        <span className="sparkle" style={{ bottom: '10%', right: '4%', fontSize: 15, animationDelay: '1.3s' }}>
          ✦
        </span>
      </div>
      <p className="sub">
        Trap, rap y dembow desde República Dominicana. Sonido crudo, visuales oscuros, sin filtro.
      </p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#musica">
          ▶ Reproducir ahora
        </a>
        <a className="btn btn-ghost" href="#videos">
          Ver videos
        </a>
      </div>
      <div className="scroll-cue">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
