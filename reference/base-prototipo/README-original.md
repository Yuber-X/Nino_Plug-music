# Nino Plug — portafolio musical

Este paquete trae todo lo diseñado hasta ahora para el sitio del artista, listo para abrir con Claude Code y construir la versión real (Three.js + música).

## Qué hay aquí

- **`site/index.html`** — el prototipo funcional del one-page: intro con disco/álbum clicables, título "ASCENSIÓN" en 3D metálico (gira al entrar y se queda fijo, reactivo al mouse), hero, sección de música con reproductor, grid de videos, bio y footer. Es HTML/CSS/JS puro en un solo archivo — ábrelo directo en cualquier navegador para verlo funcionar. En Claude Code, este archivo es la referencia de comportamiento e interacciones a migrar (o mantener como base) cuando se agregue Three.js y la música real.
- **`design-system/`** — el sistema de diseño base:
  - `tokens.json` — paleta de color, tipografía, espaciado y radios en formato de tokens (fuente de verdad para no perder consistencia al construir).
  - `design-system.json` — índice del sistema.
  - `README.md` — fundamentos de contenido, color, tipografía y accesibilidad (por qué se usa cada tono de vino, cuándo sí/no usar cada gris, etc).
  - `components/` — specs y previews de Loader, Nav, Hero, TrackList, WorksGrid, Button.
  - `assets/` — wordmark y monograma provisionales (tipografía de sistema, no marca final del cliente) y texturas generadas por código (grano, estática, líneas de escaneo, resplandor) usadas como placeholder mientras no haya fotografía/video real del artista.

## Notas importantes para la siguiente fase

- El audio que se escucha al entrar es un sonido sintetizado de placeholder (osciladores + Web Audio API), no la canción real — hay que reemplazarlo por la pista definitiva.
- El wordmark/monograma en `design-system/assets/Marks` son provisionales (tipografía de sistema), no un logo entregado por el cliente.
- Las imágenes de `design-system/assets/Textures` y `Backgrounds` son generadas por código (no hay fotografía de stock ni del artista todavía); se pensaron como overlays, no como reemplazo de fotos/video reales cuando estén disponibles.
- El sitio es un solo tema oscuro a propósito (negros/grises + rojo vino oscuro) — no se diseñó versión clara.
