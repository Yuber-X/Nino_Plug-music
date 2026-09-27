# CLAUDE.md — Niño Plug / Skinny Xander

> Guía del proyecto para Claude Code. Portafolio musical de un artista urbano
> dominicano. Se complementa con el `CLAUDE.md` global del workspace freelance.

---

## 1. Qué es esto

Sitio web (one-page + secciones) que funciona como **portafolio musical de
Skinny Xander**. El cliente quiere animación 3D fuerte: el referente que eligió
es <https://ascension.pegassi.be/> — negro, grano, tipografía gigante cromada
que reacciona al mouse, puerta de entrada con click, reproductor fijo abajo.

Otras referencias: <https://arstraumur.music/> y <https://www.forms.world/works/>.

**Orden de trabajo acordado con Yuber (2026-09-25):** primero la base tal cual
está diseñada, y recién después la mejora total de la portada. El main actual
*no* es el resultado final y se sabe.

### 🟡 Pendiente de definir: qué nombre manda

Hay tres nombres en el material y no está resuelto cuál es la marca del sitio:

- **Skinny Xander** — el artista (así aparece en Apple Music, YouTube, Instagram).
- **Niño Plug** — el nombre del repositorio y el que usa el prototipo base como
  wordmark.
- **Money One 1 / Overtbitch** — lo que dice el logo que entregó el cliente.

Hasta que Yuber lo aclare, el sitio muestra "NINO·PLUG" como marca (lo que traía
la base) y "Skinny Xander" como artista. **No inventar una jerarquía nueva sin
preguntar.**

---

## 2. Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Build / dev | **Vite 8** | Pedido explícito de Yuber: ver los cambios en vivo |
| UI | **React 19 + TypeScript** | |
| 3D | **three.js + @react-three/fiber + drei** | Ya instalado; entra en la fase de mejora de la portada |
| Scroll | **lenis** | Scroll suave, apagado si el visitante pidió menos movimiento |
| API | **NestJS** (`apps/api`) | Para lo que necesite servidor: suscripción al newsletter, contacto, booking |

Monorepo con workspaces de npm: `apps/web` y `apps/api`.

```powershell
npm install          # una vez, en la raíz
npm run dev          # web en http://localhost:5173
npm run dev:api      # API de Nest
```

`http://localhost:5173/?entrar` salta la puerta de entrada — es para trabajar,
no una función del sitio.

⚠ **Node 20.19+ o 22.12+.** La máquina tiene 20.15 y Vite avisa en cada arranque;
anda igual, pero conviene actualizar.

---

## 3. Sistema de diseño

`design-system/` es la fuente de verdad: colores, tipografías, espaciado, radios
y sombras viven en `tokens.json`, con el porqué de cada uno en su `README.md`.

- `apps/web/src/estilos/tokens.css` **se genera**: `python scripts/generar-tokens.py`.
  No editarlo a mano — se pisa.
- `apps/web/src/estilos/global.css` es la maqueta portada del prototipo base.

Lo esencial, para no tener que abrirlo cada vez:

- Fondo `--surface-950` (nunca `#000` puro). Texto `--bone-100`.
- Acento vino: `--wine-700` en superficies, `--wine-400` **solo** en texto grande
  o íconos (3.8:1 — no alcanza para párrafos).
- Titulares en **Anton**, mayúsculas. Cuerpo **IBM Plex Sans**. Metadatos
  (tiempos, contadores, etiquetas) en **IBM Plex Mono**.
- Filo recto: `radius-none` por defecto. Redondeo solo en controles circulares.
- Un solo tema oscuro. No hay versión clara y no se agrega sin pedido explícito.

---

## 4. Los datos del artista

`apps/web/src/datos/artista.ts` **se genera** del catálogo público de Apple
Music (artista `1357803085`, confirmado contra los videos que entregó el
cliente: *Krippy*, *24/7*, el EP *Antídoto*).

⚠ **Es material de arranque, no definitivo:**

- Los audios son los **adelantos de 30 segundos** de Apple. Sirven para construir
  y probar el reproductor; **no se publica el sitio con eso**. Cuando el cliente
  entregue las pistas, se reemplazan.
- Las portadas salen del mismo catálogo.
- Las versiones *Slowed + Reverb*, *Speed Up* y *Acustic* quedan fuera a
  propósito: en la web son ruido.
- La biografía es un borrador y está marcado como tal en la pantalla. La escribe
  el artista.

Enlaces verificados: Instagram `@skinny.xander`, canal de YouTube
`UC6oo-8F1Y5wkpSe3wzPzNOg`, Apple Music y Deezer (`14284887`). **Falta el enlace
de Spotify** — el cliente lo tiene que pasar.

---

## 5. Convenciones de código

- **Todo en español**: nombres de componentes, carpetas, variables, comentarios.
  `secciones/`, `componentes/`, `ganchos/`, `datos/`, `estilos/`.
- Los comentarios explican **por qué**, no qué. Si una decisión fue por un
  defecto real (audio bloqueado por el navegador, scroll que marea), eso va
  escrito.
- Un solo `<audio>` para todo el sitio (`ganchos/useReproductor.ts`). La lista y
  el mini reproductor son dos vistas del mismo estado: dos elementos de audio
  terminan con dos canciones sonando a la vez.
- Respetar `prefers-reduced-motion`: sin scroll suave y sin tilt.

---

## 6. Material del cliente

Vive en `Freelancer - Claude Active\Web\Nino_Plug-music-repertorio\`:

- Videos oficiales (`.mp4`, 25–40 MB cada uno) — **no van al repositorio**.
  Definir hospedaje (YouTube embebido o CDN) antes de la sección de videos.
- Fotos y el logo del cliente.
- Tipografías `Darkhusk.otf` y `MecaGothix.ttf` — revisar licencia antes de
  publicarlas en la web.
- Capturas de las referencias.

---

## 7. Entrega

Repositorio: <https://github.com/Yuber-X/Nino_Plug-music> (rama `main`).
**Commit y push al cerrar cada día de trabajo**, pedido de Yuber.
