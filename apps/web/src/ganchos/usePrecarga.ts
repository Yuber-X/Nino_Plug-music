import { useEffect, useRef, useState } from 'react';

/**
 * Carga de verdad lo que el sitio necesita y devuelve el avance.
 *
 * La barra no es decorativa: mide descargas reales (portadas, clips del fondo,
 * tipografía 3D, primer adelanto de audio). Una barra falsa que corre siempre
 * lo mismo termina mintiendo en las dos direcciones — en fibra hace esperar de
 * gusto, y en los datos del teléfono de la clínica llega al 100% con el sitio
 * a medio bajar.
 *
 * Igual hay un PISO de tiempo: si todo viene de caché, el avance salta a 100
 * en 80 ms, la animación no se ve y el efecto de entrada se pierde. El piso lo
 * fija quien llama.
 */
export interface Precarga {
  /** 0 a 1. */
  avance: number;
  listo: boolean;
}

export function usePrecarga(recursos: string[], msMinimo = 2600): Precarga {
  const [avance, setAvance] = useState(0);
  const [listo, setListo] = useState(false);
  const arranque = useRef(performance.now());

  useEffect(() => {
    let vivo = true;
    let hechos = 0;
    const total = Math.max(1, recursos.length);

    const paso = () => {
      hechos++;
      if (!vivo) return;
      setAvance((a) => Math.max(a, Math.min(0.98, hechos / total)));
    };

    const uno = (url: string) =>
      new Promise<void>((resolver) => {
        if (/\.(png|jpe?g|webp|avif)$/i.test(url)) {
          const img = new Image();
          img.onload = img.onerror = () => resolver();
          img.src = url;
          return;
        }
        // Videos, fuentes y audio: alcanza con traerlos a la caché del
        // navegador. No se decodifican acá; el <video> los encuentra listos.
        fetch(url, { cache: 'force-cache' })
          .then(() => resolver())
          .catch(() => resolver());
      }).then(paso);

    Promise.all(recursos.map(uno)).then(() => {
      if (!vivo) return;
      const falta = Math.max(0, msMinimo - (performance.now() - arranque.current));
      window.setTimeout(() => {
        if (!vivo) return;
        setAvance(1);
        setListo(true);
      }, falta);
    });

    // Avance lento de relleno: si un recurso tarda, la barra sigue moviéndose
    // en vez de quedarse congelada haciendo creer que se colgó.
    const late = window.setInterval(() => {
      if (!vivo) return;
      const transcurrido = (performance.now() - arranque.current) / msMinimo;
      setAvance((a) => (a >= 0.98 ? a : Math.max(a, Math.min(0.95, transcurrido * 0.9))));
    }, 80);

    return () => {
      vivo = false;
      window.clearInterval(late);
    };
  }, [recursos, msMinimo]);

  return { avance, listo };
}
