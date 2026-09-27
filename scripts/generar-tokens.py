"""Genera tokens.css desde design-system/tokens.json.

El sistema de diseño es la fuente de verdad: si se toca un color, se toca ahí y
se vuelve a correr esto, en vez de tener los valores tipeados en el CSS.
"""
import io, json

RAIZ = r"C:\Users\lizar\Desktop\Yu\Work\Freelancer\Freelancer - Claude Code\projects\Nino_Plug-music"
d = json.load(io.open(RAIZ + r"\design-system\tokens.json", encoding="utf-8"))

lineas = [
    "/* GENERADO desde design-system/tokens.json — no editar a mano.",
    " * Regenerar con scripts/generar-tokens.py cuando cambie el sistema. */",
    ":root {",
]

lineas.append("  /* Color */")
for t in d["color"]["tokens"]:
    lineas.append(f"  --{t['name']}: {t['value']};")

lineas.append("")
lineas.append("  /* Tipografía */")
for clave, valor in d["type"]["families"].items():
    lineas.append(f"  --fuente-{clave}: {valor};")

for grupo in d["type"]["groups"]:
    for e in grupo["styles"]:
        nombre = e["name"]
        lineas.append(f"  --{nombre}-size: {e['fontSize']};")
        lineas.append(f"  --{nombre}-line: {e['lineHeight']};")
        if e.get("letterSpacing"):
            lineas.append(f"  --{nombre}-tracking: {e['letterSpacing']};")

lineas.append("")
lineas.append("  /* Espaciado */")
for t in d["spacing"]["tokens"]:
    lineas.append(f"  --{t['name']}: {t['value']};")

lineas.append("")
lineas.append("  /* Radios */")
for t in d["radius"]["tokens"]:
    lineas.append(f"  --{t['name']}: {t['value']};")

lineas.append("")
lineas.append("  /* Sombras */")
for t in d["shadow"]["tokens"]:
    lineas.append(f"  --{t['name']}: {t['value']};")

lineas.append("}")

salida = RAIZ + r"\apps\web\src\estilos\tokens.css"
io.open(salida, "w", encoding="utf-8", newline="\n").write("\n".join(lineas) + "\n")
print("ok", salida, len(lineas), "lineas")
