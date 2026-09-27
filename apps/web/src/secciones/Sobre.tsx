import { artista, temas } from '../datos/artista';

/**
 * Biografía y números.
 *
 * Los números salen del catálogo real, no están tipeados: si mañana el artista
 * saca cinco sencillos más, la sección se actualiza sola al regenerar los
 * datos. El TEXTO de la biografía sí es un borrador — lo tiene que escribir el
 * cliente o el artista, y está marcado como tal.
 */
export function Sobre() {
  const anioActual = new Date().getFullYear();
  const deEsteAnio = temas.filter((t) => t.lanzamiento.startsWith(String(anioActual))).length;
  const generos = new Set(temas.map((t) => t.genero)).size;
  const anios = anioActual - artista.desde;

  return (
    <section id="sobre">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">Biografía</div>
            <h2 className="section-title">Sobre {artista.nombre}</h2>
          </div>
        </div>

        <div className="bio-grid reveal">
          <div className="bio-text">
            <p>
              <strong>{artista.nombre}</strong> hace trap, rap y dembow desde {artista.origen}.
              Publica sin parar desde {artista.desde}: sencillos, freestyles y versiones alternas
              que se mueven entre el rap oscuro y el urbano de pista.
            </p>
            <p className="borrador">
              Borrador para probar la maqueta — la biografía definitiva la escribe el artista.
            </p>
          </div>
          <div>
            <div className="stat-row">
              <div className="stat">
                <b>{String(deEsteAnio).padStart(2, '0')}</b>
                <span>Sencillos {anioActual}</span>
              </div>
              <div className="stat">
                <b>{String(anios).padStart(2, '0')}</b>
                <span>Años publicando</span>
              </div>
              <div className="stat">
                <b>{String(generos).padStart(2, '0')}</b>
                <span>Géneros</span>
              </div>
            </div>
            <ul className="press-list">
              <li>
                <b>Prensa</b>
                <span>Pendiente: reseñas y menciones que entregue el cliente</span>
              </li>
              <li>
                <b>Booking</b>
                <span>Pendiente: contacto de contrataciones</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
