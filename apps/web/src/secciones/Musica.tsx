import { temas } from '../datos/artista';
import { reloj, type EstadoReproductor } from '../ganchos/useReproductor';

/**
 * La discografía, con el tema que suena marcado.
 *
 * La lista y el mini reproductor comparten el mismo estado (useReproductor):
 * tocar un tema acá es lo mismo que tocarlo abajo.
 */
export function Musica({ reproductor }: { reproductor: EstadoReproductor }) {
  const { indice, sonando, tiempo, duracion, elegir } = reproductor;

  return (
    <section className="player-section" id="musica">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">Discografía</div>
            <h2 className="section-title">En reproducción</h2>
          </div>
        </div>

        <div className="tracklist reveal">
          {temas.map((tema, i) => {
            const activo = i === indice;
            return (
              <button
                key={tema.id}
                className={activo ? 'track active' : 'track'}
                onClick={() => elegir(i)}
                aria-pressed={activo && sonando}
              >
                <span className="t-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="t-meta">
                  <span className="t-name">{tema.titulo}</span>
                  <span className="t-feat">
                    {activo && sonando
                      ? 'Reproduciendo ahora'
                      : `${tema.genero} · ${tema.lanzamiento.slice(0, 4)}`}
                  </span>
                </span>
                <span className="t-time">
                  {activo && duracion > 0
                    ? `${reloj(tiempo)} / ${reloj(duracion)}`
                    : reloj(tema.duracionMs / 1000)}
                </span>
                <span className="t-play" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <p className="aviso-datos">
          Adelantos de 30 segundos del catálogo público mientras el cliente entrega los audios
          finales.
        </p>
      </div>
    </section>
  );
}
