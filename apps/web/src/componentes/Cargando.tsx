import { useEffect, useMemo, useState } from 'react';

import { fondo, temas } from '../datos/artista';
import { clipsAPrecargar } from '../secciones/FondoVideo';
import { usePrecarga } from '../ganchos/usePrecarga';
import { EtiquetaCursor } from './EtiquetaCursor';

/**
 * La pantalla de carga (rehecha el 2026-09-30 sobre las capturas del cliente).
 *
 * CÓMO FUNCIONA: la carga DIBUJA UN CUADRADO alrededor del vinilo. Cada lado
 * es un 25%: se traza una línea blanca de izquierda a derecha, y al llegar al
 * 25% el cuadro gira 90° para que el lado siguiente quede arriba — pero la
 * línea ya trazada NO se borra, queda puesta y gira con el cuadro. Al 100% los
 * cuatro lados están hechos y el conjunto se lee como la cubierta del disco.
 *
 * Por eso los lados se dibujan en el orden top → left → bottom → right: con el
 * giro en sentido del reloj, el lado que queda arriba en cada vuelta es el
 * anterior en sentido contrario. Y cada uno crece hacia el lado que, ya girado,
 * se ve como "de izquierda a derecha" en pantalla.
 *
 * Mientras tanto, junto al puntero se lee "loading..."; al terminar cambia a
 * "click para continuar". Ese click es además el gesto que el navegador exige
 * para dejar sonar el audio: por eso la música entra recién ahí, y entra
 * subiendo de a poco.
 */

const LADOS = 4;

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
      '/fuentes/UnifrakturCook-Bold.ttf',
      '/marca/money-one-1.jpg',
      ...temas.slice(0, 6).map((t) => t.arte),
      fondo[0].adelanto,
    ],
    [],
  );

  const real = usePrecarga(recursos);

  // ?carga=0.35 congela la barra en ese punto. Es para trabajar el diseño de
  // la pantalla: en una máquina con todo en caché la carga dura un parpadeo y
  // no hay forma de mirar los estados intermedios.
  // OJO con el null: get() devuelve null cuando el parámetro NO está, y
  // Number(null) es 0 —un número perfectamente finito—. Con la comprobación
  // hecha sobre Number.isFinite a secas, TODA visita quedaba con la barra
  // congelada en 000% (reportado 2026-09-30). Primero se mira si el parámetro
  // existe.
  const parametro =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('carga')
      : null;
  const forzado = parametro === null ? Number.NaN : Number(parametro);
  const hayForzado = Number.isFinite(forzado);
  const avance = hayForzado ? Math.min(1, Math.max(0, forzado)) : real.avance;
  const listo = hayForzado ? avance >= 1 : real.listo;

  // Qué lado se está trazando y cuánto le falta.
  const lado = Math.min(LADOS - 1, Math.floor(avance * LADOS));
  const dentroDeLado = Math.min(1, avance * LADOS - lado);
  // Al terminar completa el giro entero: el cuadro queda derecho para el
  // click, no torcido a 270°.
  const grados = listo ? LADOS * 90 : lado * 90;

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
          {/* La funda: al completarse el cuadrado aparece la portada detrás del
              vinilo y el conjunto se ve como el disco en su cubierta. */}
          <div className="cargando-funda">
            <img src={ultimo.arte} alt="" />
          </div>

          {/* Los cuatro lados del cuadrado. El que está en curso crece; los ya
              hechos se quedan enteros (pedido del cliente: "que mantenga su
              línea blanca siempre"). */}
          {[0, 1, 2, 3].map((i) => {
            const llenado = listo ? 1 : i < lado ? 1 : i === lado ? dentroDeLado : 0;
            return (
              <div key={i} className={`cargando-lado lado-${i + 1}`}>
                <i style={{ '--llenado': llenado } as React.CSSProperties} />
              </div>
            );
          })}

          {/* Un disco, no la portada cuadrada: al girar 90° una foto se ve
              "torcida" y el ojo pide volver a enderezarla, mientras que un
              vinilo girando es lo que uno espera (pedido del cliente,
              2026-09-30). En el centro va el logo del sello. */}
          <div className="cargando-vinilo">
            <div className="cargando-surcos" />
            <div className="cargando-reflejo" />
            <div className="cargando-etiqueta">
              <img src="/marca/money-one-1.jpg" alt="" />
              <div className="cargando-agujero" />
            </div>
          </div>
        </div>

        {/* El nombre del disco va FUERA del cuadro que gira: adentro se daba
            vuelta con él y a mitad de carga se leía al revés (2026-09-30). */}
        <div className="cargando-meta">
          <span className="cargando-titulo">{ultimo.titulo}</span>
          <span className="cargando-artista">Skinny Xander · Money One 1</span>
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
