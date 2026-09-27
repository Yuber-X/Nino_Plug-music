import { useEffect, useState } from 'react';
import Lenis from 'lenis';

import { Intro } from './componentes/Intro';
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

export default function App() {
  // ?entrar salta la puerta de entrada. Es para trabajar: al recargar cien
  // veces mientras se ajusta una sección, hacer click en el disco cada vez
  // cansa. En produccion nadie llega con ese parametro.
  const saltarIntro =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('entrar');

  const [entro, setEntro] = useState(saltarIntro);
  const reproductor = useReproductor();

  // Scroll suave. Se apaga si el visitante pidió menos movimiento: el scroll
  // con inercia marea a quien activó esa preferencia justamente por eso.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
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
    for (const el of document.querySelectorAll('.reveal')) observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const entrar = () => {
    setEntro(true);
    // El click del intro es el gesto que habilita el audio en el navegador.
    reproductor.elegir(0);
  };

  return (
    <>
      {!saltarIntro && <Intro alEntrar={entrar} />}
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
