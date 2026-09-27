Pantalla de entrada del sitio: fondo `surface-950` con un resplandor `wine-900→surface-950` descentrado hacia arriba-derecha (igual dirección que `assets/Backgrounds/atmosphere-wine.png`), un contador grande en `display` que sube de 0 a 100, una barra de progreso de 2px en `wine-400` sobre `line`, y el nombre del artista fijo abajo en `ash-500`.

**El consumidor provee:** el valor del contador (0–100, animado con `requestAnimationFrame` o una librería de scroll/loading), y el momento de salida (cuando el progreso llega a 100, la pantalla se desvanece o se desliza para revelar el Hero).

**Uso:**
- El signo de porcentaje siempre en `wine-400`, nunca del mismo tamaño que el número — es un acento, no el protagonista.
- La etiqueta superior (`CARGANDO EXPERIENCIA` o equivalente) usa el estilo `label` (mono, mayúsculas, `ash-300`).
- No poner el logo real aquí todavía: mientras no haya marca definitiva, el nombre en `display-md` cumple la misma función.
- El grano/scanline sutil (`assets/Textures/scanlines.png` o el patrón inline equivalente) debe quedarse muy discreto — es textura, no protagonismo.

**No hacer:** barras de carga con gradientes multicolor, spinners genéricos, o logos placeholder de terceros.
