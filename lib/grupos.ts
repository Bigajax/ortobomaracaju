/**
 * Grupos de categorias (uma porta que junta duas categorias do catálogo).
 * A Ortobom Aracaju não precisa de nenhum por enquanto: as quatro
 * categorias são portas diretas. O mecanismo fica para quando precisar.
 */
export const GRUPOS: Record<string, { nome: string; categorias: string[] }> = {};

export function categoriasDoGrupo(slug: string): string[] | null {
  return GRUPOS[slug]?.categorias ?? null;
}
