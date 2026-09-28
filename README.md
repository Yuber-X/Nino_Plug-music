# Niño Plug — portafolio de Skinny Xander

Sitio del artista urbano dominicano **Skinny Xander**: trap, rap y dembow.
One-page oscuro con entrada por click, portada animada, discografía con
reproductor, portafolio visual y biografía.

## Correr el proyecto

```powershell
npm install        # una sola vez, en la raíz
npm run dev        # web  -> http://localhost:5173
npm run dev:api    # API  -> http://localhost:3000
```

`http://localhost:5173/?entrar` salta la puerta de entrada mientras se trabaja.

> Node 20.19+ o 22.12+. Con 20.15 Vite avisa en cada arranque, pero funciona.

## Estructura

```
apps/web            Vite + React + TypeScript (three.js listo para la portada)
  src/secciones     Hero, Música, Videos, Sobre, Pie
  src/componentes   Intro, Nav, MiniReproductor
  src/ganchos       useReproductor (un solo <audio> para todo el sitio)
  src/datos         catálogo del artista (generado, ver CLAUDE.md §4)
  src/estilos       tokens.css (generado) + global.css
apps/api            NestJS — suscripciones y contacto
design-system       tokens.json, componentes y texturas: la fuente de verdad
reference           el prototipo HTML original, como referencia de comportamiento
scripts             generar-tokens.py
```

## Antes de publicar

- [ ] Reemplazar los adelantos de 30 s por los audios del cliente
- [ ] Biografía real (la actual es borrador y se ve marcada)
- [ ] Enlace de Spotify
- [ ] Definir hospedaje de los videos oficiales
- [ ] Revisar licencia de las tipografías Darkhusk y MecaGothix
- [ ] Portadas: varias son fotos claras — revisar con el cliente cuáles van al sitio

Detalle de decisiones y convenciones: [`CLAUDE.md`](CLAUDE.md).
