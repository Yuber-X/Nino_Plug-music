import { useState } from 'react';
import { temas } from '../datos/artista';

type Filtro = 'todos' | 'sencillo' | 'portada';

/**
 * El portafolio visual.
 *
 * Por ahora son las portadas reales del catálogo, no maquetas de color: dan
 * una idea honesta de cómo va a verse la grilla. Los videos oficiales del
 * cliente (los .mp4 que dejó en el material) entran cuando definamos dónde se
 * alojan — pesan 25-40 MB cada uno y no pueden ir al repositorio.
 */
export function Videos() {
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const tarjetas = temas.slice(0, 9).map((t, i) => ({
    ...t,
    // Sin metadatos de video todavía: se alterna para mostrar el filtro
    // funcionando. Se reemplaza por la categoría real cuando llegue el listado.
    categoria: (i % 3 === 0 ? 'portada' : 'sencillo') as Exclude<Filtro, 'todos'>,
  }));

  const visibles = tarjetas.filter((t) => filtro === 'todos' || t.categoria === filtro);

  return (
    <section id="videos">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">Portafolio</div>
            <h2 className="section-title">Trabajos</h2>
          </div>
          <div className="filters">
            {(['todos', 'sencillo', 'portada'] as const).map((f) => (
              <button
                key={f}
                className={filtro === f ? 'filter active' : 'filter'}
                onClick={() => setFiltro(f)}
              >
                {f === 'todos' ? 'Todos' : f === 'sencillo' ? 'Sencillos' : 'Portadas'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid reveal">
          {visibles.map((t) => (
            <a key={t.id} className="card" href={t.apple} target="_blank" rel="noreferrer">
              <img className="card-art" src={t.arte} alt={`Portada de ${t.titulo}`} loading="lazy" />
              <div className="tag">{t.categoria === 'portada' ? 'Portada' : 'Sencillo'}</div>
              <div className="label">{t.titulo}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
