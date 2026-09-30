import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { temas, type Tema } from '../datos/artista';

/**
 * El reproductor del sitio. Un solo <audio> para toda la página: el mini
 * reproductor de abajo y la lista de temas son dos vistas del MISMO estado.
 *
 * Dos elementos de audio separados —uno por sección— fue el primer intento y
 * termina siempre igual: dos canciones sonando a la vez en cuanto alguien toca
 * play en la lista mientras el mini reproductor sigue andando.
 */
export interface EstadoReproductor {
  temaActual: Tema;
  indice: number;
  sonando: boolean;
  progreso: number;   // 0..1
  tiempo: number;     // segundos
  duracion: number;   // segundos
  alternar: () => void;
  elegir: (indice: number) => void;
  siguiente: () => void;
  /** Arranca el tema subiendo el volumen de a poco (entrada del sitio). */
  entrarSuave: (segundos?: number) => void;
}

export function useReproductor(): EstadoReproductor {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [indice, setIndice] = useState(0);
  const [sonando, setSonando] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [duracion, setDuracion] = useState(0);

  if (audio.current === null && typeof Audio !== 'undefined') {
    audio.current = new Audio();
    audio.current.preload = 'none';
  }

  const temaActual = temas[indice];

  useEffect(() => {
    const el = audio.current;
    if (!el) return;

    el.src = temaActual.adelanto;
    setTiempo(0);
    setDuracion(0);

    const alActualizar = () => setTiempo(el.currentTime);
    const alCargar = () => setDuracion(el.duration || 0);
    const alTerminar = () => setSonando(false);

    el.addEventListener('timeupdate', alActualizar);
    el.addEventListener('loadedmetadata', alCargar);
    el.addEventListener('ended', alTerminar);
    return () => {
      el.removeEventListener('timeupdate', alActualizar);
      el.removeEventListener('loadedmetadata', alCargar);
      el.removeEventListener('ended', alTerminar);
    };
  }, [temaActual.adelanto]);

  useEffect(() => {
    const el = audio.current;
    if (!el) return;

    if (sonando) {
      // El navegador puede negar el play si no hubo gesto del usuario. No es
      // un error del sitio: se vuelve al estado pausado y ya.
      void el.play().catch(() => setSonando(false));
    } else {
      el.pause();
    }
  }, [sonando, indice]);

  const alternar = useCallback(() => setSonando((s) => !s), []);

  /**
   * Entrada gradual: la música no arranca de golpe a todo volumen cuando el
   * visitante entra, sube en los primeros segundos mientras aparece la
   * portada. Un golpe de audio al pasar la puerta hace que la gente cierre la
   * pestaña antes de ver nada.
   */
  const entrarSuave = useCallback((segundos = 3) => {
    const el = audio.current;
    if (!el) return;

    el.volume = 0;
    setSonando(true);

    const inicio = performance.now();
    const subir = () => {
      const t = Math.min(1, (performance.now() - inicio) / (segundos * 1000));
      el.volume = t * t;   // curva suave: al oído, lineal sube demasiado rápido
      if (t < 1) requestAnimationFrame(subir);
    };
    requestAnimationFrame(subir);
  }, []);

  const elegir = useCallback((nuevo: number) => {
    setIndice((actual) => {
      if (actual === nuevo) {
        setSonando((s) => !s);
        return actual;
      }
      setSonando(true);
      return nuevo;
    });
  }, []);

  const siguiente = useCallback(() => {
    setIndice((actual) => (actual + 1) % temas.length);
    setSonando(true);
  }, []);

  return useMemo(
    () => ({
      temaActual,
      indice,
      sonando,
      progreso: duracion > 0 ? tiempo / duracion : 0,
      tiempo,
      duracion,
      alternar,
      elegir,
      siguiente,
      entrarSuave,
    }),
    [temaActual, indice, sonando, tiempo, duracion, alternar, elegir, siguiente, entrarSuave],
  );
}

/** 92 → "01:32". El reproductor muestra minutos, no segundos sueltos. */
export function reloj(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return '00:00';
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
