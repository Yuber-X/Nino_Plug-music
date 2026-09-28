import { useState } from 'react';
import { temas } from '../datos/artista';

/**
 * La puerta de entrada: disco + portada, y el sitio no arranca hasta que el
 * visitante hace click.
 *
 * No es decoración. El sitio entra con música, y los navegadores no dejan
 * sonar nada sin un gesto del usuario: este click ES ese gesto. Es el mismo
 * recurso de ascension.pegassi.be, la referencia que eligió el cliente.
 */
export function Intro({ alEntrar }: { alEntrar: () => void }) {
  const [saliendo, setSaliendo] = useState(false);
  const [fuera, setFuera] = useState(false);

  // La portada de la puerta es el último lanzamiento, no un título fijo: el
  // sitio se mantiene solo cuando el artista publica.
  const ultimo = temas[0];

  if (fuera) return null;

  const entrar = () => {
    if (saliendo) return;
    setSaliendo(true);
    alEntrar();
    // El desvanecido dura lo mismo que la transición del CSS del prototipo.
    window.setTimeout(() => setFuera(true), 900);
  };

  return (
    <div id="intro" className={saliendo ? 'hidden' : undefined}>
      <div className="intro-row">
        <div className="stage-hover">
          <button className="record-stage" onClick={entrar} aria-label="Entrar al sitio y reproducir">
            <div className="vinyl" aria-hidden="true">
              <div className="vinyl-label">SX</div>
            </div>
            <div className="album" aria-hidden="true">
              {/* La portada REAL del último lanzamiento. El prototipo dibujaba
                  una puerta con divs porque no había material; ya lo hay. */}
              <div className="album-art">
                <img src={ultimo.arte} alt="" />
                <div className="glow" />
              </div>
              <div className="album-meta">
                <span className="album-title">{ultimo.titulo}</span>
                <span className="album-artist">Skinny Xander · Money One 1</span>
              </div>
            </div>
          </button>
        </div>
        <div className="intro-hint">
          Click para
          <br />
          entrar
        </div>
      </div>
    </div>
  );
}
