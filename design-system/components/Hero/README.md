Sección de apertura a pantalla completa. El título en `display-xl`/`display-lg` se ancla abajo a la izquierda sobre un resplandor `wine-900` descentrado (misma dirección que `assets/Backgrounds/atmosphere-wine.png` — en el sitio real, esa imagen o una escena en Three.js reemplaza el gradiente CSS de este preview). Kicker en `mono`/`wine-400`, bajada en `body-lg`/`ash-300`, indicador de scroll abajo a la derecha.

**El consumidor provee:** el fondo real (escena 3D, video o `atmosphere-wine.png`), el texto del kicker (categoría o fecha), el título (nombre del artista o del lanzamiento) y la bajada (una frase, nunca un párrafo).

**Uso:**
- El título va siempre en `display`, mayúsculas, con el resplandor `shadow-glow-wine` detrás para separarlo del fondo cuando este es oscuro.
- El kicker es el único texto de tamaño pequeño en `wine-400` permitido, porque a 12px mono en mayúsculas con tracking funciona como etiqueta, no como párrafo — aun así, revisar legibilidad si el fondo cambia.
- El indicador de scroll usa `line-strong`, no `line`, porque es una señal funcional de interacción.

**No hacer:** texto largo superpuesto al fondo sin el resplandor o un velo que garantice contraste; más de una llamada a la acción en el hero.
