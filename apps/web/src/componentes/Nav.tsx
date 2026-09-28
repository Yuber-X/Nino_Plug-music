import { useEffect, useState } from 'react';

const SECCIONES = [
  { id: 'hero', etiqueta: 'Inicio' },
  { id: 'musica', etiqueta: 'Música' },
  { id: 'videos', etiqueta: 'Videos' },
  { id: 'sobre', etiqueta: 'Sobre' },
] as const;

/**
 * Barra superior. Se vuelve sólida al bajar y marca la sección visible.
 *
 * La sección activa sale de un IntersectionObserver y no del scroll: con el
 * scroll suave (Lenis) la posición va siempre un poco atrasada respecto de lo
 * que el visitante está viendo, y el subrayado queda marcando la sección
 * anterior.
 */
export function Nav() {
  const [solida, setSolida] = useState(false);
  const [activa, setActiva] = useState<string>('hero');

  useEffect(() => {
    const alScroll = () => setSolida(window.scrollY > 40);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    for (const { id } of SECCIONES) {
      const el = document.getElementById(id);
      if (el) observador.observe(el);
    }
    return () => observador.disconnect();
  }, []);

  return (
    <header className={solida ? 'nav solid' : 'nav'}>
      {/* El artista es lo que se lee; Money One 1 es el sello y va como
          crédito, no compitiendo con el nombre (decisión de Yuber 2026-09-28). */}
      <div className="brand">
        <span className="brand-artista">SKINNY XANDER</span>
        <span className="brand-sello">Money One 1</span>
      </div>
      <ul className="nav-links">
        {SECCIONES.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={activa === s.id ? 'active' : undefined}>
              {s.etiqueta}
            </a>
          </li>
        ))}
      </ul>
      <a className="nav-cta" href="#musica">
        Escuchar ahora
      </a>
    </header>
  );
}
