const codigosUnicos = new Set();

export function validarCodigo(codigo) {
  if (!codigo || codigosUnicos.has(codigo)) {
    return '';
  }
  codigosUnicos.add(codigo);
  return codigo;
}
