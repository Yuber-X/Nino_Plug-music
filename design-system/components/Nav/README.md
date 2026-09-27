Barra de navegación fija de 96px, transparente sobre el hero (se vuelve `surface-950` sólido con `line` inferior al hacer scroll). Marca a la izquierda en `mono`/`label`, links centrados también en `mono` mayúsculas, botón de acción (`Escuchar ahora`) en superficie `wine-700`.

**El consumidor provee:** el estado de scroll (para pasar de transparente a sólido), la ruta activa (para subrayar el link en `wine-400`), y el destino del CTA (Spotify/Apple Music/reproductor interno).

**Uso:**
- El link activo se marca con un borde inferior en `wine-400`, nunca cambiando el color del texto a `wine-400` (ese tono no cumple contraste de texto pequeño).
- El botón de acción es la única superficie `wine-700` fuera del reproductor — resérvalo para una sola llamada a la acción por vista.
- Radio siempre `radius-none`, incluido el botón.

**No hacer:** menú hamburguesa con más de 4 items en escritorio; iconografía de redes sociales duplicada en el nav si ya vive en el footer.
