import { artista } from '../datos/artista';

export function Pie() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-name">
            SKINNY
            <br />
            XANDER
          </div>
          <div className="footer-links">
            <a href={artista.enlaces.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={artista.enlaces.youtube} target="_blank" rel="noreferrer">
              YouTube
            </a>
            <a href={artista.enlaces.appleMusic} target="_blank" rel="noreferrer">
              Apple Music
            </a>
            <a href={artista.enlaces.deezer} target="_blank" rel="noreferrer">
              Deezer
            </a>
            {/* Spotify va cuando el cliente pase el enlace de su perfil. */}
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {artista.nombre} · {artista.sello} — contenido en revisión
          </span>
          <span>{artista.origen}</span>
        </div>
      </div>
    </footer>
  );
}
