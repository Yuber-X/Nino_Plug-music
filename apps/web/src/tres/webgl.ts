/** ¿Hay WebGL en esta máquina? */
export function hayWebGL(): boolean {
  try {
    const lienzo = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (lienzo.getContext('webgl2') || lienzo.getContext('webgl')),
    );
  } catch {
    return false;
  }
}
