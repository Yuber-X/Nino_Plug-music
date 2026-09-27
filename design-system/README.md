## Origen

Este sistema se construyó desde cero: el repositorio `nino_plug` está vacío, así que no hay código, marca ni activos previos que migrar. Todo lo de aquí es la primera propuesta visual para un one-page/portafolio de un artista de dembow/trap dominicano, pensado para mostrarse al cliente antes de construir el sitio real (Three.js + animación) con Claude Code. No hay logo entregado por el cliente: el wordmark y el monograma de `assets/Marks` están hechos en tipografía simple como marcador de posición, no como marca final. Las texturas de `assets/Textures` y `assets/Backgrounds` son generadas por código (ruido de grano, resplandor, líneas de escaneo) en vez de fotografía de stock, para que el resultado se sienta propio del sitio y no genérico.

## Fundamentos de contenido

- **Tono:** directo, oscuro, sin adornos. Frases cortas en mayúsculas para etiquetas y llamados a la acción; el cuerpo de texto (biografía, créditos) puede ser más narrativo pero nunca florido.
- **Mayúsculas con intención:** los titulares (`display-xl`, `display-lg`, `display-md`) y las etiquetas mono (`label`) van siempre en mayúsculas. El cuerpo (`body`, `body-lg`, `body-sm`) va en oración normal.
- **Sin relleno:** cada sección del one-page dice una sola cosa (portada, lanzamiento, biografía, contacto). Nada de texto genérico de agencia ("soluciones creativas", "llevamos tu marca al siguiente nivel").
- **Un solo tema oscuro.** Este sistema no tiene versión clara: la identidad completa del cliente vive en negro/gris/vino oscuro. No introducir un tema claro sin que el cliente lo pida explícitamente.

## Fundamentos visuales

### Color

La paleta son tres familias: `surface` (negros cálidos, nunca `#000` puro), `ash`/`bone` (grises y hueso para texto) y `wine` (el acento rojo vino oscuro que pidió el cliente). Fondo por defecto: `surface-950`. Texto por defecto: `bone-100`. El acento `wine-700`/`wine-500` es para superficies (botones, franjas, tags); `wine-400` es solo para texto grande, íconos o enlaces vivos — nunca para párrafos pequeños, porque su contraste (3.8:1 sobre `surface-950`) no alcanza el mínimo de texto de cuerpo. `wine-900` es exclusivamente para sombras y bases de degradado, nunca fondo de texto.

`line` es un divisor decorativo (no necesita pasar contraste); `line-strong` es el único borde que se puede usar cuando el borde en sí debe ser perceptible (inputs enfocados, contornos de controles) porque alcanza 3.1:1 sobre `surface-950`.

### Tipografía

Tres familias, cada una con un trabajo distinto — no mezclar sus roles:

- **`display`** (Anton): titulares únicamente. Siempre en mayúsculas, siempre ajustado (`letter-spacing` negativo en `display-xl`). Es la tipografía de impacto — el nombre del artista, el título de un lanzamiento.
- **`body`** (IBM Plex Sans): todo el texto de lectura — biografía, créditos, descripciones. Nunca en mayúsculas sostenidas.
- **`mono`** (IBM Plex Mono): metadatos técnicos — el contador del loader, los tiempos del reproductor (`00:42 / 03:15`), etiquetas de estado (`REPRODUCIENDO AHORA`), números de pista. El monoespaciado es lo que le da al sitio esa sensación de HUD/interfaz técnica que se ve en los sitios de referencia.

### Espaciado y radios

Escala de `space-1` (4px) a `space-32` (128px), pensada para un one-page largo con secciones muy separadas (`space-24`/`space-32` entre bloques grandes, `space-4` dentro de tarjetas). El radio por defecto es `radius-none`: el sitio es de filo recto, sin esquinas suaves — esa es la firma visual del sistema. `radius-sm` (2px) es la única concesión, para inputs y chips pequeños. `radius-full` está reservado exclusivamente para controles circulares (play/pausa).

### Imagería y textura

Sin fotografía de stock genérica. La dirección visual se apoya en tres texturas generadas (`assets/Textures/grain.png`, `assets/Textures/scanlines.png`, `assets/Textures/static.png`) superpuestas a baja opacidad sobre secciones oscuras para dar grano de película, y un fondo atmosférico (`assets/Backgrounds/atmosphere-wine.png`) con un resplandor vino descentrado, pensado como base del hero o del loader. Cuando el proyecto tenga fotos reales del artista (sesiones, portadas, video), deben reemplazar estas texturas como fondo — el grano y las líneas de escaneo se mantienen como overlay encima de las fotos reales, no en su lugar.

### Sombra

`shadow-glow-wine` es el resplandor rojo detrás de titulares o el arte de un sencillo. `shadow-panel` es la elevación estándar para paneles flotantes (el reproductor fijo, el menú).

## Iconografía

No hay set de íconos entregado por el cliente. Usar trazos simples de 1.5–2px en `bone-100` o `ash-500` (nunca `wine-400` como color base de un ícono decorativo — resérvalo para íconos de estado activo). Íconos necesarios para el primer sitio: play/pausa, volumen, redes sociales (Instagram, YouTube, Spotify/Apple Music), flecha de scroll. Si el cliente usa un set de íconos de marca, reemplazar esta guía.

## Accesibilidad

Todos los pares texto/fondo del sistema fueron verificados en el único tema (`dark`):

| Texto | Fondo | Contraste |
|---|---|---|
| `bone-100` | `surface-950` | 17.4:1 |
| `bone-100` | `surface-900` | 16.6:1 |
| `bone-100` | `surface-800` | 15.3:1 |
| `bone-100` | `wine-700` | 11.8:1 |
| `bone-100` | `wine-500` | 8.4:1 |
| `bone-100` | `wine-900` | 15.8:1 |
| `ash-300` | `surface-950` | 7.7:1 |
| `ash-300` | `surface-800` | 6.7:1 |
| `ash-300` | `wine-900` | 6.9:1 |
| `ash-500` | `surface-950` | 4.3:1 (solo texto ≥19px bold o ≥24px, o íconos) |
| `wine-400` | `surface-950` | 3.8:1 (solo texto grande/UI, no párrafo) |
| `line-strong` | `surface-950` | 3.1:1 (borde funcional) |

`ash-500` y `wine-400` no cumplen 4.5:1: están documentados en `tokens.json` para usarse solo donde el criterio de texto grande (3:1) aplica. No usarlos en cuerpo de texto pequeño.

## Reglas de uso rápidas

- Fondo de página: `surface-950`. Nunca `#000000` puro.
- Texto de cuerpo: `bone-100` sobre cualquier `surface-*`; `ash-300` para metadatos/secundario.
- Acento de marca en superficies (botón, franja, tag activo): `wine-700`, hover `wine-500`.
- Acento de marca en texto/ícono vivo (nunca párrafo): `wine-400`.
- Titulares: `display` family, mayúsculas, tracking negativo en tamaños grandes.
- Metadatos técnicos (tiempo, contador, número de pista): `mono` family, siempre mayúsculas en las etiquetas.
- Radio por defecto: `radius-none`. Excepción: `radius-full` solo en controles circulares.
- Overlay de grano (`grain.png`/`static.png`) a opacidad baja (8–16%) sobre secciones oscuras; nunca sobre texto pequeño sin verificar que se mantenga legible.
