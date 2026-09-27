Texturas generadas por código (sin fotografía de stock) para dar grano y sensación de transmisión/VHS al sitio, coherente con el estilo de las páginas de referencia.

- `grain.png` — ruido monocromo tileable de 256×256, alfa 0–40 (muy sutil). Superponer a `mix-blend-mode: overlay` u `opacity: 8–16%` sobre secciones oscuras.
- `static.png` — estática de mayor contraste (512×512, blanco a alfa variable). Pensada para momentos puntuales: la transición del loader al hero, un hover de video.
- `scanlines.png` — tile de 100×6 con líneas horizontales al 10% de opacidad. Repetir verticalmente para el efecto de líneas de escaneo detrás del contador del loader.

Ninguna de estas reemplaza fotografía real del artista: cuando existan fotos o video, estas texturas pasan a ser overlay encima de ese material, no el fondo principal.
