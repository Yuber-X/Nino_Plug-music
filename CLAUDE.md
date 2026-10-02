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

### Los tres nombres (resuelto por Yuber, 2026-09-28)

| Nombre | Qué es | Dónde aparece |
|---|---|---|
| **Skinny Xander** | El artista | **En todo el sitio**: portada 3D, barra, pie, títulos, metadatos |
| **Money One 1** | El sello / la marca | Como crédito: bajo el nombre en la barra y en el pie |
| **nino-plug** | Nombre interno del proyecto y del repositorio | **No se muestra en el sitio** |

El nombre que se lee es siempre el del artista; el sello acompaña, no compite.
Nada de "Niño Plug" queda visible de cara al público.

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

## 2.1. La portada en 3D

El nombre del artista es geometría extruida de verdad (`src/tres/`), no texto
con degradado:

- **La tipografía se lee del `.ttf`** con `opentype.js` y se convierte a
  `ExtrudeGeometry` (`geometriaTexto.ts`). `Text3D` de drei se descartó porque
  exige el formato `typeface.json`, que habría que regenerar cada vez que el
  cliente cambie de tipografía. Así, el día que entregue la suya (Darkhusk,
  MecaGothix) se cambia una ruta.
- **El ambiente son `Lightformer`s propios**, no un HDRI de un CDN: el reflejo
  queda controlado (blanco duro + vino del sistema) y el sitio no depende de un
  servidor ajeno. El grueso del reflejo tiene que ser BLANCO — con vino de
  frente las letras se ven pintadas de rojo, no de metal.
- **Se carga aparte** (`lazy`): three.js + drei son 1.2 MB contra 260 KB del
  resto. La página aparece completa de entrada y el motor llega mientras el
  visitante está en la puerta. En una máquina sin WebGL no se descarga nunca.
- **Hay respaldo en CSS** (el título del prototipo) para máquinas sin WebGL y
  para quien activó "reducir movimiento", y el nombre siempre está en el HTML
  aunque la portada sea un canvas — si no, para Google el sitio no dice quién
  es el artista.

---

## 2.1.1. La tipografía del título

El cliente quiere letra **death metal**. Darkhusk era la elegida, pero su
licencia prohíbe el uso comercial. El cliente descartó Eater ("no me gusta esa
fuente"), así que el título usa **Unifraktur Cook** y quedan las otras cargadas
para comparar en vivo:

| `?fuente=` | Tipografía | Licencia | Pinta |
|---|---|---|---|
| `cook` *(la actual)* | Unifraktur Cook | OFL, libre | Blackletter gruesa, de portada de metal |
| `maguntia` | Unifraktur Maguntia | OFL, libre | Blackletter clásica, más fina |
| `rocker` | New Rocker | OFL, libre | Gótica de remates filosos |
| `metalmania` | Metal Mania | OFL, libre | Trazo rugoso de banda |
| `nosifer` | Nosifer | OFL, libre | Goteada, de terror |
| `eater` | Eater | OFL, libre | Púas (descartada por el cliente) |
| `pirata` | Pirata One | OFL, libre | Gótica / blackletter |
| `lodger` | Jolly Lodger | OFL, libre | Flaca, de cartel viejo |

OFL (SIL Open Font License) permite usarlas en un sitio comercial sin pagar y
sin pedir permiso.

## 2.2. Pantalla de carga y entrada (2026-09-29)

La carga no es una barra decorativa: mide descargas reales (los clips del
fondo, la tipografía 3D, las portadas y el primer adelanto de audio). Tiene un
piso de ~2,6 s porque con todo en caché la barra llega a 100% en un parpadeo y
la animación no se ve.

- **Dibuja un cuadrado alrededor del vinilo** (rehecho el 2026-09-30): cada
  lado es un 25%. Se traza una línea blanca de izquierda a derecha, al llegar
  al 25% el cuadro gira 90° para que el lado siguiente quede arriba y **la
  línea ya trazada se queda puesta** y gira con él. Al 100% el cuadrado está
  cerrado, aparece la portada detrás del disco y el conjunto se lee como la
  cubierta.
- Por eso los lados se dibujan en el orden `top → left → bottom → right`: con
  el giro en sentido del reloj, el que queda arriba en cada vuelta es el
  anterior en sentido contrario. Cada uno crece hacia donde, ya girado, se ve
  como "de izquierda a derecha" en pantalla.
- En el centro del vinilo va el **logo de Money One 1**
  (`public/marca/money-one-1.jpg`), no la portada del disco.
- Junto al puntero se lee `loading...` y al terminar `click para continuar`.
  Ese click es además el gesto que el navegador exige para dejar sonar audio:
  por eso la música entra ahí, **subiendo de a poco** (`entrarSuave`).
- `?carga=0.35` congela la barra en ese punto para poder trabajar el diseño.

## 2.3. El fondo de la portada

Tres recortes de 8 s de los videos oficiales (*24/7*, *Tengo que ganar* y
*Young Gs* —este desde 0:43, que es el trozo que eligió el cliente—), sin
audio, 3,8 MB los tres, en bucle alternado. El 2026-09-30 se subió el brillo
(`brightness(.5)` y la capa oscura al 56%): en la primera versión el cliente
directamente no distinguía los clips. El cliente los pidió "como gif": se
hicieron en MP4 porque un gif del mismo trozo pesa veinte veces más y se ve
peor. Se recortan con ffmpeg:

```powershell
ffmpeg -ss 15 -i "24 7 (Video Oficial).mp4" -t 8 -an ^
  -vf "scale=1280:-2,fps=24" -c:v libx264 -preset slow -crf 30 ^
  -pix_fmt yuv420p -movflags +faststart apps/web/public/clips/247.mp4
```

Van al repositorio a propósito (hay una excepción en `.gitignore`): el sitio no
arranca sin ellos y pesan menos que una foto.


## 2.4. La música de fondo (2026-09-30)

Cuatro canciones en bucle, en el orden que fijó el cliente: **Conmigo es mejor
→ 24/7 → Young G → BEBA** (`datos/artista.ts`, bloque `fondo`, generado por
`scripts/generar-fondo.py`).

- El paso de una a otra es un **cruce de 4 segundos**: la siguiente arranca
  mientras la anterior baja, con curva de raíz cuadrada (igual potencia). Con
  una rampa lineal las dos quedan al 50% en el medio y se oye un bajón.
- La página nunca queda en silencio salvo que el visitante pause.
- El mini reproductor **no muestra el contador de minutos**: delataba que lo
  que suena son adelantos de 30 s.
- Tocar un tema de la discografía no rompe el bucle: suena ese y al terminar la
  lista sigue por donde iba.

## 2.5. Modo celular de la portada (2026-09-30, captura "Cell 1")

Por debajo de 720 px cambia el orden con `order`, no el HTML: el dato del
sencillo sube arriba del nombre y el botón "Ver Spotify" queda pegado debajo.
El título 3D **no reacciona al toque** —se pasea solo en círculos suaves— y el
canvas va con `pointer-events:none`, así el dedo siempre hace scroll.

⚠ El canvas del título se ancla con `width:calc(100% + var(--sangria)*2)` y
margen negativo. Con `100vw` el documento quedaba 48 px más ancho que la
ventana y en celular se veía todo corrido hacia la derecha.


## 2.6. El botón "Ver Spotify" (2026-10-02)

`componentes/BotonSlime.tsx`. Dos cosas distintas, las dos pedidas por el
cliente:

- **Con el mouse encima**, del charco de abajo se levantan gotas que SUBEN y no
  vuelven ("como si el viento se las llevara"). Las gotas **se funden** entre
  ellas y con el charco, con cuello y todo — la referencia que mandó el cliente
  es `slime.jpg` (2026-10-02), un metaball clásico. Al chocar, dos gotas se
  hacen UNA más gorda: el radio nuevo conserva el área (√(r₁²+r₂²)), porque
  sumar radios daría una gota enorme de la nada. Algunas rebotan contra las
  paredes entre 1 y 3 veces (al azar). El color rota entre cuatro neones
  —verde, rojo, azul, amarillo— mezclándose, nunca saltando.
- **Al hacer clic**, el botón sale girando sobre su eje **horizontal** (desde
  arriba, no de costado: el cliente fue explícito) como un cartel al que le
  dispararon: **tres vueltas enteras**, enseñando una y otra vez el reverso
  blanco con *Money One 1* y el frente, **perdiendo fuerza en cada vuelta**
  hasta quedar quieto justo donde empezó (1080° = tres vueltas, así que el
  final ES la posición de siempre y al quitar la clase no hay salto).
  **Spotify se abre recién cuando el giro terminó** (2,6 s): con la pestaña
  abriéndose al instante, el efecto no se llegaba a ver.
  La curva del frenado no es la más abrupta a propósito: con un frenado muy
  violento la primera vuelta es un borrón y las dos últimas se quedan casi
  quietas de frente, así que el reverso pasa sin que se alcance a leer.

Detalles que no se ven pero importan:

- El slime se dibuja en un `<canvas>`, no con `<div>`s: son decenas de gotas a
  la vez y cada una como elemento del DOM obligaría a recalcular la maqueta 60
  veces por segundo.
- **La fusión la hace un filtro SVG** (`#slimeGoo`), no el canvas: desenfoca y
  después endurece el alfa con una `feColorMatrix`. Donde dos círculos
  desenfocados se tocan, la suma de alfas pasa el umbral y aparece el cuello
  que los une. Es el truco clásico de metaballs y cuesta muchísimo menos que
  calcular la superficie implícita en cada cuadro.
- Por eso todo lo que se toca se pinta **del mismo color**: con dos tonos, el
  cuello saldría partido al medio.
- El halo blanco va **después** del goo en la cadena de filtros
  (`filter:url(#slimeGoo) drop-shadow(...)`): antes, el umbral se lo comería.
- ⚠ **`window.open(url, '_blank', 'noopener')` devuelve `null` SIEMPRE**, aunque
  la pestaña se haya abierto perfecto — lo dice la especificación. Con la
  comprobación "si devolvió null es que lo bloquearon", el botón abría la
  pestaña nueva **y además** mandaba la actual a Spotify (reportado por el
  cliente el 2026-10-02). La protección de `noopener` se consigue igual
  anulando `opener` en la ventana devuelta, y así el valor vuelve a servir para
  saber si de verdad la bloquearon.
- `?slime` deja el efecto encendido sin mouse y `?slime=giro` lanza además el
  giro al cargar, para poder mirarlos en una captura (el hover y el clic no se
  fotografían). Misma familia que `?entrar` y `?carga`.
- Sigue siendo un `<a>` de verdad: se abre en otra pestaña con el botón del
  medio, se copia la dirección y lo lee un lector de pantalla. La vuelta es
  decoración y nunca retrasa el clic.
- Con `prefers-reduced-motion` no hay gotas ni vuelta.
- **En celular el slime no se apaga nunca** (pedido del cliente, 2026-10-02).
  En una pantalla táctil no hay "mouse encima": sin esto, el efecto no se vería
  jamás en el teléfono, que es donde el sitio se va a mirar más. Se detecta con
  `(hover: none), (pointer: coarse)` —la misma consulta que usa el título 3D
  para pasearse solo— y se escucha su cambio, porque el modo celular se prueba
  estirando la ventana. El `pointerleave` no apaga nada en táctil: un toque
  dispara enter y enseguida leave, y el botón quedaría pelado justo después de
  tocarlo.

## 2.7. La zona de interacción del título (2026-10-02)

El cliente reportó que al entrar, cuando el título da su vuelta, "se nota la
zona de interacción". Dos cambios:

- **El puntero se lee de la VENTANA, no del canvas.** Antes la inclinación
  usaba `estado.pointer`, que R3F calcula con los eventos del propio canvas:
  eso ataba el seguimiento del mouse a que el canvas recibiera eventos, y un
  canvas que recibe eventos es un rectángulo invisible que se come los clics de
  lo que tenga encima. Ahora el canvas va con `pointer-events:none` en TODAS
  las pantallas, puede ser tan grande como haga falta y el título reacciona
  aunque el mouse esté sobre el botón.
- **Durante la vuelta de entrada el texto se encoge un poco más** cuando está
  de canto (`1 - |sin(rotación)| * 0.22`): ahí es donde las puntas del texto
  arqueado se acercan a la cámara, la perspectiva las agranda y se veía el
  corte contra el borde del canvas. El canvas además creció (hasta 1800 px de
  ancho y 60vh de alto).

El canvas entra por debajo de lo que sigue con un margen inferior negativo, y
el relleno de la portada se achica en pantallas bajas: así el botón queda
dentro de la pantalla en un portátil de 1366x768, que es lo que el cliente
pidió el mismo día.

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
- **Dos** `<audio>` y un solo gancho (`ganchos/useReproductor.ts`). Eran uno
  hasta el 2026-09-30, cuando el cliente pidió que las canciones se crucen sin
  silencio: con un solo elemento hay que cambiarle el `src` y eso corta la que
  suena. Los dos viven dentro del gancho y solo uno es el activo, así que el
  riesgo de "dos canciones a la vez" sigue cubierto; la lista y el mini
  reproductor son dos vistas del mismo estado.
- Respetar `prefers-reduced-motion`: sin scroll suave y sin tilt.

---

## 6. Material del cliente

Vive en `Freelancer - Claude Active\Web\Nino_Plug-music-repertorio\`:

- Videos oficiales (`.mp4`, 25–40 MB cada uno) — **no van al repositorio**.
  Definir hospedaje (YouTube embebido o CDN) antes de la sección de videos.
- Fotos y el logo del cliente.
- 🔴 **`Darkhusk.otf` es SOLO PARA USO PERSONAL** (su licencia amenaza con una
  multa de US$999 por uso comercial). Se probó el 2026-09-29 y se reemplazó el
  2026-09-30: **no está en el repositorio** — subirla a un repositorio público
  sería redistribuirla. Vive en
  `Claude Active\Web\Nino_Plug-music-repertorio\Fuentes`; para compararla hay
  que copiarla a mano a `apps/web/public/fuentes/` y abrir `?fuente=darkhusk`.
  `MecaGothix.ttf` tampoco se usa; revisar su licencia antes de tocarla.
- Capturas de las referencias.

---

## 7. Entrega

Repositorio: <https://github.com/Yuber-X/Nino_Plug-music> (rama `main`).
**Commit y push al cerrar cada día de trabajo**, pedido de Yuber.
