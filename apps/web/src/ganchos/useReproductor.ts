import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fondo, temas, type Tema } from '../datos/artista';

/**
 * La música del sitio: las cuatro canciones que eligió el cliente, en bucle y
 * SIN SILENCIO entre una y otra.
 *
 * DOS ELEMENTOS DE AUDIO, NO UNO. Con un solo <audio> no hay forma de cruzar
 * dos canciones: para que entre la siguiente hay que cambiarle la fuente a la
 * que está sonando, y eso la corta en seco. Acá hay dos y se turnan — mientras
 * una baja, la otra ya viene subiendo, que es exactamente lo que se pidió el
 * 2026-09-30: la página no queda muda en ningún momento salvo que el visitante
 * la pause. (Reemplaza la nota de "un solo <audio>" del CLAUDE.md: el riesgo de
 * dos canciones a la vez se evita porque los dos elementos viven en el mismo
 * gancho y solo uno es el activo.)
 *
 * El cruce dura CRUCE segundos y arranca cuando a la que suena le queda justo
 * eso. Cada lado usa una curva de raíz cuadrada (igual potencia): con una rampa
 * lineal, en la mitad del cruce las dos están al 50% y el oído percibe un
 * bajón de volumen.
 *
 * Tocar un tema de la discografía no rompe el bucle: suena ese, y al terminar
 * el cruce sigue por donde iba la lista de fondo.
 */

const CRUCE = 4;

/** mm:ss para los tiempos de la discografía. */
export function reloj(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return '0:00';
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export interface EstadoReproductor {
  temaActual: Tema;
  sonando: boolean;
  progreso: number;
  tiempo: number;
  duracion: number;
  alternar: () => void;
  /** Toca cualquier tema (discografía o lista de fondo) sin cortar el bucle. */
  elegirTema: (tema: Tema) => void;
  /** Arranca la música subiendo el volumen de a poco (entrada del sitio). */
  entrarSuave: (segundos?: number) => void;
  /** La lista que suena de fondo, para mostrarla en pantalla. */
  lista: Tema[];
}

export function useReproductor(): EstadoReproductor {
  const audios = useRef<HTMLAudioElement[]>([]);
  const activo = useRef(0);
  const cruzando = useRef(false);
  const volumen = useRef(1);
  /** Próxima posición de la lista de fondo. */
  const bucle = useRef(1);

  const [temaActual, setTemaActual] = useState<Tema>(fondo[0] ?? temas[0]);
  const [sonando, setSonando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [duracion, setDuracion] = useState(0);

  if (audios.current.length === 0 && typeof Audio !== 'undefined') {
    audios.current = [new Audio(), new Audio()];
    for (const a of audios.current) {
      a.preload = 'auto';
      a.volume = 0;
    }
  }

  /** Deja un elemento listo con un tema, en silencio. */
  const cargar = useCallback((cual: number, tema: Tema) => {
    const a = audios.current[cual];
    if (!a) return;
    a.src = tema.adelanto;
    a.currentTime = 0;
    a.volume = 0;
  }, []);

  /** Devuelve el siguiente de la lista de fondo y avanza el bucle. */
  const proximoDelBucle = useCallback((): Tema => {
    const tema = fondo[bucle.current % fondo.length];
    bucle.current = (bucle.current + 1) % fondo.length;
    return tema;
  }, []);

  // Primera carga.
  useEffect(() => {
    cargar(0, fondo[0]);
  }, [cargar]);

  // El motor del cruce: vigila cuánto le falta a la que suena.
  useEffect(() => {
    if (!sonando) return;

    let cuadro = 0;
    let entrante: Tema | null = null;

    const paso = () => {
      const a = audios.current[activo.current];
      const b = audios.current[1 - activo.current];

      if (a && Number.isFinite(a.duration) && a.duration > 0) {
        setTiempo(a.currentTime);
        setDuracion(a.duration);
        setProgreso(a.currentTime / a.duration);

        const falta = a.duration - a.currentTime;

        if (!cruzando.current && falta <= CRUCE) {
          // Empieza el relevo: la siguiente arranca ya, bajita.
          cruzando.current = true;
          entrante = proximoDelBucle();
          cargar(1 - activo.current, entrante);
          void b?.play().catch(() => undefined);
        }

        if (cruzando.current && b) {
          const t = Math.min(1, Math.max(0, (CRUCE - falta) / CRUCE));
          a.volume = Math.sqrt(1 - t) * volumen.current;
          b.volume = Math.sqrt(t) * volumen.current;

          if (t >= 1 || a.ended) {
            a.pause();
            activo.current = 1 - activo.current;
            cruzando.current = false;
            b.volume = volumen.current;
            if (entrante) setTemaActual(entrante);
            entrante = null;
          }
        }
      }

      cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [sonando, cargar, proximoDelBucle]);

  // Play / pausa sobre el activo (y sobre el que entra, si hay cruce en curso).
  useEffect(() => {
    const a = audios.current[activo.current];
    const b = audios.current[1 - activo.current];
    if (!a) return;

    if (sonando) {
      void a.play().catch(() => setSonando(false));
      if (cruzando.current) void b?.play().catch(() => undefined);
    } else {
      a.pause();
      b?.pause();
    }
  }, [sonando]);

  const alternar = useCallback(() => setSonando((s) => !s), []);

  const entrarSuave = useCallback((segundos = 3) => {
    const a = audios.current[activo.current];
    if (!a) return;

    a.volume = 0;
    volumen.current = 1;
    setSonando(true);

    // Sube de a poco mientras aparece la portada: un golpe de audio al pasar
    // la puerta hace que la gente cierre la pestaña.
    const inicio = performance.now();
    const subir = () => {
      const t = Math.min(1, (performance.now() - inicio) / (segundos * 1000));
      if (!cruzando.current) a.volume = t * t;
      if (t < 1) requestAnimationFrame(subir);
    };
    requestAnimationFrame(subir);
  }, []);

  const elegirTema = useCallback(
    (tema: Tema) => {
      if (tema.id === temaActual.id) {
        setSonando((s) => !s);
        return;
      }

      // Corte a mano: se descarta el cruce en curso y el tema entra entero.
      audios.current[1 - activo.current]?.pause();
      cruzando.current = false;

      const enElFondo = fondo.findIndex((t) => t.id === tema.id);
      if (enElFondo >= 0) bucle.current = (enElFondo + 1) % fondo.length;

      cargar(activo.current, tema);
      const a = audios.current[activo.current];
      if (a) {
        a.volume = volumen.current;
        // Hay que pedir play() a mano: cambiarle el src a un elemento que está
        // sonando lo deja pausado, y si ya estábamos en marcha el efecto de
        // play/pausa no se vuelve a ejecutar (sonando no cambió).
        void a.play().catch(() => setSonando(false));
      }
      setTemaActual(tema);
      setProgreso(0);
      setTiempo(0);
      setSonando(true);
    },
    [temaActual.id, cargar],
  );

  return useMemo(
    () => ({
      temaActual,
      sonando,
      progreso,
      tiempo,
      duracion,
      alternar,
      elegirTema,
      entrarSuave,
      lista: fondo,
    }),
    [temaActual, sonando, progreso, tiempo, duracion, alternar, elegirTema, entrarSuave],
  );
}
