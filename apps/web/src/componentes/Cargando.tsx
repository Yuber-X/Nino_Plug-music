import { useEffect, useMemo, useState } from 'react';

import { temas } from '../datos/artista';
import { clipsAPrecargar } from '../secciones/FondoVideo';
import { usePrecarga } from '../ganchos/usePrecarga';
import { EtiquetaCursor } from './EtiquetaCursor';

/**
 * La pantalla de carga (rehecha el 2026-09-29 sobre las capturas del cliente).
 *
 * CÓMO FUNCIONA: arriba del cuadro hay una fila de puntos. Al avanzar la carga
 * los puntos se van estirando hasta volverse líneas, de izquierda a derecha.
 * Cuando la fila se completa, el cuadro gira 90° y la fila vuelve a empezar
 * sobre el lado que quedó arriba. Cuatro vueltas = 360° = carga terminada.
 *
 * Mientras tanto, junto al puntero se lee "loading..."; al terminar cambia a
 * "click para continuar". Ese click es además el gesto que el navegador exige
 * para dejar sonar el audio: por eso la música entra recién ahí, y entra
 * subiendo de a poco mientras la portada aparece.
 */

const PUNTOS = 26;
const VUELTAS = 4;

export function Cargando({ alEntrar }: { alEntrar: () => void }) {
  const [saliendo, setSaliendo] = useState(false);
  const [fuera, setFuera] = useState(false);

  const ultimo = temas[0];

  // Lo que el sitio necesita tener listo antes de mostrarse. Se arma una sola
  // vez: si la lista cambia de identidad en cada render, la precarga se
  // reinicia sola y la barra nunca llega.
  const recursos = useMemo(
    () => [
      ...clipsAPrecargar(),
      '/fuentes/Darkhusk.otf',
      ...temas.slice(0, 6).map((t) => t.arte),
      ultimo.adelanto,
    ],
    [ultimo.adelanto],
  );

  const real = usePrecarga(recursos);

  // ?carga=0.35 congela la barra en ese punto. Es para trabajar el diseño de
  // la pantalla: en una máquina con todo en caché la carga dura un parpadeo y
  // no hay forma de mirar los estados intermedios.
  const forzado =
    typeof window !== 'undefined'
      ? Number(new URLSearchParams(window.location.search).get('carga'))
      : Number.NaN;
  const hayForzado = Number.isFinite(forzado);
  const avance = hayForzado ? Math.min(1, Math.max(0, forzado)) : real.avance;
  const listo = hayForzado ? avance >= 1 : real.listo;

  // El avance total se reparte en cuatro vueltas alrededor del cuadro.
  const vuelta = Math.min(VUELTAS - 1, Math.floor(avance * VUELTAS));
  const dentroDeVuelta = Math.min(1, avance * VUELTAS - vuelta);
  // Al terminar completa la vuelta entera: el cuadro queda derecho para el
  // click, no torcido a 270°.
  const grados = listo ? VUELTAS * 90 : vuelta * 90;

  useEffect(() => {
    if (!listo) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') entrar();
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo]);

  if (fuera) return null;

  const entrar = () => {
    if (!listo || saliendo) return;
    setSaliendo(true);
    alEntrar();
    // Dura lo mismo que la animación de salida del CSS.
    window.setTimeout(() => setFuera(true), 1100);
  };

  return (
    <div
      className={`cargando${saliendo ? ' saliendo' : ''}${listo ? ' listo' : ''}`}
      onClick={entrar}
      role={listo ? 'button' : undefined}
      aria-label={listo ? 'Entrar al sitio' : undefined}
    >
      <div className="cargando-centro">
        <div className="cargando-cuadro" style={{ transform: `rotate(${grados}deg)` }}>
          {/* La fila de puntos que se vuelven líneas. Va sobre el borde de
              arriba del cuadro y gira con él. */}
          <div className="cargando-barra">
            {Array.from({ length: PUNTOS }, (_, i) => {
              const umbral = i / PUNTOS;
              const largo = Math.max(0, Math.min(1, (dentroDeVuelta - umbral) * PUNTOS));
              return (
                <span
                  key={i}
                  className="cargando-punto"
                  style={{ '--estirado': largo } as React.CSSProperties}
                />
              );
            })}
          </div>

          <div className="cargando-portada">
            <img src={ultimo.arte} alt="" />
            <div className="cargando-brillo" />
            <div className="cargando-meta">
              <span className="cargando-titulo">{ultimo.titulo}</span>
              <span className="cargando-artista">Skinny Xander · Money One 1</span>
            </div>
          </div>
        </div>

        <div className="cargando-cifra">{String(Math.round(avance * 100)).padStart(3, '0')}%</div>
      </div>

      <EtiquetaCursor texto={listo ? 'click para continuar' : 'loading...'} visible={!saliendo} />

      {/* El destello de la salida: barre la pantalla de blanco cuando el
          visitante entra. Vive acá y no en el hero porque arranca antes de que
          el hero exista. */}
      <div className="cargando-destello" />
    </div>
  );
}
