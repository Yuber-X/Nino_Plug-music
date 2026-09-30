"""Agrega al dataset la lista de las 4 canciones de fondo que eligió el cliente."""
import io, json, re, urllib.request

ARTISTA = 1357803085
SALIDA = (r"C:\Users\lizar\Desktop\Yu\Work\Freelancer\Freelancer - Claude Code"
          r"\projects\Nino_Plug-music\apps\web\src\datos\artista.ts")

# El orden lo fijó el cliente el 2026-09-30.
ELEGIDAS = ["CONMIGO ES MEJOR", "24/7", "Young G", "BEBA"]

with urllib.request.urlopen(
        f"https://itunes.apple.com/lookup?id={ARTISTA}&entity=song&limit=200") as r:
    datos = json.load(r)

temas = [t for t in datos["results"] if t.get("wrapperType") == "track"]

def buscar(nombre):
    exacto = [t for t in temas if (t.get("trackName") or "").lower() == nombre.lower()]
    if exacto:
        return exacto[0]
    raise SystemExit(f"No aparece «{nombre}» en el catálogo")

fondo = []
for nombre in ELEGIDAS:
    t = buscar(nombre)
    fondo.append({
        "id": t["trackId"],
        "titulo": t["trackName"],
        "lanzamiento": (t.get("releaseDate") or "")[:10],
        "genero": t.get("primaryGenreName"),
        "duracionMs": t.get("trackTimeMillis"),
        "arte": (t.get("artworkUrl100") or "").replace("100x100bb", "1000x1000bb"),
        "adelanto": t.get("previewUrl"),
        "apple": t.get("trackViewUrl"),
    })

bloque = """
/**
 * Las cuatro que suenan de fondo, en el orden que pidió el cliente
 * (2026-09-30): al terminar la cuarta vuelve a la primera.
 *
 * Son los mismos adelantos de 30 s del catálogo: sirven para armar el paso de
 * una canción a la otra, no para publicar.
 */
export const fondo: Tema[] = """ + json.dumps(fondo, ensure_ascii=False, indent=2).replace('"', "'") + ";\n"

for clave in ("id", "titulo", "lanzamiento", "genero", "duracionMs", "arte", "adelanto", "apple"):
    bloque = bloque.replace(f"'{clave}':", f"{clave}:")

s = io.open(SALIDA, encoding="utf-8").read()
marca = "\n/**\n * Las cuatro que suenan de fondo"
if marca in s:
    s = s[: s.index(marca)]
io.open(SALIDA, "w", encoding="utf-8", newline="\n").write(s.rstrip() + "\n" + bloque)

print("ok")
for t in fondo:
    print("  ", t["titulo"], "|", t["lanzamiento"], "|", round(t["duracionMs"] / 1000), "s")
