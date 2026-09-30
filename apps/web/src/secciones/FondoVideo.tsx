import { useEffect, useRef, useState } from 'react';

/**
 * Los clips del video oficial, en bucle, detrás de la portada.
 *
 * Son recortes de 8 segundos de "24/7" y "Tengo que ganar" (el canal del
 * propio artista), sin audio y a 24 fps: 1,8 MB los dos. El cliente los pidió
 * "como gif" — se hicieron en MP4 porque un gif del mismo trozo pesa veinte
 * veces más y se ve peor; para el visitante es idéntico, un video mudo que se
 * repite solo.
 *
 * Van alternándose: cada vuelta cambia de clip, así el fondo no se siente un
 * loop corto.
 */

const CLIPS = ['/clips/247.mp4', '/clips/tengo-que-ganar.mp4'] as const;

export function FondoVideo({ activo }: { activo: boolean }) {
  const [indice, setIndice] = useState(0);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el || !activo) return;
    // El navegador solo deja reproducir automáticamente si está en silencio.
    el.muted = true;
    void el.play().catch(() => {
      /* si no deja, queda el póster: el fondo es decorativo */
    });
  }, [activo, indice]);

  return (
    <div className="fondo-video" aria-hidden="true">
      <video
        ref={video}
        src={CLIPS[indice]}
        muted
        playsInline
        preload="auto"
        onEnded={() => setIndice((i) => (i + 1) % CLIPS.length)}
      />
      {/* Dos capas encima del video, y las dos hacen falta:
          la oscura mantiene legible el texto blanco, y la de vino es la que
          amarra el clip a la paleta del sitio en vez de dejar un video suelto. */}
      <div className="fondo-video-oscuro" />
      <div className="fondo-video-vino" />
    </div>
  );
}

/** Precarga los clips durante la pantalla de carga. */
export function clipsAPrecargar(): string[] {
  return [...CLIPS];
}
