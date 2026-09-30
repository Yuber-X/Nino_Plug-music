import * as THREE from 'three';
import opentype from 'opentype.js';

/**
 * Convierte texto en geometría 3D EXTRUIDA con la tipografía real del sistema
 * de diseño (Anton).
 *
 * POR QUÉ opentype.js Y NO Text3D de drei: Text3D necesita el formato
 * "typeface.json", que nadie tiene para Anton — habría que convertir la fuente
 * a mano y volver a convertirla cada vez que el cliente cambie de tipografía.
 * Acá se lee el .ttf directo, así que el día que entregue su fuente (Darkhusk,
 * MecaGothix) se cambia la ruta y listo.
 *
 * La otra alternativa —texto plano de troika con material metálico— se
 * descartó: sin espesor real no hay canto que refleje, y el canto es justo lo
 * que hace que las letras se vean de metal en la referencia que eligió el
 * cliente.
 */

let fuenteCargada: Promise<opentype.Font> | null = null;

export function cargarFuente(url: string): Promise<opentype.Font> {
  // Una sola descarga por sesión: el hero se re-monta en cada cambio en vivo de
  // Vite y bajar 170 KB en cada guardado es gratis para nadie.
  fuenteCargada ??= fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`No se pudo cargar la tipografía (${r.status})`);
      return r.arrayBuffer();
    })
    .then((buffer) => opentype.parse(buffer));
  return fuenteCargada;
}

export interface OpcionesTexto {
  /** Alto de las mayúsculas en unidades del mundo 3D. */
  tamano?: number;
  /** Espesor de la extrusión, relativo al tamaño. */
  espesor?: number;
  /** Suavizado de las curvas. Más segmentos = más triángulos. */
  segmentosCurva?: number;
  /**
   * Cuánto se arquea el texto, como en ascension.pegassi.be: 0 es recto y 1 es
   * una curva marcada. Las letras de los extremos suben y giran hacia el
   * centro, como si estuvieran pegadas a un arco.
   */
  arco?: number;
}

/**
 * Arma la geometría del texto, ya centrada en el origen.
 *
 * Centrarla acá y no en la escena importa: el título gira sobre su eje Y, y si
 * el origen queda en la primera letra, en vez de girar sobre sí mismo describe
 * un círculo enorme y se va de cuadro.
 */
export function geometriaDeTexto(
  fuente: opentype.Font,
  texto: string,
  { tamano = 1, espesor = 0.18, segmentosCurva = 8, arco = 0 }: OpcionesTexto = {},
): THREE.ExtrudeGeometry {
  // opentype trabaja en unidades de la fuente y con la Y hacia abajo; el mundo
  // 3D la tiene hacia arriba. Se dibuja a escala 1 y se corrige al final.
  const escala = tamano / fuente.unitsPerEm;
  const path = fuente.getPath(texto, 0, 0, fuente.unitsPerEm);

  const recorrido = new THREE.ShapePath();
  for (const c of path.commands) {
    switch (c.type) {
      case 'M':
        recorrido.moveTo(c.x, -c.y);
        break;
      case 'L':
        recorrido.lineTo(c.x, -c.y);
        break;
      case 'Q':
        recorrido.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y);
        break;
      case 'C':
        recorrido.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
        break;
      case 'Z':
        recorrido.currentPath?.closePath();
        break;
    }
  }

  // toShapes resuelve solo los contrapuntos: el hueco de la O, el de la A.
  const formas = recorrido.toShapes();

  const geometria = new THREE.ExtrudeGeometry(formas, {
    depth: (espesor * fuente.unitsPerEm) / 1,
    bevelEnabled: true,
    // Bisel generoso: en una cara plana el metal refleja lo mismo en toda su
    // superficie y el brillo no se ve moverse. El canto redondeado es el que
    // atrapa la luz y hace que el destello CORRA por el contorno de la letra
    // (2026-09-30).
    bevelThickness: fuente.unitsPerEm * 0.03,
    bevelSize: fuente.unitsPerEm * 0.028,
    bevelOffset: 0,
    bevelSegments: 5,
    curveSegments: segmentosCurva,
  });

  geometria.scale(escala, escala, escala);
  geometria.center();

  if (arco > 0) arquear(geometria, arco);

  geometria.computeVertexNormals();
  return geometria;
}

/**
 * Dobla la geometría sobre un arco.
 *
 * Se hace moviendo los vértices, no rotando la malla: cada letra tiene que
 * girar un poco MÁS que la anterior según lo lejos que esté del centro, que es
 * lo que hace que el texto se lea curvo y no simplemente inclinado. Rotar el
 * bloque entero lo dejaría recto y torcido, que es otra cosa.
 */
function arquear(geometria: THREE.ExtrudeGeometry, intensidad: number) {
  geometria.computeBoundingBox();
  const caja = geometria.boundingBox;
  if (!caja) return;

  const mitadAncho = Math.max(1e-6, (caja.max.x - caja.min.x) / 2);
  // Radio del arco: cuanto más intenso, más chico el radio y más pronunciada
  // la curva. El 2.6 sale de probar contra la referencia.
  const radio = mitadAncho / Math.max(0.001, intensidad * 0.9) * 2.6;

  const pos = geometria.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const angulo = v.x / radio;
    const distancia = radio - v.y;
    pos.setXYZ(
      i,
      Math.sin(angulo) * distancia,
      radio - Math.cos(angulo) * distancia,
      v.z,
    );
  }
  pos.needsUpdate = true;
  geometria.center();
}
