Lista de pistas del reproductor embebido. Cada fila: índice en `mono`, nombre en `body` semi-negrita, colaboradores/estado en `body-sm`, tiempo en `mono`/`stat`, botón circular play/pausa (`radius-full`). La fila en reproducción se resalta con fondo sólido `wine-700` — es la única fila con fondo de color a la vez.

**El consumidor provee:** la pista activa, el progreso de tiempo, y el estado play/pausa del botón circular.

**Uso:**
- Solo una fila puede estar en estado `active` a la vez.
- El botón circular es la única forma circular fuera del loader — coherente con `radius-full` reservado a controles de reproducción.
- El texto sobre `wine-700` es siempre `bone-100` (11.8:1), nunca `ash-300` u otro tono más apagado ahí — el fondo ya cambió, no hace falta bajar la jerarquía del texto también.

**No hacer:** iconos de "me gusta" o contadores de reproducciones sin que el cliente los pida — no es un reproductor social, es la vitrina de un lanzamiento.
