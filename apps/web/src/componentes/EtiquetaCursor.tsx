import { useEffect, useRef } from 'react';

/**
 * El texto que acompaña al puntero: "loading..." mientras carga y "click para
 * continuar" cuando termina (pedido del cliente, 2026-09-29).
 *
 * Se mueve con transform en cada cuadro, no cambiando left/top: mover un
 * elemento por posición obliga al navegador a recalcular el diseño de la
 * página en cada movimiento del mouse, y eso se nota justo cuando hay un canvas
 * 3D compitiendo por el mismo hilo.
 */
export function EtiquetaCursor({ texto, visible }: { texto: string; visible: boolean }) {
  const etiqueta = useRef<HTMLDivElement>(null);
  const destino = useRef({ x: 0, y: 0 });
  const actual = useRef({ x: 0, y: 0 });
  const primera = useRef(true);

  useEffect(() => {
    const mover = (e: PointerEvent) => {
      destino.current = { x: e.clientX, y: e.clientY };
      if (primera.current) {
        actual.current = { ...destino.current };
        primera.current = false;
      }
    };
    window.addEventListener('pointermove', mover);

    let cuadro = 0;
    const animar = () => {
      const el = etiqueta.current;
      if (el) {
        // Sigue al puntero con un retardo corto: pegado al cursor se siente
        // un tooltip; muy lento, se siente roto.
        actual.current.x += (destino.current.x - actual.current.x) * 0.18;
        actual.current.y += (destino.current.y - actual.current.y) * 0.18;
        el.style.transform = `translate3d(${actual.current.x + 18}px, ${actual.current.y + 18}px, 0)`;
      }
      cuadro = requestAnimationFrame(animar);
    };
    cuadro = requestAnimationFrame(animar);

    return () => {
      window.removeEventListener('pointermove', mover);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    <div
      ref={etiqueta}
      className={visible ? 'etiqueta-cursor visible' : 'etiqueta-cursor'}
      aria-hidden="true"
    >
      {texto}
    </div>
  );
}
