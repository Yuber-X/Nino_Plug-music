import { useEffect, useState } from 'react';
import Lenis from 'lenis';
// La hoja de Lenis hace falta: sin ella el navegador sigue con su scroll-behavior
// y el desplazamiento suave no se nota (el cliente lo pidió otra vez el
// 2026-09-30, y era esto lo que faltaba).
import 'lenis/dist/lenis.css';

import { Cargando } from './componentes/Cargando';
import { Nav } from './componentes/Nav';
import { MiniReproductor } from './componentes/MiniReproductor';
import { Hero } from './secciones/Hero';
import { Musica } from './secciones/Musica';
import { Videos } from './secciones/Videos';
import { Sobre } from './secciones/Sobre';
import { Pie } from './secciones/Pie';
import { useReproductor } from './ganchos/useReproductor';

import './estilos/tokens.css';
import './estilos/global.css';
import './estilos/cargando.css';

export default function App() {
  // ?entrar salta la pantalla de carga. Es para trabajar: al recargar cien
  // veces mientras se ajusta una sección, esperar la barra cada vez cansa.
  // En producción nadie llega con ese parámetro.
  const saltarIntro =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('entrar');

  const [entro, setEntro] = useState(saltarIntro);
  const reproductor = useReproductor();

  // Scroll suave. Se apaga si el visitante pidió menos movimiento: el scroll
  // con inercia marea a quien activó esa preferencia justamente por eso.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // anchors: true hace que los enlaces del menú (#musica, #videos…) también
    // bajen suave en vez de saltar de golpe.
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, anchors: true });
    let frame = 0;
    const animar = (t: number) => {
      lenis.raf(t);
      frame = requestAnimationFrame(animar);
    };
    frame = requestAnimationFrame(animar);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  // Aparecer al entrar en pantalla (lo que en el prototipo hacía .reveal).
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observador.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    for (const el of Array.from(document.querySelectorAll('.reveal'))) observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const entrar = () => {
    setEntro(true);
    // El click de la pantalla de carga es el gesto que habilita el audio en el
    // navegador; la música entra subiendo mientras aparece la portada.
    reproductor.entrarSuave(3.5);
  };

  return (
    <>
      {!saltarIntro && <Cargando alEntrar={entrar} />}
      <Nav />
      <main>
        <Hero entro={entro} />
        <Musica reproductor={reproductor} />
        <Videos />
        <Sobre />
      </main>
      <Pie />
      <MiniReproductor reproductor={reproductor} visible={entro} />
    </>
  );
}
