Grilla de trabajos/videos filtrable, inspirada en la organización de portafolio por categorías (Todos/Videos/Sesiones/Portadas). Tarjetas de proporción 4:5, siempre `radius-none`, con el título del trabajo en `display-md` sobre la esquina inferior y una etiqueta de categoría en `mono` arriba.

**El consumidor provee:** la miniatura o loop de video real de cada tarjeta (reemplaza el `glow` de este preview), la categoría activa del filtro, y el destino al hacer clic (abre el video/detalle).

**Uso:**
- El filtro activo se marca igual que en `Nav`: borde inferior `wine-400`, texto `bone-100`; los inactivos en `ash-500` (válido aquí porque el texto de filtro es mono en mayúsculas ≥12px con peso 700, tratado como UI, no párrafo).
- El título sobre la miniatura necesita un velo o degradado detrás si la imagen real es clara — debe mantener `bone-100` a contraste legible, igual que en `Hero`.

**No hacer:** más de 4 categorías de filtro en el primer lanzamiento del sitio; bordes redondeados en las tarjetas.
