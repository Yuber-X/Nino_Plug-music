import type { EstadoReproductor } from '../ganchos/useReproductor';

/**
 * La píldora fija de abajo: qué suena, cuánto va y play/pausa.
 *
 * SIN CONTADOR DE MINUTOS: el cliente lo pidió quitar el 2026-09-30 (el
 * "00:30" delataba que lo que suena es un adelanto de 30 segundos). La barra
 * sigue mostrando el avance.
 */
export function MiniReproductor({
  reproductor,
  visible,
}: {
  reproductor: EstadoReproductor;
  visible: boolean;
}) {
  const { temaActual, sonando, progreso, alternar } = reproductor;

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
    </div>
  );
}
