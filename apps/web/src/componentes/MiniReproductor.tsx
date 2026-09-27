import { reloj, type EstadoReproductor } from '../ganchos/useReproductor';

/** La píldora fija de abajo: qué suena, cuánto va y play/pausa. */
export function MiniReproductor({
  reproductor,
  visible,
}: {
  reproductor: EstadoReproductor;
  visible: boolean;
}) {
  const { temaActual, sonando, progreso, tiempo, alternar } = reproductor;

  return (
    <div className={visible ? 'mini-player show' : 'mini-player'}>
      <button
        className={sonando ? 'mp-play playing' : 'mp-play'}
        onClick={alternar}
        aria-label={sonando ? 'Pausar' : 'Reproducir'}
      />
      <div className="mp-info">
        <div className="mp-name">
          {temaActual.titulo} — {temaActual.genero}
        </div>
        <div className="mp-bar">
          <i style={{ width: `${Math.min(100, progreso * 100)}%` }} />
        </div>
      </div>
      <div className="mp-time">{reloj(tiempo)}</div>
    </div>
  );
}
