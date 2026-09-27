import { useState } from 'react';

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
              <div className="vinyl-label">NP</div>
            </div>
            <div className="album" aria-hidden="true">
              <div className="album-art">
                <div className="glow" />
                <div className="door" />
                <div className="figure" />
                <div className="steps" />
              </div>
              <div className="album-meta">
                <span className="album-title">ASCENSIÓN</span>
                <span className="album-artist">Skinny Xander</span>
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
